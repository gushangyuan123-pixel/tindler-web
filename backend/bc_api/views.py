from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect
from django.conf import settings
from django.views import View
from django.http import HttpResponse

from .models import User, BCMemberProfile, BCApplicantProfile, BCMatch, BCMessage, BCSwipe
from .serializers import (
    UserSerializer,
    BCMemberProfileSerializer,
    BCMemberProfileCreateSerializer,
    BCApplicantProfileSerializer,
    BCApplicantProfileCreateSerializer,
    BCMatchSerializer,
    BCMessageSerializer,
    BCSwipeSerializer,
)


class CurrentUserView(APIView):
    """Get current authenticated user info."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data

        # Include profile data if setup is complete
        if request.user.user_type == 'bc_member':
            try:
                profile = request.user.bc_member_profile
                data['profile'] = BCMemberProfileSerializer(profile).data
            except BCMemberProfile.DoesNotExist:
                pass
        elif request.user.user_type == 'applicant':
            try:
                profile = request.user.applicant_profile
                data['profile'] = BCApplicantProfileSerializer(profile).data
            except BCApplicantProfile.DoesNotExist:
                pass

        return Response(data)

    def patch(self, request):
        """Update user type (role selection)."""
        user_type = request.data.get('user_type')
        if user_type not in ['applicant', 'bc_member']:
            return Response(
                {'error': 'Invalid user_type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        request.user.user_type = user_type
        request.user.save()
        return Response(UserSerializer(request.user).data)


class BCMemberProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for BC member profiles."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BCMemberProfile.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return BCMemberProfileCreateSerializer
        return BCMemberProfileSerializer

    def create(self, request, *args, **kwargs):
        """Create BC member profile for current user."""
        # Check if user already has a profile
        if hasattr(request.user, 'bc_member_profile'):
            return Response(
                {'error': 'Profile already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's BC member profile."""
        try:
            profile = request.user.bc_member_profile
            return Response(BCMemberProfileSerializer(profile).data)
        except BCMemberProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class BCApplicantProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for applicant profiles."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BCApplicantProfile.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return BCApplicantProfileCreateSerializer
        return BCApplicantProfileSerializer

    def create(self, request, *args, **kwargs):
        """Create applicant profile for current user."""
        if hasattr(request.user, 'applicant_profile'):
            return Response(
                {'error': 'Profile already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's applicant profile."""
        try:
            profile = request.user.applicant_profile
            return Response(BCApplicantProfileSerializer(profile).data)
        except BCApplicantProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class DiscoverView(APIView):
    """Get profiles to swipe on based on user type."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get IDs of users already swiped on
        swiped_ids = BCSwipe.objects.filter(swiper=user).values_list('target_id', flat=True)

        if user.user_type == 'applicant':
            # Applicants see BC members
            # Check if applicant is already matched
            try:
                if user.applicant_profile.has_been_matched:
                    return Response({'profiles': [], 'message': 'Already matched'})
            except BCApplicantProfile.DoesNotExist:
                return Response(
                    {'error': 'Profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            profiles = BCMemberProfile.objects.exclude(
                user_id__in=swiped_ids
            ).select_related('user')
            serializer = BCMemberProfileSerializer(profiles, many=True)

        elif user.user_type == 'bc_member':
            # BC members see applicants who haven't been matched yet
            profiles = BCApplicantProfile.objects.filter(
                has_been_matched=False
            ).exclude(
                user_id__in=swiped_ids
            ).select_related('user')
            serializer = BCApplicantProfileSerializer(profiles, many=True)

        else:
            return Response(
                {'error': 'User type not set'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({'profiles': serializer.data})


class SwipeView(APIView):
    """Handle swiping (like/pass)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        target_id = request.data.get('target_id')
        direction = request.data.get('direction')  # 'like' or 'pass'

        if not target_id or direction not in ['like', 'pass']:
            return Response(
                {'error': 'Invalid request'},
                status=status.HTTP_400_BAD_REQUEST
            )

        target_user = get_object_or_404(User, id=target_id)

        # Create swipe record
        swipe, created = BCSwipe.objects.get_or_create(
            swiper=user,
            target=target_user,
            defaults={'direction': direction}
        )

        if not created:
            return Response(
                {'error': 'Already swiped on this profile'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for match (only on likes)
        match_created = False
        match_data = None

        if direction == 'like':
            # Check if there's a mutual like
            mutual_like = BCSwipe.objects.filter(
                swiper=target_user,
                target=user,
                direction='like'
            ).exists()

            if mutual_like:
                # Create match
                if user.user_type == 'applicant':
                    applicant_profile = user.applicant_profile
                    bc_member_profile = target_user.bc_member_profile
                else:
                    applicant_profile = target_user.applicant_profile
                    bc_member_profile = user.bc_member_profile

                # Check if applicant is already matched
                if not applicant_profile.has_been_matched:
                    match = BCMatch.objects.create(
                        applicant=applicant_profile,
                        bc_member=bc_member_profile
                    )
                    # Mark applicant as matched
                    applicant_profile.has_been_matched = True
                    applicant_profile.save()

                    match_created = True
                    match_data = BCMatchSerializer(match).data

        return Response({
            'swipe': BCSwipeSerializer(swipe).data,
            'match_created': match_created,
            'match': match_data
        })


class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing matches."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BCMatchSerializer

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'applicant':
            try:
                return BCMatch.objects.filter(applicant=user.applicant_profile)
            except BCApplicantProfile.DoesNotExist:
                return BCMatch.objects.none()
        elif user.user_type == 'bc_member':
            try:
                return BCMatch.objects.filter(bc_member=user.bc_member_profile)
            except BCMemberProfile.DoesNotExist:
                return BCMatch.objects.none()
        return BCMatch.objects.none()


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for chat messages within a match."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BCMessageSerializer

    def get_queryset(self):
        match_id = self.kwargs.get('match_id')
        return BCMessage.objects.filter(match_id=match_id)

    def create(self, request, *args, **kwargs):
        match_id = self.kwargs.get('match_id')
        match = get_object_or_404(BCMatch, id=match_id)

        # Verify user is part of this match
        user = request.user
        is_participant = (
            (user.user_type == 'applicant' and match.applicant.user == user) or
            (user.user_type == 'bc_member' and match.bc_member.user == user)
        )

        if not is_participant:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        message = BCMessage.objects.create(
            match=match,
            sender=user,
            content=request.data.get('content', '')
        )

        return Response(
            BCMessageSerializer(message).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['post'])
    def mark_read(self, request, match_id=None):
        """Mark all messages in match as read for current user."""
        match = get_object_or_404(BCMatch, id=match_id)
        BCMessage.objects.filter(match=match).exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'ok'})


class ResetProfileView(APIView):
    """Reset user profile (for logout/switch role functionality)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        # Delete existing profiles
        BCMemberProfile.objects.filter(user=user).delete()
        BCApplicantProfile.objects.filter(user=user).delete()

        # Delete swipes
        BCSwipe.objects.filter(Q(swiper=user) | Q(target=user)).delete()

        # Reset user state
        user.user_type = None
        user.has_completed_setup = False
        user.save()

        return Response({'status': 'Profile reset successfully'})


class OAuthCallbackView(View):
    """
    Handle OAuth callback after Google authentication.
    Creates/gets auth token and redirects to frontend with token.
    """

    def get(self, request):
        # If user is authenticated after OAuth, create token and redirect
        if request.user.is_authenticated:
            # Get or create token for the user
            token, _ = Token.objects.get_or_create(user=request.user)

            # Redirect to frontend with token
            frontend_url = settings.FRONTEND_URL
            redirect_url = f"{frontend_url}/bc/auth-callback?token={token.key}"
            return redirect(redirect_url)

        # If not authenticated, redirect to login
        return redirect(f"{settings.FRONTEND_URL}/bc?error=auth_failed")

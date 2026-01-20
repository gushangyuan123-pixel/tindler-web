from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.core.exceptions import ImmediateHttpResponse
from django.http import HttpResponseForbidden


class BerkeleyEmailAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter to restrict Google OAuth to @berkeley.edu emails only.
    Also checks whitelist for BC member auto-assignment.
    """

    def pre_social_login(self, request, sociallogin):
        """
        Called after Google authentication but before the login is completed.
        Reject non-Berkeley emails and check whitelist for existing users.
        """
        email = sociallogin.account.extra_data.get('email', '')

        if not email.endswith('@berkeley.edu'):
            raise ImmediateHttpResponse(
                HttpResponseForbidden(
                    'Only @berkeley.edu email addresses are allowed. '
                    'Please sign in with your Berkeley email.'
                )
            )

        # For existing users, check whitelist and update user_type if needed
        if sociallogin.is_existing:
            user = sociallogin.user
            from .models import BCMemberWhitelist
            if user.user_type != 'bc_member' and BCMemberWhitelist.objects.filter(email__iexact=email).exists():
                user.user_type = 'bc_member'
                user.save()

    def save_user(self, request, sociallogin, form=None):
        """
        Save user with data from Google OAuth.
        Check whitelist and auto-assign BC member status if applicable.
        """
        user = super().save_user(request, sociallogin, form)

        # Extract data from Google
        extra_data = sociallogin.account.extra_data
        user.name = extra_data.get('name', '')
        user.photo_url = extra_data.get('picture', '')

        # Check if user is on BC member whitelist
        from .models import BCMemberWhitelist
        if BCMemberWhitelist.objects.filter(email__iexact=user.email).exists():
            user.user_type = 'bc_member'

        user.save()

        return user

    def populate_user(self, request, sociallogin, data):
        """
        Called when connecting an existing user to a social account.
        Check whitelist for existing users too.
        """
        user = super().populate_user(request, sociallogin, data)
        return user

    def authentication_error(self, request, provider_id, error=None, exception=None, extra_context=None):
        """Handle authentication errors gracefully."""
        return super().authentication_error(request, provider_id, error, exception, extra_context)

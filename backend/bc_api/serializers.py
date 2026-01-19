from rest_framework import serializers
from .models import User, BCMemberProfile, BCApplicantProfile, BCMatch, BCMessage, BCSwipe


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'photo_url', 'user_type', 'has_completed_setup', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']


class BCMemberProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = BCMemberProfile
        fields = [
            'id', 'user', 'year', 'major', 'semesters_in_bc',
            'areas_of_expertise', 'availability', 'bio', 'project_experience',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BCMemberProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating BC member profiles."""
    name = serializers.CharField(write_only=True)
    photo_url = serializers.URLField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = BCMemberProfile
        fields = [
            'name', 'photo_url', 'year', 'major', 'semesters_in_bc',
            'areas_of_expertise', 'availability', 'bio', 'project_experience'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        name = validated_data.pop('name')
        photo_url = validated_data.pop('photo_url', '')

        # Update user info
        user.name = name
        if photo_url:
            user.photo_url = photo_url
        user.user_type = 'bc_member'
        user.has_completed_setup = True
        user.save()

        # Create profile
        profile = BCMemberProfile.objects.create(user=user, **validated_data)
        return profile

    def update(self, instance, validated_data):
        user = instance.user
        name = validated_data.pop('name', None)
        photo_url = validated_data.pop('photo_url', None)

        if name:
            user.name = name
        if photo_url:
            user.photo_url = photo_url
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class BCApplicantProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = BCApplicantProfile
        fields = [
            'id', 'user', 'role', 'why_bc', 'relevant_experience',
            'interests', 'has_been_matched', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'has_been_matched', 'created_at', 'updated_at']


class BCApplicantProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating applicant profiles."""
    name = serializers.CharField(write_only=True)
    photo_url = serializers.URLField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = BCApplicantProfile
        fields = ['name', 'photo_url', 'role', 'why_bc', 'relevant_experience', 'interests']

    def create(self, validated_data):
        user = self.context['request'].user
        name = validated_data.pop('name')
        photo_url = validated_data.pop('photo_url', '')

        # Update user info
        user.name = name
        if photo_url:
            user.photo_url = photo_url
        user.user_type = 'applicant'
        user.has_completed_setup = True
        user.save()

        # Create profile
        profile = BCApplicantProfile.objects.create(user=user, **validated_data)
        return profile

    def update(self, instance, validated_data):
        user = instance.user
        name = validated_data.pop('name', None)
        photo_url = validated_data.pop('photo_url', None)

        if name:
            user.name = name
        if photo_url:
            user.photo_url = photo_url
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class BCMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)

    class Meta:
        model = BCMessage
        fields = ['id', 'sender', 'sender_name', 'content', 'sent_at', 'is_read']
        read_only_fields = ['id', 'sender', 'sender_name', 'sent_at']


class BCMatchSerializer(serializers.ModelSerializer):
    applicant = BCApplicantProfileSerializer(read_only=True)
    bc_member = BCMemberProfileSerializer(read_only=True)
    messages = BCMessageSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = BCMatch
        fields = ['id', 'applicant', 'bc_member', 'matched_at', 'status', 'status_display', 'confirmed_at', 'messages']
        read_only_fields = ['id', 'matched_at', 'status', 'confirmed_at']


class BCSwipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BCSwipe
        fields = ['id', 'target', 'direction', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        swiper = self.context['request'].user
        validated_data['swiper'] = swiper
        return super().create(validated_data)

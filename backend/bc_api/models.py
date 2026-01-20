from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model using email for authentication."""
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    photo_url = models.URLField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    # BC-specific fields
    user_type = models.CharField(
        max_length=20,
        choices=[('applicant', 'Applicant'), ('bc_member', 'BC Member')],
        blank=True,
        null=True
    )
    has_completed_setup = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class BCMemberProfile(models.Model):
    """Profile for BC members who can offer coffee chats.

    BC Member profiles can ONLY be created by admins through the Django admin panel.
    This prevents non-BC members from impersonating actual members.
    """
    YEAR_CHOICES = [
        ('Freshman', 'Freshman'),
        ('Sophomore', 'Sophomore'),
        ('Junior', 'Junior'),
        ('Senior', 'Senior'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='bc_member_profile')
    year = models.CharField(max_length=20, choices=YEAR_CHOICES)
    major = models.CharField(max_length=100)
    semesters_in_bc = models.IntegerField(default=1)
    areas_of_expertise = models.JSONField(default=list)  # e.g., ["Strategy", "Operations", "Tech"]
    availability = models.CharField(max_length=100)  # e.g., "Weekday mornings"
    bio = models.TextField()
    project_experience = models.TextField(blank=True)

    # Admin approval - BC members must be verified by admin
    is_approved = models.BooleanField(default=False, help_text="Admin must approve before member appears in discovery")
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_bc_members'
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        status = "✓" if self.is_approved else "⏳"
        return f"{status} {self.user.name} - BC Member"


class BCApplicantProfile(models.Model):
    """Profile for applicants seeking coffee chats."""
    ROLE_CHOICES = [
        ('Freshman', 'Freshman'),
        ('Sophomore', 'Sophomore'),
        ('Junior', 'Junior'),
        ('Senior', 'Senior'),
        ('MBA1', 'MBA1'),
        ('MBA2', 'MBA2'),
        ('Graduate', 'Graduate'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='applicant_profile')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    why_bc = models.TextField()  # "Why do you want to join BC?"
    relevant_experience = models.TextField()
    interests = models.JSONField(default=list)  # e.g., ["Strategy", "Finance", "Healthcare"]
    has_been_matched = models.BooleanField(default=False)  # True once matched (can only match once)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.name} - Applicant"


class BCMatch(models.Model):
    """A coffee chat match between an applicant and BC member.

    Matches are created when both parties swipe right, but require
    admin confirmation before the coffee chat is finalized.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Admin Approval'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
        ('completed', 'Coffee Chat Completed'),
    ]

    applicant = models.ForeignKey(
        BCApplicantProfile,
        on_delete=models.CASCADE,
        related_name='matches'
    )
    bc_member = models.ForeignKey(
        BCMemberProfile,
        on_delete=models.CASCADE,
        related_name='matches'
    )
    matched_at = models.DateTimeField(auto_now_add=True)

    # Admin confirmation
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    confirmed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='confirmed_matches'
    )
    confirmed_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True, help_text="Internal notes about this match")

    class Meta:
        unique_together = ('applicant', 'bc_member')
        ordering = ['-matched_at']
        verbose_name_plural = 'BC Matches'

    def __str__(self):
        status_icons = {'pending': '⏳', 'confirmed': '✓', 'rejected': '✗', 'completed': '☕'}
        icon = status_icons.get(self.status, '')
        return f"{icon} {self.applicant.user.name} ↔ {self.bc_member.user.name}"


class BCMessage(models.Model):
    """Messages within a coffee chat match."""
    match = models.ForeignKey(BCMatch, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['sent_at']

    def __str__(self):
        return f"Message from {self.sender.name} at {self.sent_at}"


class BCSwipe(models.Model):
    """Track swipes (likes/passes) for matching logic."""
    DIRECTION_CHOICES = [
        ('like', 'Like'),
        ('pass', 'Pass'),
    ]

    swiper = models.ForeignKey(User, on_delete=models.CASCADE, related_name='swipes')
    target = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_swipes')
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('swiper', 'target')

    def __str__(self):
        return f"{self.swiper.name} {self.direction}d {self.target.name}"


class BCMemberWhitelist(models.Model):
    """
    Whitelist of approved BC member emails.

    Admin adds emails here. When a user logs in via Google OAuth,
    if their email is on this list, they're automatically recognized
    as a BC member and can complete their profile setup.
    """
    email = models.EmailField(unique=True, help_text="Berkeley email of the BC member")
    name = models.CharField(max_length=255, blank=True, help_text="Optional: BC member's name for reference")
    added_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='whitelist_entries_added'
    )
    added_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, help_text="Optional notes about this member")

    class Meta:
        verbose_name = "BC Member Whitelist Entry"
        verbose_name_plural = "BC Member Whitelist"
        ordering = ['-added_at']

    def __str__(self):
        if self.name:
            return f"{self.name} ({self.email})"
        return self.email

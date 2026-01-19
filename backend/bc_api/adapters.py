from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
from django.http import HttpResponseForbidden


class BerkeleyEmailAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter to restrict Google OAuth to @berkeley.edu emails only.
    """

    def pre_social_login(self, request, sociallogin):
        """
        Called after Google authentication but before the login is completed.
        Reject non-Berkeley emails.
        """
        email = sociallogin.account.extra_data.get('email', '')

        if not email.endswith('@berkeley.edu'):
            raise ImmediateHttpResponse(
                HttpResponseForbidden(
                    'Only @berkeley.edu email addresses are allowed. '
                    'Please sign in with your Berkeley email.'
                )
            )

    def save_user(self, request, sociallogin, form=None):
        """
        Save user with data from Google OAuth.
        """
        user = super().save_user(request, sociallogin, form)

        # Extract data from Google
        extra_data = sociallogin.account.extra_data
        user.name = extra_data.get('name', '')
        user.photo_url = extra_data.get('picture', '')
        user.save()

        return user

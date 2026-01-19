"""
URL configuration for Tindler BC Coffee Chat backend.
"""
from django.contrib import admin
from django.urls import path, include
from bc_api.views import OAuthCallbackView

urlpatterns = [
    path('admin/', admin.site.urls),

    # BC API endpoints
    path('api/', include('bc_api.urls')),

    # Authentication endpoints (dj-rest-auth)
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),

    # OAuth callback - redirects to frontend with token
    path('auth/callback/', OAuthCallbackView.as_view(), name='oauth-callback'),

    # Social authentication (Google OAuth)
    path('accounts/', include('allauth.urls')),
]

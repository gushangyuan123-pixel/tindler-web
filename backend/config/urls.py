"""
URL configuration for Tindler BC Coffee Chat backend.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
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

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

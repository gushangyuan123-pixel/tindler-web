from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'bc-members', views.BCMemberProfileViewSet, basename='bc-member')
router.register(r'applicants', views.BCApplicantProfileViewSet, basename='applicant')
router.register(r'matches', views.MatchViewSet, basename='match')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    path('discover/', views.DiscoverView.as_view(), name='discover'),
    path('swipe/', views.SwipeView.as_view(), name='swipe'),
    path('reset-profile/', views.ResetProfileView.as_view(), name='reset-profile'),
    path('matches/<int:match_id>/messages/', views.MessageViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='match-messages'),
    path('matches/<int:match_id>/messages/mark-read/', views.MessageViewSet.as_view({
        'post': 'mark_read'
    }), name='mark-messages-read'),
]

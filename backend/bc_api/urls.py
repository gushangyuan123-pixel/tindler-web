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
    path('upload-photo/', views.PhotoUploadView.as_view(), name='upload-photo'),
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

    # BC Member self-registration with invite code
    path('bc-member/join/', views.BCMemberJoinView.as_view(), name='bc-member-join'),
    path('bc-member/validate-code/', views.ValidateInviteCodeView.as_view(), name='validate-invite-code'),

    # Admin endpoints
    path('admin/check/', views.AdminCheckView.as_view(), name='admin-check'),
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('admin/members/', views.AdminAllMembersView.as_view(), name='admin-all-members'),
    path('admin/members/pending/', views.AdminPendingMembersView.as_view(), name='admin-pending-members'),
    path('admin/members/<int:member_id>/approve/', views.AdminApproveMemberView.as_view(), name='admin-approve-member'),
    path('admin/members/create/', views.AdminCreateMemberView.as_view(), name='admin-create-member'),
    path('admin/applicants/', views.AdminAllApplicantsView.as_view(), name='admin-all-applicants'),
    path('admin/matches/', views.AdminAllMatchesView.as_view(), name='admin-all-matches'),
    path('admin/matches/<int:match_id>/approve/', views.AdminApproveMatchView.as_view(), name='admin-approve-match'),
]

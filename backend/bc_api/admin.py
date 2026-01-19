from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, BCMemberProfile, BCApplicantProfile, BCMatch, BCMessage, BCSwipe


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'name', 'user_type', 'has_completed_setup', 'is_staff')
    list_filter = ('user_type', 'has_completed_setup', 'is_staff', 'is_active')
    search_fields = ('email', 'name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'photo_url')}),
        ('BC Info', {'fields': ('user_type', 'has_completed_setup')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )


@admin.register(BCMemberProfile)
class BCMemberProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'year', 'major', 'semesters_in_bc', 'availability')
    list_filter = ('year', 'semesters_in_bc')
    search_fields = ('user__email', 'user__name', 'major')


@admin.register(BCApplicantProfile)
class BCApplicantProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'has_been_matched')
    list_filter = ('role', 'has_been_matched')
    search_fields = ('user__email', 'user__name')


@admin.register(BCMatch)
class BCMatchAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'bc_member', 'matched_at')
    list_filter = ('matched_at',)
    search_fields = ('applicant__user__name', 'bc_member__user__name')


@admin.register(BCMessage)
class BCMessageAdmin(admin.ModelAdmin):
    list_display = ('match', 'sender', 'content', 'sent_at', 'is_read')
    list_filter = ('is_read', 'sent_at')
    search_fields = ('sender__name', 'content')


@admin.register(BCSwipe)
class BCSwipeAdmin(admin.ModelAdmin):
    list_display = ('swiper', 'target', 'direction', 'created_at')
    list_filter = ('direction', 'created_at')
    search_fields = ('swiper__name', 'target__name')

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils import timezone
from django.utils.html import format_html
from .models import User, BCMemberProfile, BCApplicantProfile, BCMatch, BCMessage, BCSwipe
from .emails import send_match_confirmed_notification


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
    list_display = ('user', 'year', 'major', 'semesters_in_bc', 'availability', 'approval_status', 'created_at')
    list_filter = ('is_approved', 'year', 'semesters_in_bc')
    search_fields = ('user__email', 'user__name', 'major')
    readonly_fields = ('created_at', 'updated_at', 'approved_by', 'approved_at')
    actions = ['approve_members', 'revoke_approval']

    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Profile Info', {'fields': ('year', 'major', 'semesters_in_bc', 'areas_of_expertise', 'availability', 'bio', 'project_experience')}),
        ('Approval Status', {
            'fields': ('is_approved', 'approved_by', 'approved_at'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def approval_status(self, obj):
        if obj.is_approved:
            return format_html('<span style="color: green; font-weight: bold;">✓ Approved</span>')
        return format_html('<span style="color: orange; font-weight: bold;">⏳ Pending</span>')
    approval_status.short_description = 'Status'

    @admin.action(description='Approve selected BC members')
    def approve_members(self, request, queryset):
        count = 0
        for member in queryset.filter(is_approved=False):
            member.is_approved = True
            member.approved_by = request.user
            member.approved_at = timezone.now()
            # Also update the user record
            member.user.user_type = 'bc_member'
            member.user.has_completed_setup = True
            member.user.save()
            member.save()
            count += 1
        self.message_user(request, f'{count} BC member(s) approved successfully.')

    @admin.action(description='Revoke approval for selected BC members')
    def revoke_approval(self, request, queryset):
        count = queryset.filter(is_approved=True).update(
            is_approved=False,
            approved_by=None,
            approved_at=None
        )
        self.message_user(request, f'{count} BC member(s) approval revoked.')

    def save_model(self, request, obj, form, change):
        # Auto-approve if admin is creating/editing and checking the approved box
        if obj.is_approved and not obj.approved_by:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
            # Update user record
            obj.user.user_type = 'bc_member'
            obj.user.has_completed_setup = True
            obj.user.save()
        super().save_model(request, obj, form, change)


@admin.register(BCApplicantProfile)
class BCApplicantProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'has_been_matched', 'match_status', 'created_at')
    list_filter = ('role', 'has_been_matched')
    search_fields = ('user__email', 'user__name')
    readonly_fields = ('created_at', 'updated_at', 'has_been_matched')

    def match_status(self, obj):
        if obj.has_been_matched:
            match = BCMatch.objects.filter(applicant=obj).first()
            if match:
                if match.status == 'confirmed':
                    return format_html('<span style="color: green;">✓ Matched with {}</span>', match.bc_member.user.name)
                elif match.status == 'pending':
                    return format_html('<span style="color: orange;">⏳ Pending confirmation</span>')
            return format_html('<span style="color: blue;">Matched</span>')
        return format_html('<span style="color: gray;">Not matched</span>')
    match_status.short_description = 'Match Status'


@admin.register(BCMatch)
class BCMatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'applicant_name', 'bc_member_name', 'status_badge', 'matched_at', 'confirmed_at')
    list_filter = ('status', 'matched_at')
    search_fields = ('applicant__user__name', 'bc_member__user__name', 'applicant__user__email', 'bc_member__user__email')
    readonly_fields = ('matched_at', 'confirmed_by', 'confirmed_at')
    actions = ['confirm_matches', 'reject_matches', 'mark_completed']

    fieldsets = (
        ('Match Details', {'fields': ('applicant', 'bc_member', 'matched_at')}),
        ('Confirmation', {
            'fields': ('status', 'confirmed_by', 'confirmed_at', 'admin_notes'),
        }),
    )

    def applicant_name(self, obj):
        return f"{obj.applicant.user.name} ({obj.applicant.user.email})"
    applicant_name.short_description = 'Applicant'

    def bc_member_name(self, obj):
        return f"{obj.bc_member.user.name} ({obj.bc_member.user.email})"
    bc_member_name.short_description = 'BC Member'

    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'confirmed': 'green',
            'rejected': 'red',
            'completed': 'blue',
        }
        icons = {
            'pending': '⏳',
            'confirmed': '✓',
            'rejected': '✗',
            'completed': '☕',
        }
        color = colors.get(obj.status, 'gray')
        icon = icons.get(obj.status, '')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {}</span>',
            color, icon, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    @admin.action(description='Confirm selected matches')
    def confirm_matches(self, request, queryset):
        count = 0
        for match in queryset.filter(status='pending'):
            match.status = 'confirmed'
            match.confirmed_by = request.user
            match.confirmed_at = timezone.now()
            # Mark applicant as matched
            match.applicant.has_been_matched = True
            match.applicant.save()
            match.save()
            # Send confirmation email
            send_match_confirmed_notification(match)
            count += 1
        self.message_user(request, f'{count} match(es) confirmed successfully.')

    @admin.action(description='Reject selected matches')
    def reject_matches(self, request, queryset):
        count = 0
        for match in queryset.filter(status='pending'):
            match.status = 'rejected'
            match.confirmed_by = request.user
            match.confirmed_at = timezone.now()
            match.save()
            count += 1
        self.message_user(request, f'{count} match(es) rejected.')

    @admin.action(description='Mark selected matches as completed')
    def mark_completed(self, request, queryset):
        count = queryset.filter(status='confirmed').update(status='completed')
        self.message_user(request, f'{count} match(es) marked as completed.')

    def save_model(self, request, obj, form, change):
        # Track who confirmed the match
        if 'status' in form.changed_data:
            if obj.status in ['confirmed', 'rejected']:
                obj.confirmed_by = request.user
                obj.confirmed_at = timezone.now()
                if obj.status == 'confirmed':
                    obj.applicant.has_been_matched = True
                    obj.applicant.save()
                    # Send confirmation email
                    send_match_confirmed_notification(obj)
        super().save_model(request, obj, form, change)


@admin.register(BCMessage)
class BCMessageAdmin(admin.ModelAdmin):
    list_display = ('match', 'sender', 'content_preview', 'sent_at', 'is_read')
    list_filter = ('is_read', 'sent_at')
    search_fields = ('sender__name', 'content')

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Message'


@admin.register(BCSwipe)
class BCSwipeAdmin(admin.ModelAdmin):
    list_display = ('swiper', 'target', 'direction', 'created_at')
    list_filter = ('direction', 'created_at')
    search_fields = ('swiper__name', 'target__name')

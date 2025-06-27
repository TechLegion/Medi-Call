from django.contrib import admin
from .models import Shift, Application, ShiftReview


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('role', 'department', 'hospital', 'date', 'urgency', 'status', 'pay_per_hour', 'applicant_count')
    list_filter = ('status', 'urgency', 'department', 'date', 'created_at')
    search_fields = ('role', 'department', 'hospital__username', 'location')
    readonly_fields = ('applicant_count', 'created_at', 'updated_at')
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('hospital', 'department', 'role', 'description')
        }),
        ('Schedule', {
            'fields': ('date', 'start_time', 'end_time', 'duration_hours')
        }),
        ('Compensation', {
            'fields': ('pay_per_hour',)
        }),
        ('Details', {
            'fields': ('urgency', 'status', 'requirements', 'location', 'max_applicants')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('worker', 'shift', 'status', 'proposed_rate', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('worker__username', 'shift__role', 'shift__department')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Application Details', {
            'fields': ('shift', 'worker', 'status', 'cover_letter', 'proposed_rate')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ShiftReview)
class ShiftReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer', 'reviewed_user', 'shift', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('reviewer__username', 'reviewed_user__username', 'shift__role')
    readonly_fields = ('created_at',)

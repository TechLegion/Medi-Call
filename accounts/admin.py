from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, WorkerProfile, HospitalProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'is_verified', 'city', 'state')
    list_filter = ('user_type', 'is_verified', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'address', 'city', 'state')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'phone_number', 'profile_picture', 'is_verified')
        }),
        ('Address', {
            'fields': ('address', 'city', 'state', 'zip_code', 'country'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'phone_number', 'is_verified')
        }),
        ('Address', {
            'fields': ('address', 'city', 'state', 'zip_code', 'country'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_number', 'experience_years', 'rating', 'is_available')
    list_filter = ('is_available', 'experience_years', 'rating')
    search_fields = ('user__username', 'user__email', 'license_number')
    readonly_fields = ('rating', 'total_reviews')


@admin.register(HospitalProfile)
class HospitalProfileAdmin(admin.ModelAdmin):
    list_display = ('hospital_name', 'user', 'city', 'state', 'is_verified', 'bed_count')
    list_filter = ('is_verified', 'state', 'city')
    search_fields = ('hospital_name', 'user__username', 'license_number')
    readonly_fields = ('is_verified',) 
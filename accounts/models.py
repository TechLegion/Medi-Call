from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('worker', 'Medical Worker'),
        ('hospital', 'Hospital'),
        ('admin', 'Admin'),
    ]
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='worker')
    phone_number = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ],
        blank=True,
        null=True
    )
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    
    # Address fields
    address = models.TextField(blank=True, null=True, help_text="Street address")
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    country = models.CharField(max_length=2, default='US', blank=True, null=True, help_text='ISO 3166-1 alpha-2 country code')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'auth_user'
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    @property
    def full_address(self):
        """Returns the complete address as a string"""
        parts = []
        if self.address:
            parts.append(self.address)
        if self.city:
            parts.append(self.city)
        if self.state:
            parts.append(self.state)
        if self.zip_code:
            parts.append(self.zip_code)
        if self.country and self.country != 'US':
            parts.append(self.country)
        return ', '.join(parts) if parts else None


class WorkerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker_profile')
    license_number = models.CharField(max_length=50, unique=True)
    specialties = models.JSONField(default=list)  # List of specialties
    experience_years = models.PositiveIntegerField(default=0)
    certifications = models.JSONField(default=list)  # List of certifications
    availability = models.JSONField(default=dict)  # Availability schedule
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    country = models.CharField(max_length=2, default='US', help_text='ISO 3166-1 alpha-2 country code')
    
    def __str__(self):
        return f"{self.user.username} - {', '.join(self.specialties)}"


class HospitalProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hospital_profile')
    hospital_name = models.CharField(max_length=200)
    license_number = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    phone = models.CharField(max_length=15)
    website = models.URLField(blank=True, null=True)
    departments = models.JSONField(default=list)  # List of departments
    bed_count = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    country = models.CharField(max_length=2, default='US', help_text='ISO 3166-1 alpha-2 country code')
    
    def __str__(self):
        return self.hospital_name 
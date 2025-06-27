from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import User
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users for development'

    def handle(self, *args, **options):
        # Get passwords from environment variables or use defaults
        hospital_password = os.environ.get('TEST_HOSPITAL_PASSWORD', 'test123')
        worker_password = os.environ.get('TEST_WORKER_PASSWORD', 'test123')
        admin_password = os.environ.get('TEST_ADMIN_PASSWORD', 'admin123')
        
        # Create hospital user
        hospital_user, created = User.objects.get_or_create(
            username='hospital',
            defaults={
                'email': 'hospital@test.com',
                'first_name': 'City',
                'last_name': 'General Hospital',
                'user_type': 'hospital',
                'phone_number': '+1555123456',
                'is_verified': True,
            }
        )
        
        if created:
            hospital_user.set_password(hospital_password)
            hospital_user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created hospital user: {hospital_user.username}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Hospital user already exists: {hospital_user.username}')
            )

        # Create worker user
        worker_user, created = User.objects.get_or_create(
            username='worker',
            defaults={
                'email': 'worker@test.com',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'user_type': 'worker',
                'phone_number': '+1555987654',
                'is_verified': True,
            }
        )
        
        if created:
            worker_user.set_password(worker_password)
            worker_user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created worker user: {worker_user.username}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Worker user already exists: {worker_user.username}')
            )

        # Create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@medicall.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'user_type': 'admin',
                'phone_number': '+1555000000',
                'is_verified': True,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        if created:
            admin_user.set_password(admin_password)
            admin_user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created admin user: {admin_user.username}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Admin user already exists: {admin_user.username}')
            )

        self.stdout.write(
            self.style.SUCCESS('Test users creation completed!')
        ) 
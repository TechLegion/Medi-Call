from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import User, WorkerProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Create worker profile for test user'

    def handle(self, *args, **options):
        # Get the worker user
        try:
            worker_user = User.objects.get(username='worker')
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Worker user does not exist. Please run create_test_users first.')
            )
            return

        # Create worker profile
        profile, created = WorkerProfile.objects.get_or_create(
            user=worker_user,
            defaults={
                'license_number': 'RN123456',
                'specialties': ['Emergency Medicine', 'Critical Care'],
                'experience_years': 5,
                'certifications': ['BLS', 'ACLS', 'PALS'],
                'availability': {
                    'monday': ['08:00-20:00'],
                    'tuesday': ['08:00-20:00'],
                    'wednesday': ['08:00-20:00'],
                    'thursday': ['08:00-20:00'],
                    'friday': ['08:00-20:00'],
                    'saturday': ['08:00-20:00'],
                    'sunday': ['08:00-20:00']
                },
                'hourly_rate': 85.00,
                'is_available': True
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created worker profile for {worker_user.username}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Worker profile already exists for {worker_user.username}')
            ) 
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import User, WorkerProfile, HospitalProfile
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Delete existing test users and create fresh ones'

    def handle(self, *args, **options):
        # Get passwords from environment variables or use defaults
        hospital_password = os.environ.get('TEST_HOSPITAL_PASSWORD', 'test123')
        worker_password = os.environ.get('TEST_WORKER_PASSWORD', 'test123')
        admin_password = os.environ.get('TEST_ADMIN_PASSWORD', 'admin123')
        
        self.stdout.write("🗑️  Cleaning up existing test users...")
        
        # Delete existing test users
        test_usernames = ['hospital', 'worker', 'admin']
        deleted_count = 0
        
        for username in test_usernames:
            try:
                user = User.objects.get(username=username)
                user.delete()
                self.stdout.write(f"  ✅ Deleted user: {username}")
                deleted_count += 1
            except User.DoesNotExist:
                self.stdout.write(f"  ℹ️  User {username} not found")
        
        self.stdout.write(f"\n🧹 Cleaned up {deleted_count} users")
        
        # Create fresh test users
        self.stdout.write("\n👥 Creating fresh test users...")
        
        # Create hospital user
        hospital_user = User.objects.create_user(
            username='hospital',
            email='hospital@test.com',
            first_name='City',
            last_name='General Hospital',
            user_type='hospital',
            phone_number='+15551234567',
            is_verified=True,
            password=hospital_password
        )
        self.stdout.write(f"  ✅ Created hospital user: {hospital_user.username}")
        
        # Create worker user
        worker_user = User.objects.create_user(
            username='worker',
            email='worker@test.com',
            first_name='Sarah',
            last_name='Johnson',
            user_type='worker',
            phone_number='+15559876543',
            is_verified=True,
            password=worker_password
        )
        self.stdout.write(f"  ✅ Created worker user: {worker_user.username}")
        
        # Create admin user
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@medicall.com',
            first_name='Admin',
            last_name='User',
            user_type='admin',
            phone_number='+15550000000',
            is_verified=True,
            is_staff=True,
            is_superuser=True,
            password=admin_password
        )
        self.stdout.write(f"  ✅ Created admin user: {admin_user.username}")
        
        self.stdout.write(self.style.SUCCESS("\n✅ Fresh test users created successfully!"))
        self.stdout.write("\n📋 Test Credentials:")
        self.stdout.write(f"  - Hospital: hospital / {hospital_password}")
        self.stdout.write(f"  - Worker: worker / {worker_password}")
        self.stdout.write(f"  - Admin: admin / {admin_password}") 
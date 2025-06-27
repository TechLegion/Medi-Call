from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import User

User = get_user_model()

class Command(BaseCommand):
    help = 'Check and fix user data issues'

    def handle(self, *args, **options):
        self.stdout.write("🔍 Checking existing users...")
        
        # List all users
        users = User.objects.all()
        self.stdout.write(f"Found {users.count()} users:")
        
        for user in users:
            self.stdout.write(f"  - {user.username} (Type: {user.user_type}, Email: {user.email})")
        
        # Check for users with wrong types
        hospital_users = User.objects.filter(user_type='hospital')
        worker_users = User.objects.filter(user_type='worker')
        admin_users = User.objects.filter(user_type='admin')
        
        self.stdout.write(f"\n📊 User Type Breakdown:")
        self.stdout.write(f"  - Hospitals: {hospital_users.count()}")
        self.stdout.write(f"  - Workers: {worker_users.count()}")
        self.stdout.write(f"  - Admins: {admin_users.count()}")
        
        # Check for potential issues
        if hospital_users.count() > 1:
            self.stdout.write(self.style.WARNING("⚠️  Multiple hospital users found"))
        
        if worker_users.count() > 1:
            self.stdout.write(self.style.WARNING("⚠️  Multiple worker users found"))
        
        # Ask if user wants to clean up
        self.stdout.write("\n🧹 Would you like to clean up and create fresh test users?")
        self.stdout.write("This will delete existing test users and create new ones.")
        
        # For now, just show the current state
        self.stdout.write(self.style.SUCCESS("✅ User check completed!")) 
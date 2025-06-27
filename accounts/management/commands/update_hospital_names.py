from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import User, HospitalProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Update hospital names for existing hospitals in the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            help='Specific username to update (optional)'
        )
        parser.add_argument(
            '--new-name',
            type=str,
            help='New hospital name to set (optional)'
        )
        parser.add_argument(
            '--list-only',
            action='store_true',
            help='Only list existing hospitals without making changes'
        )

    def handle(self, *args, **options):
        self.stdout.write("🏥 Hospital Name Update Tool")
        self.stdout.write("=" * 50)

        # Get all hospital users
        hospital_users = User.objects.filter(user_type='hospital')
        
        if not hospital_users.exists():
            self.stdout.write(self.style.WARNING("❌ No hospital users found in the database"))
            return

        self.stdout.write(f"📋 Found {hospital_users.count()} hospital user(s):")
        self.stdout.write("")

        # List all hospitals
        for user in hospital_users:
            try:
                profile = user.hospital_profile
                self.stdout.write(f"  👤 Username: {user.username}")
                self.stdout.write(f"     📧 Email: {user.email}")
                self.stdout.write(f"     🏥 Current Name: {profile.hospital_name}")
                self.stdout.write(f"     📍 Location: {profile.city}, {profile.state}")
                self.stdout.write(f"     🌍 Country: {profile.country}")
                self.stdout.write("")
            except HospitalProfile.DoesNotExist:
                self.stdout.write(f"  👤 Username: {user.username}")
                self.stdout.write(f"     📧 Email: {user.email}")
                self.stdout.write(f"     ⚠️  No hospital profile found")
                self.stdout.write("")

        if options['list_only']:
            self.stdout.write(self.style.SUCCESS("✅ List completed. Use --new-name to update names."))
            return

        # Handle specific username update
        if options['username']:
            try:
                user = User.objects.get(username=options['username'], user_type='hospital')
                self.update_hospital_name(user, options['new_name'])
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"❌ Hospital user '{options['username']}' not found"))
                return
        else:
            # Interactive mode
            self.stdout.write("🔄 Interactive Update Mode")
            self.stdout.write("Enter 'quit' to exit or 'list' to see hospitals again")
            self.stdout.write("")

            while True:
                username = input("Enter username to update (or 'quit'/'list'): ").strip()
                
                if username.lower() == 'quit':
                    break
                elif username.lower() == 'list':
                    self.stdout.write("")
                    for user in hospital_users:
                        try:
                            profile = user.hospital_profile
                            self.stdout.write(f"  {user.username}: {profile.hospital_name}")
                        except HospitalProfile.DoesNotExist:
                            self.stdout.write(f"  {user.username}: No profile")
                    self.stdout.write("")
                    continue
                
                try:
                    user = User.objects.get(username=username, user_type='hospital')
                    new_name = input(f"Enter new name for {username}: ").strip()
                    
                    if new_name:
                        self.update_hospital_name(user, new_name)
                    else:
                        self.stdout.write(self.style.WARNING("⚠️  No name provided, skipping..."))
                        
                except User.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f"❌ Hospital user '{username}' not found"))

        self.stdout.write(self.style.SUCCESS("✅ Hospital name update completed!"))

    def update_hospital_name(self, user, new_name):
        """Update the hospital name for a specific user"""
        try:
            profile = user.hospital_profile
            old_name = profile.hospital_name
            
            if not new_name:
                self.stdout.write(self.style.WARNING(f"⚠️  No new name provided for {user.username}"))
                return
            
            profile.hospital_name = new_name
            profile.save()
            
            self.stdout.write(f"✅ Updated {user.username}:")
            self.stdout.write(f"   📝 '{old_name}' → '{new_name}'")
            self.stdout.write("")
            
        except HospitalProfile.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"❌ No hospital profile found for {user.username}"))
            self.stdout.write("   💡 Create a hospital profile first using the signup form")
            self.stdout.write("")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error updating {user.username}: {str(e)}"))
            self.stdout.write("") 
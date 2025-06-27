from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from shifts.models import Shift
from accounts.models import User

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample shifts for development'

    def handle(self, *args, **options):
        # Get or create a hospital user for sample shifts
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
            hospital_user.set_password('test123')
            hospital_user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Created hospital user: {hospital_user.username}')
            )

        # Sample shifts data
        sample_shifts = [
            {
                'department': 'Emergency Medicine',
                'role': 'Emergency Physician',
                'date': '2025-06-26',
                'start_time': '08:00:00',
                'end_time': '20:00:00',
                'duration_hours': 12,
                'pay_per_hour': 120.00,
                'urgency': 'high',
                'requirements': 'Board certified emergency medicine physician with 3+ years experience',
                'location': 'Emergency Department, 1st Floor',
                'description': 'Covering emergency department shift. High volume trauma center.',
                'max_applicants': 5,
                'status': 'active'
            },
            {
                'department': 'Critical Care',
                'role': 'ICU Nurse',
                'date': '2025-06-27',
                'start_time': '07:00:00',
                'end_time': '19:00:00',
                'duration_hours': 12,
                'pay_per_hour': 45.00,
                'urgency': 'medium',
                'requirements': 'RN with ICU experience, BLS and ACLS certified',
                'location': 'Intensive Care Unit, 3rd Floor',
                'description': 'ICU nursing shift. Managing critically ill patients.',
                'max_applicants': 3,
                'status': 'active'
            },
            {
                'department': 'Cardiology',
                'role': 'Cardiologist',
                'date': '2025-06-28',
                'start_time': '09:00:00',
                'end_time': '17:00:00',
                'duration_hours': 8,
                'pay_per_hour': 150.00,
                'urgency': 'low',
                'requirements': 'Board certified cardiologist, experience with cardiac procedures',
                'location': 'Cardiology Department, 2nd Floor',
                'description': 'Outpatient cardiology clinic. Patient consultations and procedures.',
                'max_applicants': 2,
                'status': 'active'
            },
            {
                'department': 'Pediatrics',
                'role': 'Pediatrician',
                'date': '2025-06-29',
                'start_time': '08:00:00',
                'end_time': '18:00:00',
                'duration_hours': 10,
                'pay_per_hour': 100.00,
                'urgency': 'medium',
                'requirements': 'Board certified pediatrician, experience with pediatric emergencies',
                'location': 'Pediatric Ward, 4th Floor',
                'description': 'Pediatric ward coverage. Managing pediatric patients.',
                'max_applicants': 4,
                'status': 'active'
            },
            {
                'department': 'Surgery',
                'role': 'Surgical Nurse',
                'date': '2025-06-30',
                'start_time': '06:00:00',
                'end_time': '18:00:00',
                'duration_hours': 12,
                'pay_per_hour': 50.00,
                'urgency': 'high',
                'requirements': 'RN with OR experience, sterile technique certified',
                'location': 'Operating Room, 1st Floor',
                'description': 'Surgical nursing shift. Assisting with various surgical procedures.',
                'max_applicants': 3,
                'status': 'active'
            }
        ]

        shifts_created = 0
        for shift_data in sample_shifts:
            shift, created = Shift.objects.get_or_create(
                hospital=hospital_user,
                department=shift_data['department'],
                role=shift_data['role'],
                date=shift_data['date'],
                start_time=shift_data['start_time'],
                defaults={
                    'end_time': shift_data['end_time'],
                    'duration_hours': shift_data['duration_hours'],
                    'pay_per_hour': shift_data['pay_per_hour'],
                    'urgency': shift_data['urgency'],
                    'requirements': shift_data['requirements'],
                    'location': shift_data['location'],
                    'description': shift_data['description'],
                    'max_applicants': shift_data['max_applicants'],
                    'status': shift_data['status']
                }
            )
            
            if created:
                shifts_created += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created shift: {shift.role} - {shift.department}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Shift already exists: {shift.role} - {shift.department}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {shifts_created} sample shifts!')
        ) 
from django.db import models
from django.conf import settings


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('shift_posted', 'New Shift Posted'),
        ('application_received', 'Application Received'),
        ('application_approved', 'Application Approved'),
        ('application_rejected', 'Application Rejected'),
        ('shift_reminder', 'Shift Reminder'),
        ('payment_received', 'Payment Received'),
        ('system', 'System Notification'),
    ]
    
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_shift = models.ForeignKey('shifts.Shift', on_delete=models.CASCADE, null=True, blank=True)
    related_application = models.ForeignKey('shifts.Application', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.recipient.username} - {self.title}"
    
    def mark_as_read(self):
        self.is_read = True
        self.save()


class NotificationPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_preferences')
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    shift_notifications = models.BooleanField(default=True)
    application_notifications = models.BooleanField(default=True)
    payment_notifications = models.BooleanField(default=True)
    system_notifications = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.username} - Notification Preferences"

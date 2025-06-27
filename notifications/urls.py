from django.urls import path
from .views import NotificationListView, NotificationDetailView, mark_notification_read

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification_detail'),
    path('<int:pk>/read/', mark_notification_read, name='mark_notification_read'),
] 
from django.urls import path
from .views import (
    ShiftListView, ShiftDetailView, ApplicationListView, ApplicationDetailView,
    ShiftApplicationListView, ApplicationStatusUpdateView, WorkerShiftListView,
    HospitalShiftListView, HospitalApplicationListView
)

urlpatterns = [
    # Shifts
    path('', ShiftListView.as_view(), name='shift_list'),
    path('worker/', WorkerShiftListView.as_view(), name='worker_shift_list'),
    path('hospital/', HospitalShiftListView.as_view(), name='hospital_shift_list'),
    path('<int:pk>/', ShiftDetailView.as_view(), name='shift_detail'),
    
    # Applications
    path('applications/', ApplicationListView.as_view(), name='application_list'),
    path('applications/hospital/', HospitalApplicationListView.as_view(), name='hospital_application_list'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application_detail'),
    path('<int:shift_id>/applications/', ShiftApplicationListView.as_view(), name='shift_applications'),
    path('applications/<int:pk>/status/', ApplicationStatusUpdateView.as_view(), name='application_status'),
] 
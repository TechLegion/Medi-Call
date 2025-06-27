from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, UserProfileView, WorkerProfileView, 
    HospitalProfileView, WorkerListView, HospitalListView, logout
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', logout, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('worker-profile/', WorkerProfileView.as_view(), name='worker_profile'),
    path('hospital-profile/', HospitalProfileView.as_view(), name='hospital_profile'),
    
    # Lists
    path('workers/', WorkerListView.as_view(), name='worker_list'),
    path('hospitals/', HospitalListView.as_view(), name='hospital_list'),
] 
from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Shift, Application, ShiftReview
from .serializers import (
    ShiftSerializer, ShiftCreateSerializer, ApplicationSerializer,
    ApplicationCreateSerializer, ShiftReviewSerializer, ShiftReviewCreateSerializer
)


class ShiftListView(generics.ListCreateAPIView):
    queryset = Shift.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'department', 'urgency', 'date']
    search_fields = ['role', 'department', 'requirements']
    ordering_fields = ['date', 'pay_per_hour', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ShiftCreateSerializer
        return ShiftSerializer


class ShiftDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    permission_classes = [permissions.IsAuthenticated]


class ApplicationListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'shift']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Application.objects.filter(worker=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ApplicationCreateSerializer
        return ApplicationSerializer


class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Application.objects.filter(worker=self.request.user)


class ShiftApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        shift_id = self.kwargs['shift_id']
        return Application.objects.filter(shift_id=shift_id, shift__hospital=self.request.user)


class HospitalApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'shift']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Only hospitals can access this view
        if self.request.user.user_type != 'hospital':
            return Application.objects.none()
        return Application.objects.filter(shift__hospital=self.request.user)


class ApplicationStatusUpdateView(generics.UpdateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Application.objects.filter(shift__hospital=self.request.user)
    
    def patch(self, request, *args, **kwargs):
        application = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in ['approved', 'rejected']:
            application.status = new_status
            application.save()
            return Response({'status': 'updated'})
        
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_application(request, application_id):
    if request.user.user_type != 'hospital':
        return Response({'detail': 'Only hospitals can approve applications'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    application = get_object_or_404(Application, id=application_id, shift__hospital=request.user)
    application.status = 'approved'
    application.save()
    
    # Update shift status if needed
    if application.shift.applications.filter(status='approved').count() >= 1:
        application.shift.status = 'filled'
        application.shift.save()
    
    return Response({'detail': 'Application approved successfully'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_application(request, application_id):
    if request.user.user_type != 'hospital':
        return Response({'detail': 'Only hospitals can reject applications'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    application = get_object_or_404(Application, id=application_id, shift__hospital=request.user)
    application.status = 'rejected'
    application.save()
    
    return Response({'detail': 'Application rejected successfully'})


class ShiftReviewListView(generics.ListCreateAPIView):
    serializer_class = ShiftReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['shift', 'reviewed_user']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return ShiftReview.objects.filter(reviewer=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ShiftReviewCreateSerializer
        return ShiftReviewSerializer


class ShiftReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ShiftReview.objects.all()
    serializer_class = ShiftReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ShiftReview.objects.filter(reviewer=self.request.user)


class WorkerShiftListView(generics.ListAPIView):
    serializer_class = ShiftSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department', 'urgency', 'date', 'location']
    search_fields = ['role', 'department', 'requirements']
    ordering_fields = ['date', 'pay_per_hour', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Shift.objects.filter(status='active').exclude(
            applications__worker=self.request.user
        )


class HospitalShiftListView(generics.ListAPIView):
    serializer_class = ShiftSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'department', 'urgency', 'date']
    search_fields = ['role', 'department', 'requirements']
    ordering_fields = ['date', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Shift.objects.filter(hospital=self.request.user)

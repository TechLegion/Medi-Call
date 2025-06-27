from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
import logging

from .models import User, WorkerProfile, HospitalProfile
from .serializers import (
    UserSerializer, WorkerProfileSerializer, HospitalProfileSerializer,
    RegisterSerializer, LoginSerializer, WorkerProfileCreateSerializer,
    HospitalProfileCreateSerializer
)

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        logger.info(f"Registration attempt received: {request.data}")
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            logger.info(f"Registration data is valid: {serializer.validated_data}")
            try:
                user = serializer.save()
                logger.info(f"User created successfully: {user.username} (ID: {user.id})")
                refresh = RefreshToken.for_user(user)
                response_data = {
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
                logger.info(f"Registration successful for user: {user.username}")
                return Response(response_data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Error creating user: {str(e)}")
                return Response({'detail': f'Error creating user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            logger.error(f"Registration validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            profile = request.user.worker_profile
            serializer = WorkerProfileSerializer(profile)
            return Response(serializer.data)
        except WorkerProfile.DoesNotExist:
            return Response({'detail': 'Worker profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        if hasattr(request.user, 'worker_profile'):
            return Response({'detail': 'Worker profile already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = WorkerProfileCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            profile = serializer.save()
            return Response(WorkerProfileSerializer(profile).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        try:
            profile = request.user.worker_profile
            serializer = WorkerProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except WorkerProfile.DoesNotExist:
            return Response({'detail': 'Worker profile not found'}, status=status.HTTP_404_NOT_FOUND)


class HospitalProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            profile = request.user.hospital_profile
            serializer = HospitalProfileSerializer(profile)
            return Response(serializer.data)
        except HospitalProfile.DoesNotExist:
            return Response({'detail': 'Hospital profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        if hasattr(request.user, 'hospital_profile'):
            return Response({'detail': 'Hospital profile already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = HospitalProfileCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            profile = serializer.save()
            return Response(HospitalProfileSerializer(profile).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        try:
            profile = request.user.hospital_profile
            serializer = HospitalProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except HospitalProfile.DoesNotExist:
            return Response({'detail': 'Hospital profile not found'}, status=status.HTTP_404_NOT_FOUND)


class WorkerListView(generics.ListAPIView):
    queryset = WorkerProfile.objects.filter(is_available=True)
    serializer_class = WorkerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['specialties', 'experience_years', 'rating']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']
    ordering_fields = ['rating', 'experience_years', 'hourly_rate']


class HospitalListView(generics.ListAPIView):
    queryset = HospitalProfile.objects.filter(is_verified=True)
    serializer_class = HospitalProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['departments', 'city', 'state']
    search_fields = ['hospital_name', 'city', 'state']
    ordering_fields = ['hospital_name', 'bed_count']


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"detail": "Successfully logged out"}, status=status.HTTP_200_OK)
    except Exception:
        return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST) 
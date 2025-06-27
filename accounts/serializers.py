from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, WorkerProfile, HospitalProfile
import logging

logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    full_address = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 
                 'phone_number', 'profile_picture', 'is_verified', 'date_joined',
                 'address', 'city', 'state', 'zip_code', 'country', 'full_address']
        read_only_fields = ['id', 'date_joined']


class WorkerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = WorkerProfile
        fields = '__all__'
        read_only_fields = ['rating', 'total_reviews']


class HospitalProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = HospitalProfile
        fields = '__all__'


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    zip_code = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'user_type', 
                 'first_name', 'last_name', 'phone_number', 'address', 'city', 'state', 'zip_code', 'country']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        logger.info(f"Creating user with data: {validated_data}")
        validated_data.pop('password_confirm')
        try:
            user = User.objects.create_user(**validated_data)
            logger.info(f"User created successfully: {user.username} (ID: {user.id})")
            return user
        except Exception as e:
            logger.error(f"Error in create_user: {str(e)}")
            raise e


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs


class WorkerProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerProfile
        fields = ['license_number', 'specialties', 'experience_years', 'certifications', 
                 'availability', 'hourly_rate', 'country']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class HospitalProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalProfile
        fields = ['hospital_name', 'license_number', 'address', 'city', 'state', 
                 'zip_code', 'phone', 'website', 'departments', 'bed_count', 'country']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data) 
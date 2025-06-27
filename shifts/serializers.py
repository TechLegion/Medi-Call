from rest_framework import serializers
from .models import Shift, Application, ShiftReview
from accounts.serializers import UserSerializer


class ShiftSerializer(serializers.ModelSerializer):
    hospital = UserSerializer(read_only=True)
    applicant_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Shift
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ShiftCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = ['department', 'role', 'date', 'start_time', 'end_time', 
                 'duration_hours', 'pay_per_hour', 'urgency', 'requirements', 
                 'location', 'description', 'max_applicants']
    
    def create(self, validated_data):
        validated_data['hospital'] = self.context['request'].user
        return super().create(validated_data)


class ApplicationSerializer(serializers.ModelSerializer):
    worker = UserSerializer(read_only=True)
    shift = ShiftSerializer(read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['shift', 'cover_letter', 'proposed_rate']
    
    def create(self, validated_data):
        validated_data['worker'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_shift(self, value):
        # Check if user already applied to this shift
        if Application.objects.filter(worker=self.context['request'].user, shift=value).exists():
            raise serializers.ValidationError("You have already applied to this shift")
        return value


class ShiftReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewed_user = UserSerializer(read_only=True)
    shift = ShiftSerializer(read_only=True)
    
    class Meta:
        model = ShiftReview
        fields = '__all__'
        read_only_fields = ['created_at']


class ShiftReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftReview
        fields = ['shift', 'reviewed_user', 'rating', 'comment']
    
    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, attrs):
        # Check if user already reviewed this person for this shift
        if ShiftReview.objects.filter(
            reviewer=self.context['request'].user,
            reviewed_user=attrs['reviewed_user'],
            shift=attrs['shift']
        ).exists():
            raise serializers.ValidationError("You have already reviewed this user for this shift")
        return attrs 
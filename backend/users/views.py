"""
DRF Views for Users app.
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
import random
import string

from .models import User, UserProfile, OTPCode
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    LoginSerializer, OTPRequestSerializer, OTPVerifySerializer,
    PasswordResetSerializer, ChangePasswordSerializer
)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        # Extract data from request
        data = request.data
        print(f"Registration data received: {data}")
        
        # Extract registration data
        registration_data = {
            'username': data.get('username'),
            'email': data.get('email'),
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            'password': data.get('password'),
            'password_confirm': data.get('password_confirm'),
            'phone_number': data.get('phone_number'),
            'role': data.get('role', 'customer')
        }
        
        print(f"Extracted data: {registration_data}")
        
        # Execute registration use case
        from .application.use_cases import RegisterUserUseCase
        from .infrastructure.repositories import DjangoUserRepository, DjangoUserProfileRepository, DjangoOTPCodeRepository
        from .infrastructure.services import DjangoUserRegistrationService, DjangoPasswordService, DjangoOTPService, DjangoEmailVerificationService
        
        # Initialize dependencies
        user_repository = DjangoUserRepository()
        profile_repository = DjangoUserProfileRepository()
        otp_repository = DjangoOTPCodeRepository()
        password_service = DjangoPasswordService()
        registration_service = DjangoUserRegistrationService(user_repository, password_service)
        otp_service = DjangoOTPService(otp_repository)
        email_service = DjangoEmailVerificationService(otp_service)
        
        # Create use case
        use_case = RegisterUserUseCase(
            registration_service=registration_service,
            user_repository=user_repository,
            profile_repository=profile_repository,
            otp_service=otp_service,
            email_service=email_service
        )
        
        # Execute use case
        result = use_case.execute(**registration_data)
        print(f"Use case result: {result}")
        
        if result['success']:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """User login endpoint."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login successful.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile management."""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserUpdateView(generics.UpdateAPIView):
    """Update user profile."""
    
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class OTPRequestView(APIView):
    """Request OTP for verification."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        otp_type = data['otp_type']
        target = data.get('phone') or data.get('email')
        
        # Generate OTP code
        code = ''.join(random.choices(string.digits, k=6))
        
        # Set expiry (10 minutes)
        expires_at = timezone.now() + timedelta(minutes=10)
        
        # Create OTP record
        otp_data = {
            'user': None,  # Will be set after verification
            'code': code,
            'otp_type': otp_type,
            'expires_at': expires_at
        }
        
        # Set email or phone based on otp_type
        if otp_type in ['phone', 'login']:
            otp_data['phone'] = target
        else:
            otp_data['email'] = target
            
        otp = OTPCode.objects.create(**otp_data)
        
        # Send OTP (mock for now)
        if otp_type in ['phone', 'login']:
            # Send SMS
            print(f"SMS OTP to {target}: {code}")
        else:
            # Send Email
            print(f"Email OTP to {target}: {code}")
        
        return Response({
            'message': f'OTP sent to {target}',
            'otp_type': otp_type,
            'target': target
        })


class OTPVerifyView(APIView):
    """Verify OTP code."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        code = data['code']
        otp_type = data['otp_type']
        target = data.get('phone') or data.get('email')
        
        # Find valid OTP
        try:
            otp_filter = {
                'code': code,
                'otp_type': otp_type,
                'is_used': False,
                'expires_at__gt': timezone.now()
            }
            
            # Add email or phone filter based on otp_type
            if otp_type in ['phone', 'login']:
                otp_filter['phone'] = target
            else:
                otp_filter['email'] = target
                
            otp = OTPCode.objects.get(**otp_filter)
        except OTPCode.DoesNotExist:
            return Response({
                'error': 'Invalid or expired OTP code.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used
        otp.is_used = True
        otp.save()
        
        # Handle different OTP types
        if otp_type == 'login':
            # Find user by phone
            try:
                user = User.objects.get(profile__phone=target)
                refresh = RefreshToken.for_user(user)
                return Response({
                    'message': 'OTP verified successfully.',
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                })
            except User.DoesNotExist:
                return Response({
                    'error': 'User not found with this phone number.'
                }, status=status.HTTP_404_NOT_FOUND)
        
        elif otp_type == 'phone':
            # Mark user as verified
            if otp.user:
                otp.user.is_verified = True
                otp.user.save()
                return Response({
                    'message': 'Phone verified successfully.'
                })
        
        elif otp_type == 'email':
            # Mark user as verified and active
            if otp.user:
                otp.user.is_email_verified = True
                otp.user.is_active = True  # Activate user after email verification
                otp.user.save()
                
                # Generate tokens for auto-login after verification
                refresh = RefreshToken.for_user(otp.user)
                return Response({
                    'message': 'Email verified successfully.',
                    'user': UserSerializer(otp.user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                })
        
        return Response({
            'message': 'OTP verified successfully.'
        })


class PasswordResetRequestView(APIView):
    """Request password reset OTP."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({
                'error': 'Email is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found with this email.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Generate OTP code
        code = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=10)
        
        # Create OTP record
        OTPCode.objects.create(
            user=user,
            code=code,
            otp_type='password_reset',
            email=email,
            expires_at=expires_at
        )
        
        # Send OTP email (mock for now)
        print(f"Password reset OTP to {email}: {code}")
        
        return Response({
            'message': f'Password reset code sent to {email}',
            'email': email
        })


class PasswordResetView(APIView):
    """Reset password using OTP."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        email = data['email']
        code = data['code']
        new_password = data['new_password']
        
        # Verify OTP
        try:
            otp = OTPCode.objects.get(
                code=code,
                otp_type='password_reset',
                email=email,
                is_used=False,
                expires_at__gt=timezone.now()
            )
        except OTPCode.DoesNotExist:
            return Response({
                'error': 'Invalid or expired OTP code.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find user and update password
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            
            # Mark OTP as used
            otp.is_used = True
            otp.save()
            
            return Response({
                'message': 'Password reset successfully.'
            })
        except User.DoesNotExist:
            return Response({
                'error': 'User not found with this email.'
            }, status=status.HTTP_404_NOT_FOUND)


class ChangePasswordView(APIView):
    """Change password for authenticated user."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        current_password = serializer.validated_data['current_password']
        new_password = serializer.validated_data['new_password']
        
        # Verify current password
        if not user.check_password(current_password):
            return Response({
                'error': 'Current password is incorrect.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password changed successfully.'
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout user by blacklisting refresh token."""
    
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'Logged out successfully.'
        })
    except Exception:
        return Response({
            'message': 'Logged out successfully.'
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """Get current user information."""
    
    return Response({
        'user': UserSerializer(request.user).data
    })


# Alias views for compatibility with Clean Architecture URLs
LogoutView = logout_view
VerifyEmailView = OTPVerifyView
VerifyPhoneView = OTPVerifyView

# Create alias for ResetPasswordView if it doesn't exist
if 'ResetPasswordView' not in globals():
    ResetPasswordView = PasswordResetView 
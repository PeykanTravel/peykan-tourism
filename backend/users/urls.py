"""
URL configuration for users app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# Import from Clean Architecture views
from .presentation.controllers import (
    RegisterView, LoginView, LogoutView,
    VerifyEmailView, VerifyPhoneView, 
    ForgotPasswordView, ResetPasswordView,
    ChangePasswordView, UserProfileView,
    SensitiveFieldUpdateView, SensitiveFieldVerifyView
)

# Import from DRF views (working implementation) - Keep for compatibility
from .views import (
    OTPVerifyView, PasswordResetView, PasswordResetRequestView,
    OTPRequestView
)

# API Router - Commented out until ViewSets are implemented
# router = DefaultRouter()
# router.register(r'users', UserViewSet)
# router.register(r'profiles', UserProfileViewSet)
# router.register(r'otp-codes', OTPCodeViewSet)
# router.register(r'sessions', UserSessionViewSet)

# Authentication URLs
auth_urlpatterns = [
    # JWT Token endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Clean Architecture endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    
    # Profile management endpoints
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/sensitive/request/', SensitiveFieldUpdateView.as_view(), name='sensitive_field_request'),
    path('profile/sensitive/verify/', SensitiveFieldVerifyView.as_view(), name='sensitive_field_verify'),
    path('verify-phone/', VerifyPhoneView.as_view(), name='verify_phone'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/confirm/', ResetPasswordView.as_view(), name='reset_password_confirm'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Legacy DRF endpoints (for compatibility)
    path('reset-password/', PasswordResetRequestView.as_view(), name='reset_password_request'),
    path('otp/request/', OTPRequestView.as_view(), name='otp_request'),
]

# Main URL patterns
urlpatterns = [
    # API endpoints - Commented out until ViewSets are implemented
    # path('', include(router.urls)),
    
    # Authentication endpoints - Direct access without nested auth/
    path('', include(auth_urlpatterns)),
]

app_name = 'users' 
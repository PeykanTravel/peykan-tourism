# Generated by Django 5.0.2 on 2025-06-26 23:44

import django.contrib.auth.models
import django.contrib.auth.validators
import django.core.validators
import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('role', models.CharField(choices=[('guest', 'Guest'), ('customer', 'Customer'), ('agent', 'Agent'), ('admin', 'Admin')], default='guest', max_length=20, verbose_name='Role')),
                ('phone_number', models.CharField(blank=True, max_length=17, validators=[django.core.validators.RegexValidator(message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.", regex='^\\+?1?\\d{9,15}$')], verbose_name='Phone number')),
                ('preferred_language', models.CharField(choices=[('fa', 'Persian'), ('en', 'English'), ('tr', 'Turkish')], default='fa', max_length=2, verbose_name='Preferred language')),
                ('preferred_currency', models.CharField(choices=[('USD', 'US Dollar'), ('EUR', 'Euro'), ('TRY', 'Turkish Lira'), ('IRR', 'Iranian Rial')], default='USD', max_length=3, verbose_name='Preferred currency')),
                ('agent_code', models.CharField(blank=True, max_length=20, null=True, unique=True, verbose_name='Agent code')),
                ('commission_rate', models.DecimalField(decimal_places=2, default=0.0, max_digits=5, verbose_name='Commission rate (%)')),
                ('date_of_birth', models.DateField(blank=True, null=True, verbose_name='Date of birth')),
                ('nationality', models.CharField(blank=True, max_length=100, verbose_name='Nationality')),
                ('is_phone_verified', models.BooleanField(default=False, verbose_name='Phone verified')),
                ('is_email_verified', models.BooleanField(default=False, verbose_name='Email verified')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'User',
                'verbose_name_plural': 'Users',
                'ordering': ['-created_at'],
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='OTPCode',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is active')),
                ('code', models.CharField(max_length=6, verbose_name='OTP Code')),
                ('otp_type', models.CharField(choices=[('phone', 'Phone verification'), ('email', 'Email verification'), ('password_reset', 'Password reset'), ('login', 'Login')], max_length=20, verbose_name='OTP type')),
                ('target', models.CharField(max_length=255, verbose_name='Target (phone/email)')),
                ('is_used', models.BooleanField(default=False, verbose_name='Is used')),
                ('is_expired', models.BooleanField(default=False, verbose_name='Is expired')),
                ('expires_at', models.DateTimeField(verbose_name='Expires at')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='otp_codes', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'OTP Code',
                'verbose_name_plural': 'OTP Codes',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is active')),
                ('avatar', models.ImageField(blank=True, null=True, upload_to='avatars/', verbose_name='Avatar')),
                ('bio', models.TextField(blank=True, verbose_name='Bio')),
                ('address', models.TextField(blank=True, verbose_name='Address')),
                ('city', models.CharField(blank=True, max_length=100, verbose_name='City')),
                ('country', models.CharField(blank=True, max_length=100, verbose_name='Country')),
                ('postal_code', models.CharField(blank=True, max_length=20, verbose_name='Postal code')),
                ('website', models.URLField(blank=True, verbose_name='Website')),
                ('facebook', models.URLField(blank=True, verbose_name='Facebook')),
                ('instagram', models.URLField(blank=True, verbose_name='Instagram')),
                ('twitter', models.URLField(blank=True, verbose_name='Twitter')),
                ('newsletter_subscription', models.BooleanField(default=True, verbose_name='Newsletter subscription')),
                ('marketing_emails', models.BooleanField(default=True, verbose_name='Marketing emails')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'User Profile',
                'verbose_name_plural': 'User Profiles',
            },
        ),
        migrations.CreateModel(
            name='UserSession',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('session_key', models.CharField(max_length=40, verbose_name='Session key')),
                ('ip_address', models.GenericIPAddressField(verbose_name='IP address')),
                ('user_agent', models.TextField(verbose_name='User agent')),
                ('country', models.CharField(blank=True, max_length=100, verbose_name='Country')),
                ('city', models.CharField(blank=True, max_length=100, verbose_name='City')),
                ('last_activity', models.DateTimeField(auto_now=True, verbose_name='Last activity')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is active')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sessions', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'User Session',
                'verbose_name_plural': 'User Sessions',
                'ordering': ['-last_activity'],
            },
        ),
    ]

# Generated by Django 5.0.2 on 2025-07-08 17:51

import django.core.validators
import django.db.models.deletion
import parler.fields
import parler.models
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='TransferOption',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('slug', models.SlugField(max_length=255, unique=True, verbose_name='Slug')),
                ('option_type', models.CharField(choices=[('wheelchair', 'Wheelchair'), ('extra_stop', 'Extra Stop'), ('extra_luggage', 'Extra Luggage'), ('english_driver', 'English Speaking Driver'), ('insurance', 'Travel Insurance'), ('meet_greet', 'Meet & Greet'), ('flight_monitoring', 'Flight Monitoring')], default='wheelchair', max_length=20, verbose_name='Option type')),
                ('price_type', models.CharField(choices=[('fixed', 'Fixed Amount'), ('percentage', 'Percentage of Base Price')], default='fixed', max_length=20, verbose_name='Price type')),
                ('price', models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name='Fixed price')),
                ('price_percentage', models.DecimalField(decimal_places=2, default=0.0, max_digits=5, verbose_name='Price percentage')),
                ('max_quantity', models.PositiveIntegerField(blank=True, null=True, verbose_name='Max quantity')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is active')),
            ],
            options={
                'verbose_name': 'Transfer Option',
                'verbose_name_plural': 'Transfer Options',
                'ordering': ['option_type'],
                'indexes': [models.Index(fields=['option_type'], name='transfers_t_option__b53fcf_idx'), models.Index(fields=['is_active'], name='transfers_t_is_acti_2cec5b_idx')],
            },
            bases=(parler.models.TranslatableModelMixin, models.Model),
        ),
        migrations.CreateModel(
            name='TransferRoute',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('origin', models.CharField(max_length=255, verbose_name='Origin')),
                ('destination', models.CharField(max_length=255, verbose_name='Destination')),
                ('slug', models.SlugField(blank=True, max_length=255, null=True, unique=True, verbose_name='Slug')),
                ('round_trip_discount_enabled', models.BooleanField(default=False, verbose_name='Round trip discount enabled')),
                ('round_trip_discount_percentage', models.DecimalField(decimal_places=2, default=10.0, max_digits=5, verbose_name='Round trip discount (%)')),
                ('peak_hour_surcharge', models.DecimalField(decimal_places=2, default=10.0, max_digits=5, verbose_name='Peak hour surcharge (%)')),
                ('midnight_surcharge', models.DecimalField(decimal_places=2, default=5.0, max_digits=5, verbose_name='Midnight surcharge (%)')),
                ('is_admin_selected', models.BooleanField(default=False, verbose_name='Admin selected')),
                ('is_popular', models.BooleanField(default=False, verbose_name='Is popular')),
                ('popularity_score', models.PositiveIntegerField(default=0, verbose_name='Popularity score')),
                ('booking_count', models.PositiveIntegerField(default=0, verbose_name='Booking count')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is active')),
            ],
            options={
                'verbose_name': 'Transfer Route',
                'verbose_name_plural': 'Transfer Routes',
                'ordering': ['origin', 'destination'],
                'indexes': [models.Index(fields=['origin', 'destination'], name='transfers_t_origin_5a222e_idx'), models.Index(fields=['is_active'], name='transfers_t_is_acti_38aee7_idx'), models.Index(fields=['slug'], name='transfers_t_slug_9797ac_idx')],
                'unique_together': {('origin', 'destination')},
            },
            bases=(parler.models.TranslatableModelMixin, models.Model),
        ),
        migrations.CreateModel(
            name='TransferRoutePricing',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('vehicle_type', models.CharField(choices=[('sedan', 'Sedan'), ('suv', 'SUV'), ('van', 'Van'), ('sprinter', 'Sprinter'), ('bus', 'Bus'), ('limousine', 'Limousine')], max_length=20, verbose_name='Vehicle type')),
                ('vehicle_name', models.CharField(max_length=255, verbose_name='Vehicle name')),
                ('vehicle_description', models.TextField(blank=True, verbose_name='Vehicle description')),
                ('base_price', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Base price')),
                ('max_passengers', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(1)], verbose_name='Max passengers')),
                ('max_luggage', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(0)], verbose_name='Max luggage')),
                ('features', models.JSONField(blank=True, default=list, verbose_name='Features')),
                ('amenities', models.JSONField(blank=True, default=list, verbose_name='Amenities')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is active')),
                ('route', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pricing', to='transfers.transferroute', verbose_name='Route')),
            ],
            options={
                'verbose_name': 'Transfer Route Pricing',
                'verbose_name_plural': 'Transfer Route Pricing',
            },
        ),
        migrations.CreateModel(
            name='TransferBooking',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is active')),
                ('booking_date', models.DateField(verbose_name='Booking date')),
                ('booking_time', models.TimeField(verbose_name='Booking time')),
                ('participants_count', models.PositiveIntegerField(default=1, verbose_name='Participants count')),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Unit price')),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Total price')),
                ('currency', models.CharField(default='USD', max_length=3, verbose_name='Currency')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled'), ('completed', 'Completed')], default='pending', max_length=20, verbose_name='Status')),
                ('booking_reference', models.CharField(max_length=20, unique=True, verbose_name='Booking reference')),
                ('trip_type', models.CharField(choices=[('one_way', 'One Way'), ('round_trip', 'Round Trip')], default='one_way', max_length=20, verbose_name='Trip type')),
                ('outbound_date', models.DateField(verbose_name='Outbound date')),
                ('outbound_time', models.TimeField(verbose_name='Outbound time')),
                ('outbound_price', models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name='Outbound price')),
                ('return_date', models.DateField(blank=True, null=True, verbose_name='Return date')),
                ('return_time', models.TimeField(blank=True, null=True, verbose_name='Return time')),
                ('return_price', models.DecimalField(blank=True, decimal_places=2, default=0.0, max_digits=10, null=True, verbose_name='Return price')),
                ('passenger_count', models.PositiveIntegerField(verbose_name='Passenger count')),
                ('luggage_count', models.PositiveIntegerField(default=0, verbose_name='Luggage count')),
                ('pickup_address', models.TextField(verbose_name='Pickup address')),
                ('pickup_instructions', models.TextField(blank=True, verbose_name='Pickup instructions')),
                ('dropoff_address', models.TextField(verbose_name='Drop-off address')),
                ('dropoff_instructions', models.TextField(blank=True, verbose_name='Drop-off instructions')),
                ('contact_name', models.CharField(max_length=255, verbose_name='Contact name')),
                ('contact_phone', models.CharField(max_length=20, verbose_name='Contact phone')),
                ('round_trip_discount', models.DecimalField(blank=True, decimal_places=2, default=0.0, max_digits=10, null=True, verbose_name='Round trip discount')),
                ('options_total', models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name='Options total')),
                ('final_price', models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name='Final price')),
                ('selected_options', models.JSONField(default=list, verbose_name='Selected options')),
                ('special_requirements', models.TextField(blank=True, verbose_name='Special requirements')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transfer_bookings', to=settings.AUTH_USER_MODEL, verbose_name='User')),
                ('route', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='transfers.transferroute', verbose_name='Route')),
                ('pricing', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='transfers.transferroutepricing', verbose_name='Pricing')),
            ],
            options={
                'verbose_name': 'Transfer Booking',
                'verbose_name_plural': 'Transfer Bookings',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='TransferRouteTranslation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(db_index=True, max_length=15, verbose_name='Language')),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('description', models.TextField(blank=True, verbose_name='Description')),
                ('master', parler.fields.TranslationsForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='translations', to='transfers.transferroute')),
            ],
            options={
                'verbose_name': 'Transfer Route Translation',
                'db_table': 'transfers_transferroute_translation',
                'db_tablespace': '',
                'managed': True,
                'default_permissions': (),
            },
            bases=(parler.models.TranslatedFieldsModelMixin, models.Model),
        ),
        migrations.CreateModel(
            name='TransferOptionTranslation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(db_index=True, max_length=15, verbose_name='Language')),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('description', models.TextField(verbose_name='Description')),
                ('master', parler.fields.TranslationsForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='translations', to='transfers.transferoption')),
            ],
            options={
                'verbose_name': 'Transfer Option Translation',
                'db_table': 'transfers_transferoption_translation',
                'db_tablespace': '',
                'managed': True,
                'default_permissions': (),
                'unique_together': {('language_code', 'master')},
            },
            bases=(parler.models.TranslatedFieldsModelMixin, models.Model),
        ),
        migrations.AddIndex(
            model_name='transferroutepricing',
            index=models.Index(fields=['route', 'vehicle_type'], name='transfers_t_route_i_64239c_idx'),
        ),
        migrations.AddIndex(
            model_name='transferroutepricing',
            index=models.Index(fields=['is_active'], name='transfers_t_is_acti_a03bbb_idx'),
        ),
        migrations.AddConstraint(
            model_name='transferroutepricing',
            constraint=models.UniqueConstraint(fields=('route', 'vehicle_type'), name='unique_route_vehicle'),
        ),
        migrations.AlterUniqueTogether(
            name='transferroutepricing',
            unique_together={('route', 'vehicle_type')},
        ),
        migrations.AddIndex(
            model_name='transferbooking',
            index=models.Index(fields=['booking_reference'], name='transfers_t_booking_b916fb_idx'),
        ),
        migrations.AddIndex(
            model_name='transferbooking',
            index=models.Index(fields=['user', 'created_at'], name='transfers_t_user_id_f4d043_idx'),
        ),
        migrations.AddIndex(
            model_name='transferbooking',
            index=models.Index(fields=['route', 'outbound_date'], name='transfers_t_route_i_a14785_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='transferroutetranslation',
            unique_together={('language_code', 'master')},
        ),
    ]

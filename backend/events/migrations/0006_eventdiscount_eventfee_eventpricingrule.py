# Generated by Django 5.0.2 on 2025-07-09 19:58

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0005_eventsection_sectiontickettype'),
    ]

    operations = [
        migrations.CreateModel(
            name='EventDiscount',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('code', models.CharField(max_length=50, unique=True, verbose_name='Discount code')),
                ('name', models.CharField(max_length=255, verbose_name='Discount name')),
                ('description', models.TextField(blank=True, verbose_name='Description')),
                ('discount_type', models.CharField(choices=[('percentage', 'Percentage'), ('fixed', 'Fixed Amount'), ('early_bird', 'Early Bird'), ('group', 'Group Booking'), ('loyalty', 'Loyalty')], default='percentage', max_length=20, verbose_name='Discount type')),
                ('discount_value', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Discount value')),
                ('min_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name='Minimum amount')),
                ('max_discount', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True, verbose_name='Maximum discount')),
                ('max_uses', models.PositiveIntegerField(blank=True, null=True, verbose_name='Maximum uses')),
                ('current_uses', models.PositiveIntegerField(default=0, verbose_name='Current uses')),
                ('valid_from', models.DateTimeField(verbose_name='Valid from')),
                ('valid_until', models.DateTimeField(verbose_name='Valid until')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is active')),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='discounts', to='events.event', verbose_name='Event')),
            ],
            options={
                'verbose_name': 'Event Discount',
                'verbose_name_plural': 'Event Discounts',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='EventFee',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('name', models.CharField(max_length=255, verbose_name='Fee name')),
                ('description', models.TextField(blank=True, verbose_name='Description')),
                ('fee_type', models.CharField(choices=[('service', 'Service Fee'), ('booking', 'Booking Fee'), ('processing', 'Processing Fee'), ('convenience', 'Convenience Fee'), ('tax', 'Tax'), ('vat', 'VAT')], default='service', max_length=20, verbose_name='Fee type')),
                ('calculation_type', models.CharField(choices=[('percentage', 'Percentage of Amount'), ('fixed', 'Fixed Amount'), ('per_ticket', 'Per Ticket'), ('per_booking', 'Per Booking')], default='percentage', max_length=20, verbose_name='Calculation type')),
                ('fee_value', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Fee value')),
                ('min_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10, verbose_name='Minimum amount')),
                ('max_fee', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True, verbose_name='Maximum fee')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is active')),
                ('is_mandatory', models.BooleanField(default=True, verbose_name='Is mandatory')),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fees', to='events.event', verbose_name='Event')),
            ],
            options={
                'verbose_name': 'Event Fee',
                'verbose_name_plural': 'Event Fees',
                'ordering': ['fee_type', 'name'],
            },
        ),
        migrations.CreateModel(
            name='EventPricingRule',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created at')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated at')),
                ('name', models.CharField(max_length=255, verbose_name='Rule name')),
                ('description', models.TextField(blank=True, verbose_name='Description')),
                ('rule_type', models.CharField(choices=[('early_bird', 'Early Bird'), ('last_minute', 'Last Minute'), ('peak_hour', 'Peak Hour'), ('off_peak', 'Off Peak'), ('weekend', 'Weekend'), ('holiday', 'Holiday'), ('capacity_based', 'Capacity Based')], default='early_bird', max_length=20, verbose_name='Rule type')),
                ('adjustment_type', models.CharField(choices=[('percentage', 'Percentage'), ('fixed', 'Fixed Amount'), ('multiplier', 'Multiplier')], default='percentage', max_length=20, verbose_name='Adjustment type')),
                ('adjustment_value', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Adjustment value')),
                ('conditions', models.JSONField(blank=True, default=dict, verbose_name='Conditions')),
                ('priority', models.PositiveIntegerField(default=1, verbose_name='Priority')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is active')),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pricing_rules', to='events.event', verbose_name='Event')),
            ],
            options={
                'verbose_name': 'Event Pricing Rule',
                'verbose_name_plural': 'Event Pricing Rules',
                'ordering': ['-priority', 'name'],
            },
        ),
    ]

# Generated by Django 5.0.2 on 2025-06-26 23:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0002_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='eventcategory',
            name='city',
        ),
        migrations.RemoveField(
            model_name='eventcategory',
            name='country',
        ),
        migrations.RemoveField(
            model_name='eventcategory',
            name='currency',
        ),
        migrations.RemoveField(
            model_name='eventcategory',
            name='image',
        ),
        migrations.RemoveField(
            model_name='eventcategory',
            name='is_featured',
        ),
        migrations.RemoveField(
            model_name='eventcategory',
            name='is_popular',
        ),
        migrations.RemoveField(
            model_name='eventcategory',
            name='price',
        ),
    ]

"""
Background tasks for reservation system
"""

from celery import shared_task
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
import logging

from .models import Reservation, ReservationItem
from .services.cache_service import ReservationCacheService

logger = logging.getLogger(__name__)


@shared_task
def cleanup_expired_reservations():
    """Clean up expired draft reservations"""
    try:
        expired_reservations = Reservation.objects.filter(
            status='draft',
            expires_at__lt=timezone.now()
        )
        
        count = expired_reservations.count()
        if count > 0:
            with transaction.atomic():
                expired_reservations.update(status='expired')
                
                # Log the cleanup
                for reservation in expired_reservations:
                    reservation.history.create(
                        from_status='draft',
                        to_status='expired',
                        reason='Automatically expired'
                    )
            
            logger.info(f"Cleaned up {count} expired reservations")
        
        return f"Cleaned up {count} expired reservations"
        
    except Exception as e:
        logger.error(f"Error cleaning up expired reservations: {str(e)}")
        raise


@shared_task
def send_reservation_confirmation_email(reservation_id: str):
    """Send confirmation email for a reservation"""
    try:
        reservation = Reservation.objects.get(id=reservation_id)
        
        # Here you would integrate with your email service
        # For now, we'll just log the action
        logger.info(f"Sending confirmation email for reservation {reservation.reservation_number}")
        
        # Example email sending logic:
        # from django.core.mail import send_mail
        # send_mail(
        #     subject=f"Reservation Confirmed - {reservation.reservation_number}",
        #     message=f"Your reservation has been confirmed...",
        #     from_email="noreply@example.com",
        #     recipient_list=[reservation.customer_email],
        # )
        
        return f"Confirmation email sent for reservation {reservation.reservation_number}"
        
    except Reservation.DoesNotExist:
        logger.error(f"Reservation {reservation_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error sending confirmation email: {str(e)}")
        raise


@shared_task
def send_reservation_reminder_email(reservation_id: str):
    """Send reminder email for upcoming reservations"""
    try:
        reservation = Reservation.objects.get(id=reservation_id)
        
        # Check if reservation is confirmed and upcoming
        if reservation.status != 'confirmed':
            return f"Reservation {reservation.reservation_number} is not confirmed"
        
        # Get the first booking date from items
        first_item = reservation.items.first()
        if not first_item:
            return f"No items found for reservation {reservation.reservation_number}"
        
        booking_datetime = timezone.make_aware(
            timezone.datetime.combine(first_item.booking_date, first_item.booking_time)
        )
        
        # Send reminder if booking is within 24 hours
        if booking_datetime - timezone.now() <= timedelta(hours=24):
            logger.info(f"Sending reminder email for reservation {reservation.reservation_number}")
            
            # Example email sending logic:
            # send_mail(
            #     subject=f"Reminder: Your booking tomorrow - {reservation.reservation_number}",
            #     message=f"Don't forget your booking tomorrow...",
            #     from_email="noreply@example.com",
            #     recipient_list=[reservation.customer_email],
            # )
        
        return f"Reminder email sent for reservation {reservation.reservation_number}"
        
    except Reservation.DoesNotExist:
        logger.error(f"Reservation {reservation_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error sending reminder email: {str(e)}")
        raise


@shared_task
def update_reservation_statistics():
    """Update reservation statistics for reporting"""
    try:
        from django.db.models import Count, Sum
        from django.utils import timezone
        
        today = timezone.now().date()
        
        # Daily statistics
        daily_stats = Reservation.objects.filter(
            created_at__date=today
        ).aggregate(
            total_reservations=Count('id'),
            total_amount=Sum('total_amount'),
            confirmed_count=Count('id', filter=models.Q(status='confirmed')),
            cancelled_count=Count('id', filter=models.Q(status='cancelled'))
        )
        
        # Product type statistics
        product_stats = ReservationItem.objects.filter(
            reservation__created_at__date=today
        ).values('product_type').annotate(
            count=Count('id'),
            total_quantity=Sum('quantity')
        )
        
        logger.info(f"Daily statistics updated: {daily_stats}")
        logger.info(f"Product statistics updated: {list(product_stats)}")
        
        # Here you could store these statistics in a cache or database
        # for use in dashboards and reports
        
        return {
            'daily_stats': daily_stats,
            'product_stats': list(product_stats)
        }
        
    except Exception as e:
        logger.error(f"Error updating reservation statistics: {str(e)}")
        raise


@shared_task
def invalidate_expired_cache():
    """Invalidate expired cache entries"""
    try:
        # This is a placeholder for cache invalidation logic
        # In a real implementation, you might want to:
        # 1. Check for expired cache keys
        # 2. Invalidate them
        # 3. Clean up any orphaned cache entries
        
        logger.info("Cache invalidation task completed")
        return "Cache invalidation completed"
        
    except Exception as e:
        logger.error(f"Error invalidating cache: {str(e)}")
        raise


@shared_task
def process_bulk_reservations(reservation_ids: list):
    """Process multiple reservations in bulk"""
    try:
        reservations = Reservation.objects.filter(id__in=reservation_ids)
        
        processed_count = 0
        for reservation in reservations:
            try:
                # Process each reservation
                if reservation.status == 'draft':
                    # Send confirmation emails
                    send_reservation_confirmation_email.delay(str(reservation.id))
                    processed_count += 1
                    
            except Exception as e:
                logger.error(f"Error processing reservation {reservation.id}: {str(e)}")
                continue
        
        logger.info(f"Bulk processed {processed_count} reservations")
        return f"Bulk processed {processed_count} reservations"
        
    except Exception as e:
        logger.error(f"Error in bulk reservation processing: {str(e)}")
        raise


@shared_task
def generate_reservation_report(start_date: str, end_date: str, report_type: str = 'summary'):
    """Generate reservation reports"""
    try:
        from django.db.models import Count, Sum, Avg
        from datetime import datetime
        
        start = datetime.strptime(start_date, '%Y-%m-%d').date()
        end = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        reservations = Reservation.objects.filter(
            created_at__date__range=[start, end]
        )
        
        if report_type == 'summary':
            report_data = reservations.aggregate(
                total_reservations=Count('id'),
                total_revenue=Sum('total_amount'),
                avg_reservation_value=Avg('total_amount'),
                confirmed_count=Count('id', filter=models.Q(status='confirmed')),
                cancelled_count=Count('id', filter=models.Q(status='cancelled'))
            )
        elif report_type == 'detailed':
            report_data = {
                'reservations': list(reservations.values(
                    'reservation_number', 'status', 'total_amount', 'created_at'
                )),
                'product_breakdown': list(
                    ReservationItem.objects.filter(
                        reservation__in=reservations
                    ).values('product_type').annotate(
                        count=Count('id'),
                        total_quantity=Sum('quantity'),
                        total_revenue=Sum('total_price')
                    )
                )
            }
        else:
            raise ValueError(f"Unsupported report type: {report_type}")
        
        logger.info(f"Generated {report_type} report for {start_date} to {end_date}")
        return report_data
        
    except Exception as e:
        logger.error(f"Error generating reservation report: {str(e)}")
        raise


@shared_task
def sync_reservation_data():
    """Sync reservation data with external systems"""
    try:
        # This task would handle synchronization with external systems
        # such as payment gateways, inventory systems, etc.
        
        # Example: Sync with payment gateway
        pending_payments = Reservation.objects.filter(
            payment_status='pending',
            status='confirmed'
        )
        
        for reservation in pending_payments:
            # Check payment status with external gateway
            # Update local payment status accordingly
            pass
        
        logger.info("Reservation data sync completed")
        return "Reservation data sync completed"
        
    except Exception as e:
        logger.error(f"Error syncing reservation data: {str(e)}")
        raise 
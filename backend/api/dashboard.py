from ninja import Router
from ninja.errors import HttpError
from django.db.models import Sum, Count
from django.utils import timezone

from api.security import auth_bearer
from apps.reservations.models import Reservation
from apps.payments.models import Payment
from apps.schedules.models import Schedule
from apps.tickets.models import Ticket

router = Router(tags=["Dashboard"])

@router.get("/admin", auth=auth_bearer)
def get_admin_dashboard(request):
    user = request.auth
    if user.profile.role not in ["ADMIN", "SUPER_ADMIN"]:
        raise HttpError(403, "Forbidden")
        
    now = timezone.now()
    
    # Revenue (Paid Payments)
    revenue = Payment.objects.filter(transaction_status="PAID").aggregate(total=Sum('gross_amount'))['total'] or 0
    
    # Total Reservations
    total_reservations = Reservation.objects.count()
    
    # Active Users (Hikers)
    from django.contrib.auth.models import User
    total_users = User.objects.filter(profile__role="HIKER").count()
    
    # Upcoming Schedules
    upcoming_schedules = Schedule.objects.filter(hiking_date__gte=now.date()).order_by('hiking_date')[:5]
    
    schedules_data = [
        {
            "id": str(s.id),
            "date": str(s.hiking_date),
            "remaining": s.remaining_quota,
            "total": s.quota
        } for s in upcoming_schedules
    ]

    return {
        "total_revenue": float(revenue),
        "total_reservations": total_reservations,
        "total_users": total_users,
        "upcoming_schedules": schedules_data
    }

@router.get("/user", auth=auth_bearer)
def get_user_dashboard(request):
    user = request.auth
    
    # Next Hiking
    now = timezone.now()
    next_hiking = Reservation.objects.filter(
        user=user, 
        status="PAID", 
        schedule__hiking_date__gte=now.date()
    ).order_by('schedule__hiking_date').first()
    
    # Active Tickets
    active_tickets = Ticket.objects.filter(
        reservation__user=user, 
        status="ACTIVE"
    ).count()
    
    next_hiking_data = None
    if next_hiking:
        next_hiking_data = {
            "booking_code": next_hiking.booking_code,
            "date": str(next_hiking.schedule.hiking_date),
            "members": next_hiking.total_members
        }

    return {
        "next_hiking": next_hiking_data,
        "active_tickets": active_tickets
    }

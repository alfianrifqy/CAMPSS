from ninja import Router, Schema
from ninja.errors import HttpError
from django.utils import timezone
from api.security import auth_bearer

from apps.tickets.models import Ticket
from apps.checkins.models import CheckIn

router = Router(tags=["Check-In"])

from typing import List, Optional
import datetime

class CheckInSchema(Schema):
    ticket_number: str

class CheckInReportSchema(Schema):
    ticket_number: str
    booking_code: str
    leader_name: str
    checked_in_at: datetime.datetime
    checked_out_at: Optional[datetime.datetime]
    checked_in_by: str
    status: str

@router.get("/report", response=List[CheckInReportSchema], auth=auth_bearer)
def get_checkin_report(request):
    user = request.auth
    if user.profile.role not in ["ADMIN", "SUPER_ADMIN", "OFFICER"]:
        raise HttpError(403, "Only officers can view reports")
        
    checkins = CheckIn.objects.all().order_by('-checked_in_at')
    
    result = []
    for c in checkins:
        result.append({
            "ticket_number": c.ticket.ticket_number,
            "booking_code": c.ticket.reservation.booking_code,
            "leader_name": c.ticket.reservation.leader_name,
            "checked_in_at": c.checked_in_at,
            "checked_out_at": c.checked_out_at,
            "checked_in_by": c.checked_in_by,
            "status": "COMPLETED" if c.checked_out_at else "HIKING"
        })
    return result

@router.post("/scan", auth=auth_bearer)
def scan_ticket(request, payload: CheckInSchema):
    user = request.auth
    
    # Only Admin or Officer can scan
    if user.profile.role not in ["ADMIN", "SUPER_ADMIN", "OFFICER"]:
        raise HttpError(403, "Only officers can scan tickets")
        
    try:
        ticket = Ticket.objects.get(ticket_number=payload.ticket_number)
    except Ticket.DoesNotExist:
        raise HttpError(404, "Ticket not found")
        
    if ticket.status == "USED":
        raise HttpError(400, "Ticket has already been used")
        
    if ticket.status == "EXPIRED":
        raise HttpError(400, "Ticket is expired")
        
    # Check if already checked in
    if hasattr(ticket, 'checkin'):
        checkin = ticket.checkin
        if checkin.checked_out_at is None:
            # Doing check out
            checkin.checked_out_at = timezone.now()
            checkin.checked_out_by = user.username
            checkin.save()
            ticket.status = "USED"
            ticket.save()
            return {"message": "Check-out successful", "action": "checkout"}
        else:
            raise HttpError(400, "Hiker already checked out")
            
    # New check in validation
    current_date = timezone.now().date()
    hiking_date = ticket.reservation.schedule.hiking_date
    
    if current_date != hiking_date:
        raise HttpError(400, f"Check-in rejected. Ticket is for {hiking_date.strftime('%d %b %Y')}, but today is {current_date.strftime('%d %b %Y')}.")
        
    # New check in
    checkin = CheckIn.objects.create(
        ticket=ticket,
        checked_in_at=timezone.now(),
        checked_in_by=user.username
    )
    
    return {"message": "Check-in successful", "action": "checkin"}

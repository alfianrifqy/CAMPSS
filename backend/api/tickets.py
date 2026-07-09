from ninja import Router, Schema
from ninja.errors import HttpError
from typing import List
from django.utils import timezone
from api.security import auth_bearer

from apps.tickets.models import Ticket
from apps.reservations.models import Reservation
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile

router = Router(tags=["Tickets"])

class TicketSchema(Schema):
    id: str
    ticket_number: str
    status: str
    reservation_id: str

@router.get("/", response=List[TicketSchema], auth=auth_bearer)
def list_tickets(request):
    user = request.auth
    if user.profile.role in ["ADMIN", "SUPER_ADMIN", "OFFICER"]:
        return Ticket.objects.all()
    return Ticket.objects.filter(reservation__user=user)

def generate_ticket_for_reservation(reservation):
    if hasattr(reservation, 'ticket'):
        return reservation.ticket

    ticket_number = f"TIX-{reservation.booking_code}"
    
    # Generate QR Code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(ticket_number)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    
    ticket = Ticket(
        reservation=reservation,
        ticket_number=ticket_number,
        status="ACTIVE"
    )
    ticket.qr_code.save(f"{ticket_number}.png", ContentFile(buffer.getvalue()), save=False)
    ticket.save()
    return ticket

@router.post("/generate/{reservation_id}", response=TicketSchema, auth=auth_bearer)
def generate_ticket(request, reservation_id: str):
    user = request.auth
    try:
        reservation = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        raise HttpError(404, "Reservation not found")

    if reservation.status != "PAID":
        raise HttpError(400, "Reservation is not paid yet")
        
    return generate_ticket_for_reservation(reservation)

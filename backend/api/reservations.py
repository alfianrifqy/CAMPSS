from decimal import Decimal
import random

from django.db import transaction

from ninja import Router, Schema
from ninja.errors import HttpError
from ninja.pagination import paginate

from typing import List, Optional

from api.security import auth_bearer

from apps.schedules.models import Schedule
from apps.reservations.models import Reservation, ReservationMember

router = Router(tags=["Reservations"])


# ==========================
# SCHEMA
# ==========================

class MemberSchema(Schema):
    full_name: str
    nik: str
    birth_date: Optional[str] = None
    phone: Optional[str] = None


class ReservationCreateSchema(Schema):
    schedule_id: str
    members: List[MemberSchema]


import json
from ninja import Form, File
from ninja.files import UploadedFile

# ==========================
# CREATE RESERVATION
# ==========================

@router.post("/", auth=auth_bearer)
@transaction.atomic
def create_reservation(
    request, 
    payload: str = Form(...)
):
    import json
    data = json.loads(payload)
    parsed_payload = ReservationCreateSchema(**data)

    # Authentication
    user = request.auth

    # Schedule
    try:
        schedule = Schedule.objects.get(id=parsed_payload.schedule_id)
    except Schedule.DoesNotExist:
        raise HttpError(404, "Jadwal tidak ditemukan")

    # Total anggota
    total_members = len(parsed_payload.members)

    if total_members == 0:
        raise HttpError(400, "Minimal 1 anggota")

    # Cek kuota
    if schedule.remaining_quota < total_members:
        raise HttpError(400, "Kuota tidak mencukupi")

    # Booking Code
    booking_code = f"CMP-{random.randint(100000,999999)}"

    # Total Harga
    total_price = Decimal(schedule.price) * total_members

    # Create Reservation
    reservation = Reservation.objects.create(
        booking_code=booking_code,
        user=user,
        schedule=schedule,
        leader_name=parsed_payload.members[0].full_name,
        leader_phone=parsed_payload.members[0].phone,
        total_members=total_members,
        total_price=total_price,
    )

    # Create Members
    for index, member in enumerate(parsed_payload.members):
        res_member = ReservationMember.objects.create(
            reservation=reservation,
            full_name=member.full_name,
            nik=member.nik,
            birth_date=member.birth_date if member.birth_date else "2000-01-01",
            phone=member.phone if member.phone else "-",
            is_leader=(index == 0)
        )
        
        # Save photo
        if index == 0:
            if user.profile.identity_photo:
                res_member.identity_photo = user.profile.identity_photo
                res_member.save()
        else:
            ktp_file = request.FILES.get(f'member_ktp_{index}')
            if ktp_file:
                res_member.identity_photo.save(ktp_file.name, ktp_file)
                res_member.save()

    # Kurangi Kuota
    schedule.remaining_quota -= total_members
    schedule.save()

    return {
        "message": "Reservasi berhasil dibuat",
        "reservation_id": str(reservation.id),
        "booking_code": reservation.booking_code,
        "total_members": reservation.total_members,
        "total_price": float(reservation.total_price),
        "status": reservation.status
    }


import uuid
import datetime

class ReservationSchema(Schema):
    id: uuid.UUID
    booking_code: str
    schedule_id: uuid.UUID
    leader_name: str
    leader_phone: str
    total_members: int
    total_price: float
    status: str
    created_at: datetime.datetime
    checkin_status: str = "NOT ARRIVED"

    @staticmethod
    def resolve_checkin_status(obj):
        if hasattr(obj, 'ticket') and obj.ticket:
            if hasattr(obj.ticket, 'checkin') and obj.ticket.checkin:
                if obj.ticket.checkin.checked_out_at:
                    return "CHECKED OUT"
                return "HIKING"
        return "NOT ARRIVED"

class ScheduleBasicSchema(Schema):
    id: uuid.UUID
    hiking_date: datetime.date

class ReservationMemberResponseSchema(Schema):
    id: uuid.UUID
    full_name: str
    nik: str
    phone: str
    is_leader: bool
    identity_photo: Optional[str] = None

class TicketBasicSchema(Schema):
    ticket_number: str
    status: str
    qr_code_url: Optional[str] = None

    @staticmethod
    def resolve_qr_code_url(obj):
        if obj.qr_code:
            return obj.qr_code.url
        return None

class ReservationDetailSchema(ReservationSchema):
    schedule: ScheduleBasicSchema
    members: List[ReservationMemberResponseSchema]
    ticket: Optional[TicketBasicSchema] = None

from django.db.models import Q

@router.get("/", response=List[ReservationSchema], auth=auth_bearer)
@paginate
def list_reservations(request, search: str = None, status: str = None):
    user = request.auth
    
    # If admin, return all. Else return user's reservations.
    if user.profile.role in ["ADMIN", "SUPER_ADMIN"]:
        reservations = Reservation.objects.all()
    else:
        reservations = Reservation.objects.filter(user=user)

    if status:
        reservations = reservations.filter(status=status)
    if search:
        reservations = reservations.filter(
            Q(booking_code__icontains=search) | Q(leader_name__icontains=search)
        )
        
    return reservations

@router.get("/{reservation_id}", response=ReservationDetailSchema, auth=auth_bearer)
def get_reservation(request, reservation_id: str):
    user = request.auth
    try:
        reservation = Reservation.objects.get(id=reservation_id)
        if user.profile.role not in ["ADMIN", "SUPER_ADMIN"] and reservation.user != user:
            raise HttpError(403, "Forbidden")
        return reservation
    except Reservation.DoesNotExist:
        raise HttpError(404, "Reservation not found")

@router.delete("/{reservation_id}", auth=auth_bearer)
def delete_reservation(request, reservation_id: str):
    user = request.auth
    try:
        reservation = Reservation.objects.get(id=reservation_id)
        if user.profile.role not in ["ADMIN", "SUPER_ADMIN"]:
            raise HttpError(403, "Only admins can delete reservations")
            
        # Return quota
        schedule = reservation.schedule
        schedule.remaining_quota += reservation.total_members
        schedule.save()
        
        reservation.delete()
        return {"message": "Reservation deleted and quota restored"}
    except Reservation.DoesNotExist:
        raise HttpError(404, "Reservation not found")
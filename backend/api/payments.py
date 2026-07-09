from ninja import Router, Schema
from ninja.errors import HttpError
from typing import Dict, Any
import datetime
from django.utils import timezone

from api.security import auth_bearer
from api.midtrans import snap

from apps.reservations.models import Reservation
from apps.payments.models import Payment

router = Router(tags=["Payments"])

class PaymentCreateSchema(Schema):
    reservation_id: str

@router.post("/create", auth=auth_bearer)
def create_payment(request, payload: PaymentCreateSchema):
    user = request.auth

    try:
        reservation = Reservation.objects.get(id=payload.reservation_id)
    except Reservation.DoesNotExist:
        raise HttpError(404, "Reservation not found")

    if reservation.user != user:
        raise HttpError(403, "Forbidden")
        
    if reservation.status != "PENDING_PAYMENT":
        raise HttpError(400, f"Reservation status is {reservation.status}, cannot pay")

    # Check if payment already exists
    if hasattr(reservation, 'payment'):
        payment = reservation.payment
        if payment.transaction_status in ["PENDING"]:
            return {
                "snap_token": payment.snap_token,
                "payment_url": payment.payment_url,
                "order_id": payment.order_id
            }
        elif payment.transaction_status == "PAID":
            raise HttpError(400, "Already paid")

    order_id = f"PAY-{reservation.booking_code}"

    # Prepare Midtrans payload
    param = {
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": int(reservation.total_price)
        },
        "customer_details": {
            "first_name": reservation.leader_name,
            "email": user.email,
            "phone": reservation.leader_phone
        }
    }

    try:
        transaction = snap.create_transaction(param)
        snap_token = transaction['token']
        redirect_url = transaction['redirect_url']
    except Exception as e:
        raise HttpError(500, f"Midtrans Error: {str(e)}")

    payment = Payment.objects.create(
        reservation=reservation,
        order_id=order_id,
        gross_amount=reservation.total_price,
        snap_token=snap_token,
        payment_url=redirect_url,
        expired_at=timezone.now() + datetime.timedelta(days=1)
    )

    return {
        "snap_token": payment.snap_token,
        "payment_url": payment.payment_url,
        "order_id": payment.order_id
    }

@router.post("/callback")
def payment_callback(request, payload: Dict[str, Any]):
    # Midtrans sends POST with JSON payload
    order_id = payload.get('order_id')
    transaction_status = payload.get('transaction_status')
    fraud_status = payload.get('fraud_status')
    
    if not order_id:
        return {"status": "ok"}
        
    try:
        payment = Payment.objects.get(order_id=order_id)
    except Payment.DoesNotExist:
        return {"status": "not found"}

    reservation = payment.reservation

    if transaction_status == 'capture':
        if fraud_status == 'challenge':
            payment.transaction_status = 'PENDING'
        elif fraud_status == 'accept':
            payment.transaction_status = 'PAID'
            payment.paid_at = timezone.now()
            reservation.status = 'PAID'
            from api.tickets import generate_ticket_for_reservation
            generate_ticket_for_reservation(reservation)
    elif transaction_status == 'settlement':
        payment.transaction_status = 'PAID'
        payment.paid_at = timezone.now()
        reservation.status = 'PAID'
        from api.tickets import generate_ticket_for_reservation
        generate_ticket_for_reservation(reservation)
    elif transaction_status == 'cancel' or transaction_status == 'deny' or transaction_status == 'expire':
        payment.transaction_status = 'FAILED'
        reservation.status = 'CANCELLED'
        # Return quota
        schedule = reservation.schedule
        schedule.remaining_quota += reservation.total_members
        schedule.save()
    elif transaction_status == 'pending':
        payment.transaction_status = 'PENDING'

    payment.save()
    reservation.save()

    return {"status": "ok"}

@router.post("/simulate-success/{reservation_id}", auth=auth_bearer)
def simulate_payment_success(request, reservation_id: str):
    user = request.auth
    try:
        reservation = Reservation.objects.get(id=reservation_id)
        if reservation.user != user:
            raise HttpError(403, "Forbidden")
            
        reservation.status = 'PAID'
        reservation.save()
        
        # Check if payment exists, if not create dummy
        if hasattr(reservation, 'payment'):
            payment = reservation.payment
            payment.transaction_status = 'PAID'
            payment.paid_at = timezone.now()
            payment.save()
        else:
            Payment.objects.create(
                reservation=reservation,
                order_id=f"PAY-{reservation.booking_code}",
                gross_amount=reservation.total_price,
                snap_token="dummy",
                payment_url="dummy",
                transaction_status="PAID",
                paid_at=timezone.now(),
                expired_at=timezone.now() + datetime.timedelta(days=1)
            )
            
        from api.tickets import generate_ticket_for_reservation
        generate_ticket_for_reservation(reservation)
        
        return {"status": "ok", "message": "Simulated success"}
    except Reservation.DoesNotExist:
        raise HttpError(404, "Reservation not found")

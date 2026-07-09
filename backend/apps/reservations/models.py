import uuid

from django.db import models
from django.contrib.auth.models import User

from apps.schedules.models import Schedule
from core.models import BaseModel


class Reservation(BaseModel):

    class Status(models.TextChoices):
        PENDING_PAYMENT = "PENDING_PAYMENT", "Pending Payment"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"

    booking_code = models.CharField(
        max_length=30,
        unique=True
    )

    leader_name = models.CharField(
    max_length=100,
    blank=True,
    default=""
    )

    leader_phone = models.CharField(
        max_length=20,
        blank=True,
        default=""
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reservations"
    )

    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.PROTECT,
        related_name="reservations"
    )

    total_members = models.PositiveIntegerField()

    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING_PAYMENT
    )

    class Meta:
        db_table = "reservations"
        ordering = ["-created_at"]

    def __str__(self):
        return self.booking_code
    
class ReservationMember(BaseModel):

    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.CASCADE,
        related_name="members"
    )

    full_name = models.CharField(max_length=100)

    nik = models.CharField(max_length=20)

    birth_date = models.DateField()

    phone = models.CharField(max_length=20)

    is_leader = models.BooleanField(
        default=False
    )
    
    identity_photo = models.ImageField(
        upload_to="reservation_ktp/",
        blank=True,
        null=True
    )

    class Meta:
        db_table = "reservation_members"
        ordering = ["full_name"]

    def __str__(self):
        return self.full_name
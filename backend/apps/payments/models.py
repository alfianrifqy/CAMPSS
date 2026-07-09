import uuid

from django.db import models

from apps.reservations.models import Reservation
from core.models import BaseModel


class Payment(BaseModel):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        EXPIRED = "EXPIRED", "Expired"
        CANCELLED = "CANCELLED", "Cancelled"
        FAILED = "FAILED", "Failed"

    reservation = models.OneToOneField(
        Reservation,
        on_delete=models.CASCADE,
        related_name="payment"
    )

    order_id = models.CharField(
        max_length=100,
        unique=True
    )

    transaction_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    snap_token = models.TextField(
        blank=True,
        null=True
    )

    payment_url = models.TextField(
        blank=True,
        null=True
    )

    payment_type = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    gross_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    transaction_status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    expired_at = models.DateTimeField(
        blank=True,
        null=True
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_id
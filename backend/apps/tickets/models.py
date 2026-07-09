from django.db import models

from core.models import BaseModel
from apps.reservations.models import Reservation


class Ticket(BaseModel):

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        USED = "USED", "Used"
        EXPIRED = "EXPIRED", "Expired"

    reservation = models.OneToOneField(
        Reservation,
        on_delete=models.CASCADE,
        related_name="ticket"
    )

    ticket_number = models.CharField(
        max_length=50,
        unique=True
    )

    qr_code = models.ImageField(
        upload_to="tickets/",
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tickets"

    def __str__(self):
        return self.ticket_number
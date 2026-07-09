from django.db import models

from core.models import BaseModel
from apps.tickets.models import Ticket


class CheckIn(BaseModel):

    ticket = models.OneToOneField(
        Ticket,
        on_delete=models.CASCADE,
        related_name="checkin"
    )

    checked_in_at = models.DateTimeField(
        blank=True,
        null=True
    )

    checked_out_at = models.DateTimeField(
        blank=True,
        null=True
    )

    checked_in_by = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    checked_out_by = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    class Meta:
        db_table = "checkins"

    def __str__(self):
        return self.ticket.ticket_number
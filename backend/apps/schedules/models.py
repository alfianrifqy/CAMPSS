import uuid

from django.db import models
from core.models import BaseModel


class Schedule(BaseModel):

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        CLOSED = "CLOSED", "Closed"

    hiking_date = models.DateField(
        unique=True
    )

    quota = models.PositiveIntegerField()

    remaining_quota = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    weather_status = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    weather_temperature = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        blank=True,
        null=True
    )

    weather_description = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.OPEN
    )

    internal_note = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        db_table = "schedules"
        ordering = ["hiking_date"]

    def __str__(self):
        return f"{self.hiking_date} ({self.status})"
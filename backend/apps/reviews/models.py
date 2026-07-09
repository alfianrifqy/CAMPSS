from django.db import models

from core.models import BaseModel
from apps.reservations.models import Reservation


class Review(BaseModel):

    reservation = models.OneToOneField(
        Reservation,
        on_delete=models.CASCADE,
        related_name="review"
    )

    rating = models.PositiveSmallIntegerField()

    comment = models.TextField()

    class Meta:
        db_table = "reviews"

    def __str__(self):
        return f"{self.rating} ⭐"
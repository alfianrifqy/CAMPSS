from django.db import models
from django.contrib.auth.models import User

from core.models import BaseModel


class ActivityLog(BaseModel):

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs"
    )

    activity = models.CharField(max_length=255)

    ip_address = models.GenericIPAddressField(
        blank=True,
        null=True
    )

    class Meta:
        db_table = "activity_logs"
        ordering = ["-created_at"]

    def __str__(self):
        return self.activity
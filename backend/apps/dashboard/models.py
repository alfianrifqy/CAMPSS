from django.db import models

from core.models import BaseModel


class SystemSetting(BaseModel):

    key = models.CharField(
        max_length=100,
        unique=True
    )

    value = models.TextField()

    description = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        db_table = "system_settings"
        ordering = ["key"]

    def __str__(self):
        return self.key
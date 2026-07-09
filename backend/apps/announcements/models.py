from django.db import models

from core.models import BaseModel


class Announcement(BaseModel):

    title = models.CharField(max_length=200)

    content = models.TextField()

    is_published = models.BooleanField(default=True)

    class Meta:
        db_table = "announcements"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
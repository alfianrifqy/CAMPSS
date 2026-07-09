from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "user",
        "is_read",
    )

    list_filter = (
        "is_read",
    )
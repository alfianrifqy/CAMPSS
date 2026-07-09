from django.contrib import admin

from .models import Schedule


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):

    list_display = (
        "hiking_date",
        "quota",
        "remaining_quota",
        "price",
        "status",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "hiking_date",
    )

    ordering = (
        "hiking_date",
    )
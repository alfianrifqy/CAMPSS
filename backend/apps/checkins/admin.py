from django.contrib import admin
from .models import CheckIn


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):

    list_display = (
        "ticket",
        "checked_in_at",
        "checked_out_at",
    )

    search_fields = (
        "ticket__ticket_number",
    )
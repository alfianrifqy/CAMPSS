from django.contrib import admin
from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):

    list_display = (
        "ticket_number",
        "reservation",
        "status",
    )

    search_fields = (
        "ticket_number",
    )

    list_filter = (
        "status",
    )
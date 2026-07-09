from django.contrib import admin

from .models import Reservation
from .models import Reservation, ReservationMember


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):

    list_display = (
        "booking_code",
        "user",
        "schedule",
        "total_members",
        "status",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "booking_code",
        "user__username",
    )

    ordering = (
        "-created_at",
    )

@admin.register(ReservationMember)
class ReservationMemberAdmin(admin.ModelAdmin):

    list_display = (
        "full_name",
        "reservation",
        "nik",
        "phone",
    )

    search_fields = (
        "full_name",
        "nik",
    )

    ordering = (
        "full_name",
    )
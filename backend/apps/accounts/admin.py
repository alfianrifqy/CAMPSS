from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):

    list_display = (
        "full_name",
        "nik",
        "phone",
        "gender",
    )

    search_fields = (
        "full_name",
        "nik",
        "phone",
    )

    list_filter = (
        "gender",
    )

    ordering = (
        "full_name",
    )
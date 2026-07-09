from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = (
        "order_id",
        "reservation",
        "gross_amount",
        "transaction_status",
    )

    list_filter = (
        "transaction_status",
    )

    search_fields = (
        "order_id",
        "transaction_id",
    )

    ordering = (
        "-created_at",
    )
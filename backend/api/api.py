from ninja import NinjaAPI

from api.auth import router as auth_router
from api.schedules import router as schedule_router
from api.reservations import router as reservation_router
from api.payments import router as payment_router
from api.tickets import router as ticket_router
from api.checkins import router as checkin_router
from api.dashboard import router as dashboard_router

api = NinjaAPI(
    title="CAMPSS API",
    version="1.0.0",
    description="Campurejo Smart System REST API"
)

api.add_router("/auth/", auth_router)
api.add_router("/schedules/", schedule_router)
api.add_router("/reservations/", reservation_router)
api.add_router("/payments/", payment_router)
api.add_router("/tickets/", ticket_router)
api.add_router("/checkins/", checkin_router)
api.add_router("/dashboard/", dashboard_router)
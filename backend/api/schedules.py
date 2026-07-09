from ninja import Router, Schema
from ninja.pagination import paginate
from typing import Optional
from ninja.errors import HttpError
import uuid
import datetime

from apps.schedules.models import Schedule

router = Router(tags=["Schedules"])

class ScheduleSchema(Schema):
    id: uuid.UUID
    hiking_date: datetime.date
    quota: int
    remaining_quota: int
    price: float
    weather_status: Optional[str] = None
    weather_temperature: Optional[float] = None
    weather_description: Optional[str] = None
    status: str
    internal_note: Optional[str] = None

@router.get("/", response=list[ScheduleSchema])
@paginate
def list_schedules(
    request,
    status: str = None,
    weather: str = None,
    month: str = None,
):
    schedules = Schedule.objects.all()

    if status:
        schedules = schedules.filter(status=status)

    if weather:
        schedules = schedules.filter(
            weather_status__icontains=weather
        )

    if month:
        # Expected month format: YYYY-MM
        try:
            year, m = month.split('-')
            schedules = schedules.filter(hiking_date__year=year, hiking_date__month=m)
        except ValueError:
            pass

    return schedules

@router.get("/{schedule_id}", response=ScheduleSchema)
def get_schedule(request, schedule_id: str):
    try:
        return Schedule.objects.get(id=schedule_id)
    except Schedule.DoesNotExist:
        raise HttpError(404, "Schedule not found")

class ScheduleCreateSchema(Schema):
    hiking_date: datetime.date
    quota: int
    price: float
    status: str = "OPEN"
    internal_note: Optional[str] = None

from api.security import auth_bearer

@router.post("/", response=ScheduleSchema, auth=auth_bearer)
def create_schedule(request, payload: ScheduleCreateSchema):
    # Only Admin should be allowed, but we'll check role
    if request.auth.profile.role not in ["ADMIN", "SUPER_ADMIN"]:
        raise HttpError(403, "Forbidden")
    
    schedule = Schedule.objects.create(
        hiking_date=payload.hiking_date,
        quota=payload.quota,
        remaining_quota=payload.quota,
        price=payload.price,
        status=payload.status,
        internal_note=payload.internal_note
    )
    return schedule

class ScheduleUpdateSchema(Schema):
    quota: int
    price: float
    status: str
    internal_note: Optional[str] = None

@router.put("/{schedule_id}", response=ScheduleSchema, auth=auth_bearer)
def update_schedule(request, schedule_id: str, payload: ScheduleUpdateSchema):
    if request.auth.profile.role not in ["ADMIN", "SUPER_ADMIN"]:
        raise HttpError(403, "Forbidden")
        
    try:
        schedule = Schedule.objects.get(id=schedule_id)
    except Schedule.DoesNotExist:
        raise HttpError(404, "Schedule not found")
        
    # Adjust remaining quota if quota changed
    if payload.quota != schedule.quota:
        diff = payload.quota - schedule.quota
        schedule.remaining_quota += diff
        
    schedule.quota = payload.quota
    schedule.price = payload.price
    schedule.status = payload.status
    schedule.internal_note = payload.internal_note
    schedule.save()
    
    return schedule
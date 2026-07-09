import uuid

from django.db import models
from django.contrib.auth.models import User
from core.models import BaseModel

class Profile(BaseModel):

    class Gender(models.TextChoices):
        MALE = "L", "Laki-laki"
        FEMALE = "P", "Perempuan"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    class Role(models.TextChoices):
        SUPER_ADMIN = "SUPER_ADMIN", "Super Admin"
        ADMIN = "ADMIN", "Admin"
        OFFICER = "OFFICER", "Officer"
        HIKER = "HIKER", "Hiker"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    full_name = models.CharField(max_length=100)

    phone = models.CharField(max_length=20)

    role = models.CharField(
    max_length=20,
    choices=Role.choices,
    default=Role.HIKER
    )

    nik = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True
    )

    birth_date = models.DateField(
        blank=True,
        null=True
    )

    gender = models.CharField(
        max_length=1,
        choices=Gender.choices,
        blank=True,
        null=True
    )

    address = models.TextField(
        blank=True,
        default=""
    )

    emergency_name = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    emergency_phone = models.CharField(
        max_length=20,
        blank=True,
        default=""
    )

    identity_photo = models.ImageField(
        upload_to="identity_cards/",
        blank=True,
        null=True
    )

    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True
    )

    class Meta:
        db_table = "profiles"
        ordering = ["full_name"]

    def __str__(self):
        return self.full_name
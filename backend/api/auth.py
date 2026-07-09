from ninja import Schema, Router
from django.contrib.auth.models import User
from apps.accounts.models import Profile
import jwt
from datetime import datetime, timedelta, UTC
from django.conf import settings
from django.contrib.auth import authenticate
from api.security import auth_bearer
from ninja.errors import HttpError

router = Router(tags=["Authentication"])

class RegisterSchema(Schema):
    username: str
    email: str
    password: str
    full_name: str
    phone: str

class LoginSchema(Schema):
    username: str
    password: str

@router.post("/register")
def register(request, payload: RegisterSchema):
    if User.objects.filter(username=payload.username).exists():
        return {"message": "Username already exists"}
    if User.objects.filter(email=payload.email).exists():
        return {"message": "Email already exists"}

    user = User.objects.create_user(
        username=payload.username,
        email=payload.email,
        password=payload.password,
    )

    Profile.objects.create(
        user=user,
        full_name=payload.full_name,
        phone=payload.phone,
        role="HIKER"
    )

    return {"message": "Register success"}

@router.post("/login")
def login(request, payload: LoginSchema):
    user = authenticate(
        username=payload.username,
        password=payload.password
    )

    if user is None:
        return {"message": "Username atau password salah"}

    token_payload = {
        "user_id": user.id,
        "username": user.username,
        "exp": datetime.now(UTC) + timedelta(hours=12)
    }

    token = jwt.encode(
        token_payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )

    return {
        "access_token": token,
        "token_type": "Bearer"
    }

from ninja import Form, File
from ninja.files import UploadedFile

@router.get("/me", auth=auth_bearer)
def me(request):
    user = request.auth
    profile = user.profile
    
    is_profile_complete = bool(
        profile.full_name and 
        profile.phone and 
        profile.nik and 
        profile.emergency_name and 
        profile.emergency_phone and 
        profile.identity_photo
    )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": profile.full_name,
        "phone": profile.phone,
        "role": profile.role,
        "profile_picture": request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
        "nik": profile.nik,
        "emergency_name": profile.emergency_name,
        "emergency_phone": profile.emergency_phone,
        "identity_photo": request.build_absolute_uri(profile.identity_photo.url) if profile.identity_photo else None,
        "is_profile_complete": is_profile_complete
    }

@router.put("/me", auth=auth_bearer)
def update_me(
    request, 
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    nik: str = Form(None),
    emergency_name: str = Form(None),
    emergency_phone: str = Form(None),
    profile_picture: UploadedFile = File(None),
    identity_photo: UploadedFile = File(None)
):
    user = request.auth
    profile = user.profile
    
    # Update User email
    if email != user.email:
        if User.objects.exclude(id=user.id).filter(email=email).exists():
            raise HttpError(400, "Email already in use")
        user.email = email
        user.save()
        
    # Update Profile
    profile.full_name = full_name
    profile.phone = phone
    if nik is not None:
        profile.nik = nik if (nik and nik.strip() and nik != "null") else None
    if emergency_name is not None:
        profile.emergency_name = emergency_name if (emergency_name and emergency_name.strip() and emergency_name != "null") else ""
    if emergency_phone is not None:
        profile.emergency_phone = emergency_phone if (emergency_phone and emergency_phone.strip() and emergency_phone != "null") else ""
    
    if profile_picture:
        profile.profile_picture.save(profile_picture.name, profile_picture)
    
    if identity_photo:
        profile.identity_photo.save(identity_photo.name, identity_photo)
        
    profile.save()
    
    return {"message": "Profile updated successfully"}
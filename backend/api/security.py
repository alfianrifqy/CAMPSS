import jwt
from django.conf import settings
from django.contrib.auth.models import User
from ninja.security import HttpBearer
from ninja.errors import HttpError

class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"]
            )
            user = User.objects.get(id=payload["user_id"])
            return user
        except jwt.ExpiredSignatureError:
            raise HttpError(401, "Token has expired")
        except jwt.DecodeError:
            raise HttpError(401, "Invalid token")
        except User.DoesNotExist:
            raise HttpError(401, "User not found")
        except Exception:
            raise HttpError(401, "Unauthorized")

auth_bearer = AuthBearer()
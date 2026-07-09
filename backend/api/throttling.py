import time
from functools import wraps
from django.core.cache import cache
from ninja.errors import HttpError

def rate_limit(max_requests=5, window=60):
    """
    Decorator for rate limiting endpoints.
    max_requests: Maximum number of requests allowed within the window.
    window: Time window in seconds.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            # Cek apakah user sudah terautentikasi via request.auth (AuthBearer)
            user_id = getattr(request.auth, 'id', None)
            
            if user_id:
                identifier = f"user_{user_id}"
            else:
                # Fallback menggunakan IP address jika anonim
                identifier = request.META.get('HTTP_X_FORWARDED_FOR')
                if identifier:
                    identifier = identifier.split(',')[0]
                else:
                    identifier = request.META.get('REMOTE_ADDR', 'unknown_ip')
                    
            # Buat key cache yang unik berdasarkan fungsi dan identifier
            cache_key = f"throttle_{func.__name__}_{identifier}"
            
            # Ambil riwayat request dari cache
            requests = cache.get(cache_key, [])
            current_time = time.time()
            
            # Hapus riwayat request yang lebih lama dari window (sliding window)
            requests = [t for t in requests if current_time - t < window]
            
            # Jika jumlah request dalam window melebihi batas, tolak
            if len(requests) >= max_requests:
                raise HttpError(429, "Too Many Requests. Silakan tunggu beberapa saat.")
                
            # Tambahkan request saat ini ke riwayat
            requests.append(current_time)
            
            # Simpan kembali ke cache dengan waktu kedaluwarsa sesuai window
            cache.set(cache_key, requests, window)
            
            return func(request, *args, **kwargs)
        return wrapper
    return decorator

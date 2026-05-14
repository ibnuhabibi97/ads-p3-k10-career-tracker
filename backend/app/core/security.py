from datetime import datetime, timedelta, timezone
from typing import Optional
import hashlib
import jwt
from jwt import PyJWTError
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

# Penentu URL untuk Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def _jwt_secret_key() -> str:
    secret_key = str(settings.SECRET_KEY)
    if len(secret_key.encode("utf-8")) < 32:
        return hashlib.sha256(secret_key.encode("utf-8")).hexdigest()
    return secret_key

# --- FUNGSI HASHING & TOKEN ---
def get_password_hash(password: str) -> str:
    teks_password = str(password)[:70].encode("utf-8")
    hashed = bcrypt.hashpw(teks_password, bcrypt.gensalt())
    return hashed.decode("utf-8")

def verifikasi_password(plain_password: str, hashed_password: str) -> bool:
    teks_password = str(plain_password)[:70].encode("utf-8")
    return bcrypt.checkpw(teks_password, hashed_password.encode("utf-8"))

def buat_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, _jwt_secret_key(), algorithm=settings.ALGORITHM)
    return encoded_jwt

# --- FUNGSI DEPENDENCY (AUTENTIKASI) ---
def get_current_user(token: str = Depends(oauth2_scheme)):
    """Mengekstrak dan memvalidasi token JWT untuk mendapatkan data user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kedaluwarsa",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, _jwt_secret_key(), algorithms=[settings.ALGORITHM])
        
        #Ekstrak id dari token JWT
        username: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: int = payload.get("id") # Tambahan baru
        
        #Pastikan user_id juga tidak kosong
        if username is None or role is None or user_id is None:
            raise credentials_exception
            
    except PyJWTError:
        raise credentials_exception
        
    #Kembalikan ketiganya dalam dictionary
    return {"username": username, "role": role, "user_id": user_id}

# --- CLASS DEPENDENCY (OTORISASI) ---
class RoleChecker:
    """Class untuk membatasi akses endpoint berdasarkan role."""
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses ditolak. Endpoint ini hanya diperuntukkan bagi role: {', '.join(self.allowed_roles)}"
            )
        return current_user
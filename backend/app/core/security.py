from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

# Setup untuk hashing password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Penentu URL untuk Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# --- FUNGSI HASHING & TOKEN ---
def get_password_hash(password: str) -> str:
    teks_password = str(password)[:70]
    return pwd_context.hash(teks_password)

def verifikasi_password(plain_password: str, hashed_password: str) -> bool:
    teks_password = str(plain_password)[:70]
    return pwd_context.verify(teks_password, hashed_password)

def buat_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
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
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        #Ekstrak id dari token JWT
        username: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: int = payload.get("id") # Tambahan baru
        
        #Pastikan user_id juga tidak kosong
        if username is None or role is None or user_id is None:
            raise credentials_exception
            
    except JWTError:
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
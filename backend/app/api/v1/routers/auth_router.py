from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.db.database import get_db
from app.schemas.user_schema import (
    UserCreate, 
    Token, 
    ChangePasswordRequest, 
    ForgotPasswordRequest, 
    ResetPasswordRequest
)
from app.services.auth_service import AuthService
from app.core.config import settings
from app.core.security import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


#Endpoint Registrasi
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    service = AuthService(db)
    # Menyembunyikan objek user yang di-return atau bisa dibuat response model khusus
    user = service.registrasi_user(user_data)
    return {"message": "Registrasi berhasil", "username": user.username}


#Endpoint Login
@router.post("/login", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Menggunakan OAuth2PasswordRequestForm bawaan FastAPI.
    Input yang diterima berupa Form Data (x-www-form-urlencoded), BUKAN JSON.
    Wajib berisi parameter 'username' dan 'password'.
    """
    service = AuthService(db)
    return service.login_user(form_data.username, form_data.password)


#Endpoint Ubah Password (Wajib Login)
@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest,
    # Perhatikan: current_user berbentuk dict {"username": ..., "role": ...}
    current_user: dict = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    service = AuthService(db)
    # Lempar value dari key "username" ke service
    return service.ubah_password(current_user["username"], data)


#Endpoint Lupa Password (Request Link Email)
@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    # Harus menggunakan await karena proses kirim email berjalan secara asinkron
    return await service.lupa_password(data.email)


#Endpoint Reset Password (Melalui Token Email)
@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.reset_password(data)
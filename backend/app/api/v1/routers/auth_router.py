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
from app.services.auth_service import UserService
from app.core.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Sesuaikan '/api/v1/auth/login' jika prefix utamamu berbeda
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

#Dependency untuk Mengamankan Endpoint
def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Fungsi ini akan memvalidasi token JWT.
    Jika token valid, fungsi akan mengembalikan username dari user yang sedang login.
    Jika tidak valid/expired, akan melempar error 401 Unauthorized.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kedaluwarsa",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    return username


#Endpoint Registrasi
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    service = UserService(db)
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
    service = UserService(db)
    return service.login_user(form_data.username, form_data.password)


#Endpoint Ubah Password (Wajib Login)
@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_username: str = Depends(get_current_user), # Endpoint dilindungi oleh fungsi ini
    db: Session = Depends(get_db)
):
    service = UserService(db)
    return service.ubah_password(current_username, data)


#Endpoint Lupa Password (Request Link Email)
@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    service = UserService(db)
    # Harus menggunakan await karena proses kirim email berjalan secara asinkron
    return await service.lupa_password(data.email)


#Endpoint Reset Password (Melalui Token Email)
@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.reset_password(data)
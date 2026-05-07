from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import UserCreate, Token
from app.core.config import settings # Asumsi kamu punya file config untuk SECRET_KEY
from app.services.email_service import kirim_email_reset_password

# Setup untuk hashing password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES

    # --- Helper Methods ---
    def verifikasi_password(self, plain_password, hashed_password):
        teks_password = str(plain_password)[:70]
        return pwd_context.verify(teks_password, hashed_password)

    def get_password_hash(self,password: str) -> str:
    # Menambahkan [:72] untuk memotong string secara manual
    # guna mencegah error limitasi 72-byte dari Bcrypt
        teks_password = str(password)[:70]
        return pwd_context.hash(teks_password)

    def buat_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    # --- Core Business Logic ---
    def registrasi_user(self, user_data: UserCreate):
        # 1. Cek apakah username sudah dipakai
        if self.repo.get_by_username(user_data.username):
            raise HTTPException(
                status_code=400, 
                detail="Username sudah terdaftar"
            )
        
        # 2. Cek apakah email sudah dipakai
        if self.repo.get_by_email(user_data.email):
            raise HTTPException(
                status_code=400, 
                detail="Email sudah terdaftar"
            )

        # 3. Hash password sebelum simpan ke repo
        hashed_pwd = self.get_password_hash(user_data.password)
        
        # 4. Simpan ke database melalui repository
        return self.repo.create(user_data, hashed_pwd)

    def login_user(self, username_input: str, password_input: str):
        #Cari user berdasarkan username
        user = self.repo.get_by_username(username_input)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Username atau password salah",
                headers={"WWW-Authenticate": "Bearer"},
            )

        #Verifikasi password hash
        if not self.verifikasi_password(password_input, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Username atau password salah",
                headers={"WWW-Authenticate": "Bearer"},
            )

        #Buat JWT Token jika login berhasil
        access_token_expires = timedelta(minutes=self.access_token_expire_minutes)
        access_token = self.buat_access_token(
            data={"sub": user.username, "role": user.role}, 
            expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user.role
        }
    
    async def lupa_password(self, email: str):
        """
        Tahap 1: Memverifikasi email dan mengirim link reset.
        Fungsi ini harus async karena pengiriman email (FastMail) berjalan async.
        """
        user = self.repo.get_by_email(email)
        if not user:
            # Tetap kembalikan sukses demi keamanan (agar orang tidak bisa menebak email mana yang terdaftar)
            return {"message": "Jika email terdaftar, link reset telah dikirim."}

        # Buat token JWT khusus untuk reset password (berlaku 15 menit)
        reset_token_expires = timedelta(minutes=15)
        reset_token = self.buat_access_token(
            data={"sub": user.username, "type": "reset"}, # Tambahkan identifier "type"
            expires_delta=reset_token_expires
        )

        # Kirim email asinkron
        await kirim_email_reset_password(email, reset_token)

        return {"message": "Jika email terdaftar, link reset telah dikirim."}


    def reset_password(self, data_reset: dict): # data_reset didapat dari ResetPasswordRequest
        """
        Tahap 2: Memverifikasi token dari URL email dan mengubah password.
        """
        try:
            # Decode token
            payload = jwt.decode(data_reset.token, self.secret_key, algorithms=[self.algorithm])
            username: str = payload.get("sub")
            token_type: str = payload.get("type")
            
            # Pastikan token ini memang token reset, bukan access_token biasa
            if username is None or token_type != "reset":
                raise HTTPException(status_code=400, detail="Token tidak valid")
                
        except JWTError:
            # Token sudah expired atau dimodifikasi
            raise HTTPException(status_code=400, detail="Token tidak valid atau sudah kedaluwarsa")

        # Cari user berdasarkan username di token
        user = self.repo.get_by_username(username)
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        # Hash password baru dan simpan
        hashed_password_baru = self.get_password_hash(data_reset.password_baru)
        user.password = hashed_password_baru
        self.repo.db.commit()
        
        return {"message": "Password berhasil di-reset. Silakan login kembali."}
    def ubah_password(self, username_sekarang: str, data_password): # data_password dari ChangePasswordRequest
        user = self.repo.get_by_username(username_sekarang)
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        if not self.verifikasi_password(data_password.password_lama, user.password):
            raise HTTPException(status_code=400, detail="Password lama salah")

        hashed_password_baru = self.get_password_hash(data_password.password_baru)
        user.password = hashed_password_baru
        self.repo.db.commit()
        
        return {"message": "Password berhasil diubah"}
from datetime import timedelta
from jose import jwt, JWTError
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository # Sesuaikan jika namamu auth_repository
from app.schemas.user_schema import UserCreate
from app.core.config import settings

# --- IMPORT DARI SECURITY.PY ---
from app.core.security import get_password_hash, verifikasi_password, buat_access_token

# Import dari email_service untuk fungsi lupa password
from app.services.email_service import kirim_email_reset_password 

class AuthService: # Pastikan nama class disesuaikan dengan yang di-import router
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        
    def registrasi_user(self, user_data: UserCreate):
        if self.repo.get_by_username(user_data.username):
            raise HTTPException(status_code=400, detail="Username sudah terdaftar")
        
        if self.repo.get_by_email(user_data.email):
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")

        # Panggil fungsi hash dari security.py (tanpa 'self.')
        hashed_pwd = get_password_hash(user_data.password)
        
        return self.repo.create(user_data, hashed_pwd)

    def login_user(self, username_input: str, password_input: str):
        user = self.repo.get_by_username(username_input)
        
        # Panggil fungsi verifikasi dari security.py (tanpa 'self.')
        if not user or not verifikasi_password(password_input, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Username atau password salah",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Panggil fungsi token dari security.py (tanpa 'self.')
        access_token = buat_access_token(data={"sub": user.username, "role": user.role, "id": user.user_id})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user.role,
            "user_id": user.user_id
        }

    def ubah_password(self, username_sekarang: str, data_password):
        user = self.repo.get_by_username(username_sekarang)
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        # Menggunakan fungsi verifikasi_password dari security.py
        if not verifikasi_password(data_password.password_lama, user.password):
            raise HTTPException(status_code=400, detail="Password lama salah")

        # Menggunakan fungsi hash dari security.py
        hashed_password_baru = get_password_hash(data_password.password_baru)
        user.password = hashed_password_baru
        self.repo.db.commit()
        
        return {"message": "Password berhasil diubah"}

    async def lupa_password(self, email: str):
        user = self.repo.get_by_email(email)
        if not user:
            return {"message": "Jika email terdaftar, link reset telah dikirim."}

        reset_token_expires = timedelta(minutes=15)
        
        # Panggil dari security.py
        reset_token = buat_access_token(
            data={"sub": user.username, "type": "reset"}, 
            expires_delta=reset_token_expires
        )

        await kirim_email_reset_password(email, reset_token)
        return {"message": "Jika email terdaftar, link reset telah dikirim."}

    def reset_password(self, data_reset):
        try:
            payload = jwt.decode(data_reset.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username: str = payload.get("sub")
            token_type: str = payload.get("type")
            
            if username is None or token_type != "reset":
                raise HTTPException(status_code=400, detail="Token tidak valid")
                
        except JWTError:
            raise HTTPException(status_code=400, detail="Token tidak valid atau sudah kedaluwarsa")

        user = self.repo.get_by_username(username)
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        # Panggil dari security.py
        hashed_password_baru = get_password_hash(data_reset.password_baru)
        user.password = hashed_password_baru
        self.repo.db.commit()
        
        return {"message": "Password berhasil di-reset. Silakan login kembali."}
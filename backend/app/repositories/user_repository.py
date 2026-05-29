from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate, UserRole

# 1. TAMBAHKAN IMPORT MODEL CHILD DI SINI
from app.models.user import Mahasiswa
from app.models.user import Staff
from app.models.user import Dosen

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int):
        return self.db.query(User).filter(User.user_id == user_id).first()

    def get_by_username(self, username: str):
        return self.db.query(User).filter(User.username == username).first()

    def get_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()

    def get_all_staff(self):
        return self.db.query(Staff).all()

    def get_all_dosen(self):
        return self.db.query(Dosen).all()

    def get_mahasiswa_bimbingan(self, dosen_id: int):
        return self.db.query(Mahasiswa).filter(Mahasiswa.dosen_pembimbing_id == dosen_id).all()

    # 2. UBAH FUNGSI CREATE
    def create(self, user_data: UserCreate, hashed_password: str):
        # Simpan user sebagai entitas role-specific agar SQLAlchemy menangani
        # insert ke parent + child table secara otomatis.
        user_args = {
            "nama": user_data.nama,
            "username": user_data.username,
            "email": user_data.email,
            "password": hashed_password,
            "role": user_data.role,
        }

        if user_data.role == UserRole.MAHASISWA:
            db_user = Mahasiswa(
                **user_args,
                nim=user_data.nim,
                fakultas=user_data.fakultas,
                prodi=user_data.prodi,
            )
        elif user_data.role == UserRole.STAFF:
            db_user = Staff(
                **user_args,
                nip=user_data.nip,
            )
        elif user_data.role == UserRole.DOSEN:
            db_user = Dosen(
                **user_args,
                nip=getattr(user_data, 'nip', getattr(user_data, 'nidn', None)),
            )
        else:
            db_user = User(**user_args)

        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, user_id: int, update_data: dict):
        """Update user data using dict and handle commit."""
        db_user = self.get_by_id(user_id)
        if db_user:
            for key, value in update_data.items():
                setattr(db_user, key, value)
            self.db.commit()
            self.db.refresh(db_user)
        return db_user

    def update_password(self, user_id: int, hashed_password: str):
        """Dedicated method for password updates."""
        db_user = self.get_by_id(user_id)
        if db_user:
            db_user.password = hashed_password
            self.db.commit()
            self.db.refresh(db_user)
            return True
        return False

    def delete(self, user_id: int):
        db_user = self.get_by_id(user_id)
        if db_user:
            self.db.delete(db_user)
            self.db.commit()
            return True
        return False

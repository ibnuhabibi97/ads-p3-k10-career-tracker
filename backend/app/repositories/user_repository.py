from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate

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

        if user_data.role == "mahasiswa":
            db_user = Mahasiswa(
                **user_args,
                nim=user_data.nim,
                fakultas=user_data.fakultas,
                prodi=user_data.prodi,
            )
        elif user_data.role == "staff":
            db_user = Staff(
                **user_args,
                nip=user_data.nip,
            )
        elif user_data.role == "dosen":
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

    def update(self, user_id: int, user_data: UserUpdate):
        db_user = self.get_by_id(user_id)
        if db_user:
            update_data = user_data.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_user, key, value)
            self.db.commit()
            self.db.refresh(db_user)
        return db_user

    def delete(self, user_id: int):
        db_user = self.get_by_id(user_id)
        if db_user:
            self.db.delete(db_user)
            self.db.commit()
            return True
        return False
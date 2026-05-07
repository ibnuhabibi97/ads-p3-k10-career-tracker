from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int):
        return self.db.query(User).filter(User.user_id == user_id).first()

    def get_by_username(self, username: str):
        """
        Fungsi krusial untuk autentikasi: mencari user berdasarkan username.
        """
        return self.db.query(User).filter(User.username == username).first()

    def get_by_email(self, email: str):
        """
        Fungsi alternatif autentikasi: mencari user berdasarkan email.
        """
        return self.db.query(User).filter(User.email == email).first()

    def create(self, user_data: UserCreate, hashed_password: str):
        """
        Membuat user baru dengan password yang sudah di-hash.
        """
        db_user = User(
            nama=user_data.nama,
            username=user_data.username,
            email=user_data.email,
            password=hashed_password,  # Password yang disimpan adalah versi hash
            role=user_data.role
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, user_id: int, user_data: UserUpdate):
        db_user = self.get_by_id(user_id)
        if db_user:
            update_data = user_data.model_dump(exclude_unset=True)
            
            # Jika dalam update_data ada password, pastikan sudah di-hash di level service
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
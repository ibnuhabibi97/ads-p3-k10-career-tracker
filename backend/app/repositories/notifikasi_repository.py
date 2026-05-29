from sqlalchemy.orm import Session
from app.models.notifikasi import Notifikasi

class NotifikasiRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data_dict: dict):
        db_notif = Notifikasi(**data_dict)
        self.db.add(db_notif)
        self.db.commit()
        self.db.refresh(db_notif)
        return db_notif

    def get_by_id(self, notifikasi_id: int):
        return self.db.query(Notifikasi).filter(Notifikasi.notifikasi_id == notifikasi_id).first()

    def get_by_user(self, user_id: int):
        return self.db.query(Notifikasi).filter(Notifikasi.user_id == user_id).order_by(Notifikasi.notifikasi_id.desc()).all()

    def mark_as_read(self, notifikasi_id: int):
        db_notif = self.get_by_id(notifikasi_id)
        if db_notif:
            db_notif.is_read = True
            self.db.commit()
            self.db.refresh(db_notif)
        return db_notif

    def mark_all_as_read(self, user_id: int):
        self.db.query(Notifikasi).filter(
            Notifikasi.user_id == user_id, 
            Notifikasi.is_read == False
        ).update({"is_read": True})
        self.db.commit()
        return True

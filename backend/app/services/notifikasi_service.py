from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.notifikasi_repository import NotifikasiRepository

class NotifikasiService:
    def __init__(self, db: Session):
        self.repo = NotifikasiRepository(db)

    def ambil_notifikasi_user(self, user_id: int):
        return self.repo.get_by_user(user_id)

    def tandai_dibaca(self, notifikasi_id: int, user_id: int):
        # Gunakan atribut .db dari repository jika ada, atau buat query via repo
        notif = self.repo.get_by_id(notifikasi_id) if hasattr(self.repo, 'get_by_id') else self.repo.db.query(self.repo.model).filter_by(notifikasi_id=notifikasi_id).first()
        
        if not notif:
            raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan")
        if notif.user_id != user_id:
            raise HTTPException(status_code=403, detail="Akses ditolak")
            
        return self.repo.mark_as_read(notifikasi_id)

    def tandai_semua_dibaca(self, user_id: int):
        return self.repo.mark_all_as_read(user_id)

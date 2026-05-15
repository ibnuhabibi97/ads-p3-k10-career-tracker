from sqlalchemy.orm import Session
from app.models.logbook import Logbook

class LogbookRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        """Ambil semua logbook"""
        return self.db.query(Logbook).all()

    def get_by_id(self, logbook_id: int):
        """Ambil logbook berdasarkan ID"""
        return self.db.query(Logbook).filter(Logbook.logbook_id == logbook_id).first()

    def get_by_laporan_id(self, laporan_id: int):
        """Ambil semua logbook dari laporan tertentu"""
        return self.db.query(Logbook).filter(Logbook.laporan_id == laporan_id).all()

    def get_by_mahasiswa_id(self, mahasiswa_id: int):
        """Ambil semua logbook milik mahasiswa tertentu"""
        return self.db.query(Logbook).filter(Logbook.mahasiswa_id == mahasiswa_id).all()

    def get_by_jenis_kegiatan(self, jenis_kegiatan: str):
        """Ambil logbook berdasarkan jenis kegiatan"""
        return self.db.query(Logbook).filter(Logbook.jenis_kegiatan == jenis_kegiatan).all()

    def get_by_dosen_pembimbing(self, dosen_pembimbing: str):
        """Ambil logbook berdasarkan dosen pembimbing"""
        return self.db.query(Logbook).filter(Logbook.dosen_pembimbing == dosen_pembimbing).all()

    def create(self, data_dict: dict):
        """Buat logbook baru"""
        db_logbook = Logbook(**data_dict)
        self.db.add(db_logbook)
        self.db.commit()
        self.db.refresh(db_logbook)
        return db_logbook

    def update(self, logbook_id: int, update_data: dict):
        """Update logbook"""
        db_logbook = self.get_by_id(logbook_id)
        if db_logbook:
            for key, value in update_data.items():
                setattr(db_logbook, key, value)
            
            self.db.commit()
            self.db.refresh(db_logbook)
        return db_logbook

    def delete(self, logbook_id: int):
        """Hapus logbook"""
        db_logbook = self.get_by_id(logbook_id)
        if db_logbook:
            self.db.delete(db_logbook)
            self.db.commit()
            return True
        return False

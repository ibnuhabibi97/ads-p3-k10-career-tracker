from sqlalchemy.orm import Session, joinedload
from app.models.laporan import Laporan
from app.schemas.laporan_schema import LaporanStatus

class LaporanRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        """Ambil semua laporan dengan logbooks, lowongan, dan mahasiswa"""
        return self.db.query(Laporan).options(
            joinedload(Laporan.logbooks),
            joinedload(Laporan.lowongan),
            joinedload(Laporan.mahasiswa)
        ).all()

    def get_by_id(self, laporan_id: int):
        """Ambil laporan berdasarkan ID dengan logbooks, lowongan, dan mahasiswa"""
        return self.db.query(Laporan).options(
            joinedload(Laporan.logbooks),
            joinedload(Laporan.lowongan),
            joinedload(Laporan.mahasiswa)
        ).filter(Laporan.laporan_id == laporan_id).first()

    def get_by_mahasiswa_id(self, mahasiswa_id: int):
        """Ambil semua laporan milik mahasiswa tertentu dengan logbooks, lowongan, dan mahasiswa"""
        return self.db.query(Laporan).options(
            joinedload(Laporan.logbooks),
            joinedload(Laporan.lowongan),
            joinedload(Laporan.mahasiswa)
        ).filter(Laporan.mahasiswa_id == mahasiswa_id).all()

    def get_pending_laporan(self):
        """Ambil semua laporan yang masih pending (belum dinilai)"""
        return self.db.query(Laporan).options(
            joinedload(Laporan.mahasiswa),
            joinedload(Laporan.lowongan)
        ).filter(Laporan.status == LaporanStatus.PENDING).all()

    def get_by_status(self, status: str):
        """Ambil laporan berdasarkan status"""
        return self.db.query(Laporan).options(
            joinedload(Laporan.mahasiswa),
            joinedload(Laporan.lowongan)
        ).filter(Laporan.status == status).all()

    def get_by_dosen_id(self, dosen_id: int):
        """Ambil semua laporan yang dinilai oleh dosen tertentu"""
        return self.db.query(Laporan).options(
            joinedload(Laporan.mahasiswa),
            joinedload(Laporan.lowongan)
        ).filter(Laporan.dosen_id == dosen_id).all()

    def create(self, data_dict: dict):
        """Buat laporan baru"""
        db_laporan = Laporan(**data_dict)
        self.db.add(db_laporan)
        self.db.commit()
        self.db.refresh(db_laporan)
        return db_laporan

    def update(self, laporan_id: int, update_data: dict):
        """Update laporan"""
        db_laporan = self.get_by_id(laporan_id)
        if db_laporan:
            for key, value in update_data.items():
                setattr(db_laporan, key, value)
            
            self.db.commit()
            self.db.refresh(db_laporan)
        return db_laporan

    def delete(self, laporan_id: int):
        """Hapus laporan"""
        db_laporan = self.get_by_id(laporan_id)
        if db_laporan:
            self.db.delete(db_laporan)
            self.db.commit()
            return True
        return False

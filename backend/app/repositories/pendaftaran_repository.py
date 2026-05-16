from sqlalchemy.orm import Session
from app.models.pendaftaran import Pendaftaran

class PendaftaranRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data_dict: dict):
        """Buat pendaftaran baru menggunakan dictionary."""
        db_pendaftaran = Pendaftaran(**data_dict)
        self.db.add(db_pendaftaran)
        self.db.commit()
        self.db.refresh(db_pendaftaran)
        return db_pendaftaran

    def get_by_id(self, pendaftaran_id: int):
        return self.db.query(Pendaftaran).filter(Pendaftaran.pendaftaran_id == pendaftaran_id).first()

    def get_by_mahasiswa(self, mahasiswa_id: int):
        """Melihat semua lamaran milik seorang mahasiswa."""
        return self.db.query(Pendaftaran).filter(Pendaftaran.mahasiswa_id == mahasiswa_id).all()

    def get_by_lowongan(self, lowongan_id: int):
        """Melihat semua mahasiswa yang melamar ke suatu lowongan tertentu."""
        return self.db.query(Pendaftaran).filter(Pendaftaran.lowongan_id == lowongan_id).all()

    def cek_pendaftaran_ada(self, mahasiswa_id: int, lowongan_id: int):
        """Memastikan mahasiswa tidak mendaftar dua kali di lowongan yang sama."""
        return self.db.query(Pendaftaran).filter(
            Pendaftaran.mahasiswa_id == mahasiswa_id,
            Pendaftaran.lowongan_id == lowongan_id
        ).first()

    def update(self, pendaftaran_id: int, update_dict: dict):
        """Memperbarui data pendaftaran menggunakan dictionary."""
        db_pendaftaran = self.get_by_id(pendaftaran_id)
        if db_pendaftaran:
            for key, value in update_dict.items():
                setattr(db_pendaftaran, key, value)
                
            self.db.commit()
            self.db.refresh(db_pendaftaran)
        return db_pendaftaran

    def delete(self, pendaftaran_id: int):
        """Membatalkan/menghapus pendaftaran."""
        db_pendaftaran = self.get_by_id(pendaftaran_id)
        if db_pendaftaran:
            self.db.delete(db_pendaftaran)
            self.db.commit()
            return True
        return False

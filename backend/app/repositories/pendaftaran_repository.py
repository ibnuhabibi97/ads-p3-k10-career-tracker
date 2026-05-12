from sqlalchemy.orm import Session
from app.models.pendaftaran import Pendaftaran
from app.schemas.pendaftaran_schemas import PendaftaranCreate, PendaftaranUpdate

class PendaftaranRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, pendaftaran_data: PendaftaranCreate, mahasiswa_id_jwt: int = None):
        """
        Membuat pendaftaran baru. 
        Mendukung override mahasiswa_id dari JWT agar lebih aman (RBAC).
        """
        # Keamanan: Gunakan ID dari token JWT jika ada, jika tidak gunakan dari input JSON
        final_mahasiswa_id = mahasiswa_id_jwt if mahasiswa_id_jwt else pendaftaran_data.mahasiswa_id

        db_pendaftaran = Pendaftaran(
            mahasiswa_id=final_mahasiswa_id,
            lowongan_id=pendaftaran_data.lowongan_id,
            dokumen_cv=pendaftaran_data.dokumen_cv,
            # Menggunakan getattr untuk berjaga-jaga jika schema belum sempat diupdate
            dokumen_surat_rekomendasi=getattr(pendaftaran_data, 'dokumen_surat_rekomendasi', None) 
        )
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

    def update(self, pendaftaran_id: int, update_data: PendaftaranUpdate):
        """
        Memperbarui data pendaftaran (misal: update CV, surat rekomendasi, atau status_seleksi).
        """
        db_pendaftaran = self.get_by_id(pendaftaran_id)
        if db_pendaftaran:
            # Hanya update field yang dikirimkan (tidak None)
            update_dict = update_data.model_dump(exclude_unset=True)
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
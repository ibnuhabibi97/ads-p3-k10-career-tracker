from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.pendaftaran_repository import PendaftaranRepository
from app.schemas.pendaftaran_schemas import PendaftaranCreate, PendaftaranUpdate

class PendaftaranService:
    def __init__(self, db: Session):
        self.repo = PendaftaranRepository(db)

    def submit_pendaftaran(self, pendaftaran_data: PendaftaranCreate, mahasiswa_id: int):
        # Cek apakah mahasiswa sudah mendaftar di lowongan ini
        sudah_daftar = self.repo.cek_pendaftaran_ada(mahasiswa_id, pendaftaran_data.lowongan_id)
        if sudah_daftar:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Anda sudah mendaftar di lowongan ini dan tidak dapat mengubah data."
            )
        
        # Simpan pendaftaran baru
        return self.repo.create(pendaftaran_data, mahasiswa_id)

    def update_status_seleksi(self, pendaftaran_id: int, status_baru: str):
        # Cari data pendaftaran
        db_pendaftaran = self.repo.get_by_id(pendaftaran_id)
        if not db_pendaftaran:
            raise HTTPException(status_code=404, detail="Data pendaftaran tidak ditemukan")

        # Update hanya field status_seleksi
        update_data = PendaftaranUpdate(status_seleksi=status_baru)
        return self.repo.update(pendaftaran_id, update_data)
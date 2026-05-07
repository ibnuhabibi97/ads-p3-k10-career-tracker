from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.lowongan_repository import LowonganRepository
from app.schemas.lowongan_schema import LowonganCreate, LowonganUpdate

class LowonganService:
    def __init__(self, db: Session):
        self.repo = LowonganRepository(db)

    def ambil_semua_lowongan(self):
        return self.repo.get_all()

    def ambil_lowongan_aktif(self):
        return self.repo.get_active()

    def ambil_lowongan_by_id(self, lowongan_id: int):
        lowongan = self.repo.get_by_id(lowongan_id)
        if not lowongan:
            raise HTTPException(status_code=404, detail="Data lowongan tidak ditemukan")
        return lowongan
    
    def cari_lowongan(self, keyword: str):
        return self.repo.search(keyword)

    def tambah_lowongan(self, data: LowonganCreate):
        return self.repo.create(data)

    def ubah_lowongan(self, lowongan_id: int, data: LowonganUpdate):
        lowongan = self.repo.update(lowongan_id, data)
        if not lowongan:
            raise HTTPException(status_code=404, detail="Data lowongan gagal diubah karena tidak ditemukan")
        return lowongan

    def hapus_lowongan(self, lowongan_id: int):
        berhasil = self.repo.delete(lowongan_id)
        if not berhasil:
            raise HTTPException(status_code=404, detail="Data lowongan gagal dihapus karena tidak ditemukan")
        return {"message": "Data lowongan berhasil dihapus"}
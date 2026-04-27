from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.lowongan_repository import LowonganRepository
from app.schemas.lowongan_schema import LowonganCreate

class LowonganService:
    def __init__(self, db: Session):
        self.repo = LowonganRepository(db)

    def ambil_semua_lowongan(self):
        return self.repo.get_all()

    def ambil_lowongan_by_id(self, id_lowongan: int):
        lowongan = self.repo.get_by_id(id_lowongan)
        if not lowongan:
            raise HTTPException(status_code=404, detail="Data lowongan tidak ditemukan")
        return lowongan

    def tambah_lowongan(self, data: LowonganCreate):
        # Di sini kamu bisa menambahkan validasi bisnis khusus jika diperlukan di masa depan
        return self.repo.create(data)

    def ubah_lowongan(self, id_lowongan: int, data: LowonganCreate):
        lowongan = self.repo.update(id_lowongan, data)
        if not lowongan:
            raise HTTPException(status_code=404, detail="Data lowongan gagal diubah karena tidak ditemukan")
        return lowongan

    def hapus_lowongan(self, id_lowongan: int):
        berhasil = self.repo.delete(id_lowongan)
        if not berhasil:
            raise HTTPException(status_code=404, detail="Data lowongan gagal dihapus karena tidak ditemukan")
        return {"message": "Data lowongan berhasil dihapus"}
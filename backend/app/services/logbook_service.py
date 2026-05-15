from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.logbook_repository import LogbookRepository
from app.schemas.logbook_schemas import LogbookCreate, LogbookUpdate

class LogbookService:
    def __init__(self, db: Session):
        self.repo = LogbookRepository(db)

    def ambil_semua_logbook(self):
        """Ambil semua logbook"""
        return self.repo.get_all()

    def ambil_logbook_by_id(self, logbook_id: int):
        """Ambil logbook berdasarkan ID"""
        logbook = self.repo.get_by_id(logbook_id)
        if not logbook:
            raise HTTPException(status_code=404, detail="Data logbook tidak ditemukan")
        return logbook

    def ambil_logbook_by_laporan(self, laporan_id: int):
        """Ambil semua logbook dari laporan tertentu"""
        return self.repo.get_by_laporan_id(laporan_id)

    def ambil_logbook_mahasiswa(self, mahasiswa_id: int):
        """Ambil semua logbook milik mahasiswa tertentu"""
        return self.repo.get_by_mahasiswa_id(mahasiswa_id)

    def ambil_logbook_by_jenis_kegiatan(self, jenis_kegiatan: str):
        """Ambil logbook berdasarkan jenis kegiatan"""
        return self.repo.get_by_jenis_kegiatan(jenis_kegiatan)

    def ambil_logbook_by_dosen(self, dosen_pembimbing: str):
        """Ambil logbook berdasarkan dosen pembimbing"""
        return self.repo.get_by_dosen_pembimbing(dosen_pembimbing)

    def tambah_logbook(self, data: LogbookCreate, user_id: int):
        """Buat logbook baru"""
        data_dict = data.model_dump()
        
        # Enforce mahasiswa_id dari current_user
        data_dict["mahasiswa_id"] = user_id
        
        # Hitung durasi_kegiatan otomatis dari waktu_selesai - waktu_mulai
        waktu_mulai = data_dict.get("waktu_mulai")
        waktu_selesai = data_dict.get("waktu_selesai")
        
        if waktu_mulai and waktu_selesai:
            data_dict["durasi_kegiatan"] = waktu_selesai - waktu_mulai
            
        return self.repo.create(data_dict)

    def ubah_logbook(self, logbook_id: int, data: LogbookUpdate, user_id: int):
        """Update logbook"""
        # Cek ownership
        logbook = self.repo.get_by_id(logbook_id)
        if not logbook:
            raise HTTPException(status_code=404, detail="Data logbook gagal diubah karena tidak ditemukan")
            
        if logbook.mahasiswa_id != user_id:
            raise HTTPException(status_code=403, detail="Akses ditolak. Anda bukan pemilik logbook ini.")

        update_data = data.model_dump(exclude_unset=True)
        
        # Jika waktu_mulai atau waktu_selesai diubah, recalculate durasi_kegiatan
        waktu_mulai = update_data.get("waktu_mulai") or logbook.waktu_mulai
        waktu_selesai = update_data.get("waktu_selesai") or logbook.waktu_selesai
        
        if waktu_mulai and waktu_selesai:
            update_data["durasi_kegiatan"] = waktu_selesai - waktu_mulai

        return self.repo.update(logbook_id, update_data)

    def hapus_logbook(self, logbook_id: int, user_id: int):
        """Hapus logbook"""
        logbook = self.repo.get_by_id(logbook_id)
        if not logbook:
            raise HTTPException(status_code=404, detail="Data logbook gagal dihapus karena tidak ditemukan")
            
        if logbook.mahasiswa_id != user_id:
            raise HTTPException(status_code=403, detail="Akses ditolak. Anda bukan pemilik logbook ini.")
            
        self.repo.delete(logbook_id)
        return {"message": "Data logbook berhasil dihapus"}

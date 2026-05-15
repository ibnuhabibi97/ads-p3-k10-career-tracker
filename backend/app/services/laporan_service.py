from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.laporan_repository import LaporanRepository
from app.schemas.laporan_schema import LaporanCreate, LaporanUpdate
from app.schemas.laporan_dosen_schema import LaporanPenilaianUpdate, LaporanRevisiDosenUpdate

class LaporanService:
    def __init__(self, db: Session):
        self.repo = LaporanRepository(db)

    def ambil_semua_laporan(self):
        """Ambil semua laporan"""
        return self.repo.get_all()

    def ambil_laporan_by_id(self, laporan_id: int):
        """Ambil laporan berdasarkan ID"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan tidak ditemukan")
        return laporan

    def ambil_laporan_mahasiswa(self, mahasiswa_id: int):
        """Ambil semua laporan milik mahasiswa tertentu"""
        return self.repo.get_by_mahasiswa_id(mahasiswa_id)

    def ambil_laporan_pending(self):
        """Ambil semua laporan yang masih pending (belum dinilai)"""
        return self.repo.get_pending_laporan()

    def ambil_laporan_by_status(self, status: str):
        """Ambil laporan berdasarkan status"""
        return self.repo.get_by_status(status)

    def ambil_laporan_dosen(self, dosen_id: int):
        """Ambil semua laporan yang dinilai oleh dosen tertentu"""
        return self.repo.get_by_dosen_id(dosen_id)

    def tambah_laporan(self, data: LaporanCreate, user_id: int):
        """Buat laporan baru"""
        data_dict = data.model_dump()
        data_dict["mahasiswa_id"] = user_id # Enforce user_id dari token
        return self.repo.create(data_dict)

    def ubah_laporan(self, laporan_id: int, data: LaporanUpdate, user_id: int):
        """Update laporan oleh mahasiswa (hanya dokumen)"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan gagal diubah karena tidak ditemukan")
            
        if laporan.mahasiswa_id != user_id:
            raise HTTPException(status_code=403, detail="Akses ditolak. Anda bukan pemilik laporan ini.")
            
        return self.repo.update(laporan_id, data.model_dump(exclude_unset=True))

    def ubah_nilai_laporan(self, laporan_id: int, data: LaporanPenilaianUpdate, dosen_id: int):
        """Update nilai laporan oleh dosen (dengan optional catatan)"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan tidak ditemukan")
        
        # Update dengan data penilaian
        update_data = {
            "nilai": data.nilai,
            "status": data.status,
            "dosen_id": dosen_id
        }
        if data.catatan:
            update_data["catatan"] = data.catatan
            
        return self.repo.update(laporan_id, update_data)

    def ubah_catatan_revisi_dosen(self, laporan_id: int, data: LaporanRevisiDosenUpdate, dosen_id: int):
        """Update catatan revisi oleh dosen ketika menolak laporan"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan tidak ditemukan")
        
        # Update catatan dan status
        update_data = {
            "catatan": data.catatan,
            "status": data.status,
            "dosen_id": dosen_id
        }
        
        return self.repo.update(laporan_id, update_data)

    def hapus_laporan(self, laporan_id: int, user_id: int):
        """Hapus laporan"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan gagal dihapus karena tidak ditemukan")
            
        if laporan.mahasiswa_id != user_id:
            raise HTTPException(status_code=403, detail="Akses ditolak. Anda bukan pemilik laporan ini.")
            
        self.repo.delete(laporan_id)
        return {"message": "Data laporan berhasil dihapus"}

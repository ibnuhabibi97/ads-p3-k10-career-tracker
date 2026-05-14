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

    def tambah_laporan(self, data: LaporanCreate):
        """Buat laporan baru"""
        return self.repo.create(data)

    def ubah_laporan(self, laporan_id: int, data: LaporanUpdate):
        """Update laporan oleh mahasiswa (hanya dokumen)"""
        laporan = self.repo.update(laporan_id, data)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan gagal diubah karena tidak ditemukan")
        return laporan

    def ubah_nilai_laporan(self, laporan_id: int, data: LaporanPenilaianUpdate):
        """Update nilai laporan oleh dosen (dengan optional catatan)"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan tidak ditemukan")
        
        # Update dengan data penilaian
        laporan.nilai = data.nilai
        laporan.status = data.status
        laporan.dosen_id = data.dosen_id
        
        # Update catatan jika diberikan
        if data.catatan:
            laporan.catatan = data.catatan
        
        self.repo.db.commit()
        self.repo.db.refresh(laporan)
        return laporan

    def ubah_catatan_revisi_dosen(self, laporan_id: int, data: LaporanRevisiDosenUpdate):
        """Update catatan revisi oleh dosen ketika menolak laporan"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan tidak ditemukan")
        
        # Update catatan dan status
        laporan.catatan = data.catatan
        laporan.status = data.status
        laporan.dosen_id = data.dosen_id
        
        self.repo.db.commit()
        self.repo.db.refresh(laporan)
        return laporan

    def hapus_laporan(self, laporan_id: int):
        """Hapus laporan"""
        berhasil = self.repo.delete(laporan_id)
        if not berhasil:
            raise HTTPException(status_code=404, detail="Data laporan gagal dihapus karena tidak ditemukan")
        return {"message": "Data laporan berhasil dihapus"}

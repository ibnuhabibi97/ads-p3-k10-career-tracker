from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.laporan_schema import LaporanCreate, LaporanUpdate, LaporanResponse
from app.schemas.laporan_dosen_schema import LaporanPenilaianUpdate, LaporanRevisiDosenUpdate
from app.services.laporan_service import LaporanService
from app.core.security import RoleChecker

router = APIRouter(
    prefix="/laporan",
    tags=["Laporan Magang"]
)

hanya_mahasiswa = RoleChecker(["mahasiswa"])
hanya_dosen = RoleChecker(["dosen"])
hanya_staff = RoleChecker(["staff"])
semua_user_terdaftar = RoleChecker(["staff", "dosen", "mahasiswa"])

# ============================================
# ENDPOINT UNTUK SEMUA USER TERDAFTAR
# ============================================

@router.get("/", response_model=List[LaporanResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_all_laporan(db: Session = Depends(get_db)):
    """Ambil semua laporan"""
    service = LaporanService(db)
    return service.ambil_semua_laporan()

@router.get("/{laporan_id}", response_model=LaporanResponse, dependencies=[Depends(semua_user_terdaftar)])
def get_laporan_by_id(laporan_id: int, db: Session = Depends(get_db)):
    """Ambil laporan berdasarkan ID"""
    service = LaporanService(db)
    return service.ambil_laporan_by_id(laporan_id)

# ============================================
# ENDPOINT UNTUK MAHASISWA
# ============================================

@router.post("/", response_model=LaporanResponse, status_code=201)
def create_laporan(laporan: LaporanCreate, db: Session = Depends(get_db), current_user: dict = Depends(hanya_mahasiswa)):
    """Buat laporan baru"""
    service = LaporanService(db)
    return service.tambah_laporan(laporan, current_user["user_id"])

@router.get("/mahasiswa/{mahasiswa_id}", response_model=List[LaporanResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_laporan_mahasiswa(mahasiswa_id: int, db: Session = Depends(get_db)):
    """Ambil semua laporan milik mahasiswa tertentu"""
    service = LaporanService(db)
    return service.ambil_laporan_mahasiswa(mahasiswa_id)

@router.put("/{laporan_id}", response_model=LaporanResponse)
def update_laporan(laporan_id: int, laporan: LaporanUpdate, db: Session = Depends(get_db), current_user: dict = Depends(hanya_mahasiswa)):
    """Update laporan oleh mahasiswa (hanya dokumen)"""
    service = LaporanService(db)
    return service.ubah_laporan(laporan_id, laporan, current_user["user_id"])

@router.delete("/{laporan_id}")
def delete_laporan(laporan_id: int, db: Session = Depends(get_db), current_user: dict = Depends(hanya_mahasiswa)):
    """Hapus laporan"""
    service = LaporanService(db)
    return service.hapus_laporan(laporan_id, current_user["user_id"])

# ============================================
# ENDPOINT UNTUK DOSEN
# ============================================

@router.get("/pending/all", response_model=List[LaporanResponse], dependencies=[Depends(hanya_dosen)])
def get_pending_laporan(db: Session = Depends(get_db)):
    """Ambil semua laporan yang masih pending"""
    service = LaporanService(db)
    return service.ambil_laporan_pending()

@router.get("/dosen/{dosen_id}", response_model=List[LaporanResponse], dependencies=[Depends(hanya_dosen)])
def get_laporan_dosen(dosen_id: int, db: Session = Depends(get_db)):
    """Ambil semua laporan yang dinilai oleh dosen tertentu"""
    service = LaporanService(db)
    return service.ambil_laporan_dosen(dosen_id)

@router.patch("/{laporan_id}/nilai", response_model=LaporanResponse)
def update_nilai_laporan(laporan_id: int, data: LaporanPenilaianUpdate, db: Session = Depends(get_db), current_user: dict = Depends(hanya_dosen)):
    """Update nilai laporan oleh dosen (dengan optional catatan revisi)"""
    service = LaporanService(db)
    return service.ubah_nilai_laporan(laporan_id, data, current_user["user_id"])

@router.patch("/{laporan_id}/revisi-dosen", response_model=LaporanResponse)
def update_catatan_revisi_dosen(laporan_id: int, data: LaporanRevisiDosenUpdate, db: Session = Depends(get_db), current_user: dict = Depends(hanya_dosen)):
    """Update catatan revisi oleh dosen ketika menolak laporan"""
    service = LaporanService(db)
    return service.ubah_catatan_revisi_dosen(laporan_id, data, current_user["user_id"])

# ============================================
# ENDPOINT UNTUK STAFF
# ============================================

@router.get("/status/{status}", response_model=List[LaporanResponse], dependencies=[Depends(hanya_staff)])
def get_laporan_by_status(status: str, db: Session = Depends(get_db)):
    """Ambil laporan berdasarkan status"""
    service = LaporanService(db)
    return service.ambil_laporan_by_status(status)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.logbook_schemas import LogbookCreate, LogbookUpdate, LogbookResponse
from app.services.logbook_service import LogbookService
from app.core.security import RoleChecker

router = APIRouter(
    prefix="/logbook",
    tags=["Logbook Magang"]
)

hanya_mahasiswa = RoleChecker(["mahasiswa"])
hanya_dosen = RoleChecker(["dosen"])
hanya_staff = RoleChecker(["staff"])
semua_user_terdaftar = RoleChecker(["staff", "dosen", "mahasiswa"])

# ============================================
# ENDPOINT UNTUK MAHASISWA
# ============================================

@router.post("/", response_model=LogbookResponse, status_code=201)
def create_logbook(logbook: LogbookCreate, db: Session = Depends(get_db), current_user: dict = Depends(hanya_mahasiswa)):
    """Buat logbook baru (input dari mahasiswa)"""
    service = LogbookService(db)
    return service.tambah_logbook(logbook, current_user["user_id"])

# ============================================
# ENDPOINT FILTER (LEBIH SPESIFIK - HARUS SEBELUM {id})
# ============================================

@router.get("/mahasiswa/{mahasiswa_id}", response_model=List[LogbookResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_logbook_mahasiswa(mahasiswa_id: int, db: Session = Depends(get_db)):
    """Ambil semua logbook milik mahasiswa tertentu"""
    service = LogbookService(db)
    return service.ambil_logbook_mahasiswa(mahasiswa_id)

@router.get("/laporan/{laporan_id}", response_model=List[LogbookResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_logbook_by_laporan(laporan_id: int, db: Session = Depends(get_db)):
    """Ambil semua logbook dari laporan tertentu (composition dari laporan)"""
    service = LogbookService(db)
    return service.ambil_logbook_by_laporan(laporan_id)

@router.get("/jenis/{jenis_kegiatan}", response_model=List[LogbookResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_logbook_by_jenis(jenis_kegiatan: str, db: Session = Depends(get_db)):
    """Filter logbook berdasarkan jenis kegiatan"""
    service = LogbookService(db)
    return service.ambil_logbook_by_jenis_kegiatan(jenis_kegiatan)

@router.get("/dosen/{dosen_pembimbing}", response_model=List[LogbookResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_logbook_by_dosen(dosen_pembimbing: str, db: Session = Depends(get_db)):
    """Filter logbook berdasarkan dosen pembimbing"""
    service = LogbookService(db)
    return service.ambil_logbook_by_dosen(dosen_pembimbing)

# ============================================
# ENDPOINT UNTUK SEMUA USER TERDAFTAR
# ============================================

@router.get("/", response_model=List[LogbookResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_all_logbook(db: Session = Depends(get_db)):
    """Ambil semua logbook"""
    service = LogbookService(db)
    return service.ambil_semua_logbook()

@router.get("/{logbook_id}", response_model=LogbookResponse, dependencies=[Depends(semua_user_terdaftar)])
def get_logbook_by_id(logbook_id: int, db: Session = Depends(get_db)):
    """Ambil logbook berdasarkan ID"""
    service = LogbookService(db)
    return service.ambil_logbook_by_id(logbook_id)

@router.put("/{logbook_id}", response_model=LogbookResponse)
def update_logbook(logbook_id: int, logbook: LogbookUpdate, db: Session = Depends(get_db), current_user: dict = Depends(hanya_mahasiswa)):
    """Update logbook"""
    service = LogbookService(db)
    return service.ubah_logbook(logbook_id, logbook, current_user["user_id"])

@router.delete("/{logbook_id}")
def delete_logbook(logbook_id: int, db: Session = Depends(get_db), current_user: dict = Depends(hanya_mahasiswa)):
    """Hapus logbook"""
    service = LogbookService(db)
    return service.hapus_logbook(logbook_id, current_user["user_id"])

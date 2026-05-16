from fastapi import APIRouter, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.schemas.logbook_schemas import LogbookCreate, LogbookUpdate, LogbookResponse
from app.services.logbook_service import LogbookService
from app.api.dependencies import get_logbook_service
from app.core.security import RoleChecker
from app.core.storage import storage_client

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
async def create_logbook(
    laporan_id: int = Form(...),
    dosen_id: int = Form(...),
    waktu_mulai: datetime = Form(...),
    waktu_selesai: datetime = Form(...),
    keterangan: str = Form(...),
    jenis_kegiatan: str = Form(...),
    media: Optional[str] = Form(None),
    file_dokumentasi: Optional[UploadFile] = File(None),
    current_user: dict = Depends(hanya_mahasiswa),
    service: LogbookService = Depends(get_logbook_service)
):
    """Buat logbook baru (input dari mahasiswa, dokumentasi ke Supabase folder 'dokumentasi')"""
    public_url = None
    if file_dokumentasi:
        contents = await file_dokumentasi.read()
        public_url = storage_client.upload(
            file_data=contents,
            file_name=file_dokumentasi.filename,
            content_type=file_dokumentasi.content_type,
            folder="dokumentasi"
        )

    # Susun data untuk service
    logbook_data = LogbookCreate(
        laporan_id=laporan_id,
        dosen_id=dosen_id,
        waktu_mulai=waktu_mulai,
        waktu_selesai=waktu_selesai,
        keterangan=keterangan,
        jenis_kegiatan=jenis_kegiatan,
        media=media,
        dokumentasi=public_url
    )

    return service.tambah_logbook(logbook_data, current_user["user_id"])

# ============================================
# ENDPOINT FILTER (LEBIH SPESIFIK - HARUS SEBELUM {id})
# ============================================

@router.get("/mahasiswa/{mahasiswa_id}", response_model=List[LogbookResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_logbook_mahasiswa(mahasiswa_id: int, service: LogbookService = Depends(get_logbook_service)):
    """Ambil semua logbook milik mahasiswa tertentu"""
    return service.ambil_logbook_mahasiswa(mahasiswa_id)

@router.get("/laporan/{laporan_id}", response_model=List[LogbookResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_logbook_by_laporan(laporan_id: int, service: LogbookService = Depends(get_logbook_service)):
    """Ambil semua logbook dari laporan tertentu (composition dari laporan)"""
    return service.ambil_logbook_by_laporan(laporan_id)

@router.get("/jenis/{jenis_kegiatan}", response_model=List[LogbookResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_logbook_by_jenis(jenis_kegiatan: str, service: LogbookService = Depends(get_logbook_service)):
    """Filter logbook berdasarkan jenis kegiatan"""
    return service.ambil_logbook_by_jenis_kegiatan(jenis_kegiatan)

@router.get("/dosen/{dosen_pembimbing}", response_model=List[LogbookResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_logbook_by_dosen(dosen_pembimbing: str, service: LogbookService = Depends(get_logbook_service)):
    """Filter logbook berdasarkan dosen pembimbing"""
    return service.ambil_logbook_by_dosen(dosen_pembimbing)

# ============================================
# ENDPOINT UNTUK SEMUA USER TERDAFTAR
# ============================================

@router.get("/", response_model=List[LogbookResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_all_logbook(service: LogbookService = Depends(get_logbook_service)):
    """Ambil semua logbook"""
    return service.ambil_semua_logbook()

@router.get("/{logbook_id}", response_model=LogbookResponse, dependencies=[Depends(semua_user_terdaftar)])
def get_logbook_by_id(logbook_id: int, service: LogbookService = Depends(get_logbook_service)):
    """Ambil logbook berdasarkan ID"""
    return service.ambil_logbook_by_id(logbook_id)

@router.put("/{logbook_id}", response_model=LogbookResponse)
def update_logbook(
    logbook_id: int, 
    logbook: LogbookUpdate, 
    current_user: dict = Depends(hanya_mahasiswa),
    service: LogbookService = Depends(get_logbook_service)
):
    """Update logbook"""
    return service.ubah_logbook(logbook_id, logbook, current_user["user_id"])

@router.delete("/{logbook_id}")
def delete_logbook(
    logbook_id: int, 
    current_user: dict = Depends(hanya_mahasiswa),
    service: LogbookService = Depends(get_logbook_service)
):
    """Hapus logbook"""
    return service.hapus_logbook(logbook_id, current_user["user_id"])

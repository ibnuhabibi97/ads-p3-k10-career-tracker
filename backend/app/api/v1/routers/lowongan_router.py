from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.lowongan_schema import LowonganCreate, LowonganUpdate, LowonganResponse
from app.services.lowongan_service import LowonganService
from app.api.dependencies import get_lowongan_service
from app.core.security import RoleChecker

router = APIRouter(
    prefix="/lowongan",
    tags=["Lowongan Magang"]
)

hanya_staff = RoleChecker(["staff"])
semua_user_terdaftar = RoleChecker(["staff", "dosen", "mahasiswa"])

@router.get("/aktif", response_model=List[LowonganResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_lowongan_aktif(service: LowonganService = Depends(get_lowongan_service)):
    return service.ambil_lowongan_aktif()

@router.get("/{lowongan_id}", response_model=LowonganResponse, dependencies=[Depends(semua_user_terdaftar)])
def get_lowongan_by_id(lowongan_id: int, service: LowonganService = Depends(get_lowongan_service)):
    return service.ambil_lowongan_by_id(lowongan_id)

@router.get("/", response_model=List[LowonganResponse], dependencies=[Depends(semua_user_terdaftar)])
def get_all_lowongan(
    q: Optional[str] = None, 
    service: LowonganService = Depends(get_lowongan_service)
):
    # Jika ada parameter 'q' (pencarian), gunakan fungsi cari
    if q:
        return service.cari_lowongan(q)
    
    # Jika tidak ada parameter pencarian, kembalikan semua data
    return service.ambil_semua_lowongan()

@router.post("/", response_model=LowonganResponse, status_code=201, dependencies=[Depends(hanya_staff)])
def create_lowongan(lowongan: LowonganCreate, service: LowonganService = Depends(get_lowongan_service)):
    return service.tambah_lowongan(lowongan)

@router.put("/{lowongan_id}", response_model=LowonganResponse, dependencies=[Depends(hanya_staff)])
def update_lowongan(
    lowongan_id: int, 
    lowongan: LowonganUpdate, 
    service: LowonganService = Depends(get_lowongan_service)
):
    return service.ubah_lowongan(lowongan_id, lowongan)

@router.delete("/{lowongan_id}", dependencies=[Depends(hanya_staff)])
def delete_lowongan(lowongan_id: int, service: LowonganService = Depends(get_lowongan_service)):
    return service.hapus_lowongan(lowongan_id)

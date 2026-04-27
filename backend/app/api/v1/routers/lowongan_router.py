from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.lowongan_schema import LowonganCreate, LowonganResponse
from app.services.lowongan_service import LowonganService

router = APIRouter(
    prefix="/lowongan",
    tags=["Lowongan Magang"]
)

@router.get("/", response_model=List[LowonganResponse])
def get_all_lowongan(db: Session = Depends(get_db)):
    service = LowonganService(db)
    return service.ambil_semua_lowongan()

@router.get("/{id_lowongan}", response_model=LowonganResponse)
def get_lowongan_by_id(id_lowongan: int, db: Session = Depends(get_db)):
    service = LowonganService(db)
    return service.ambil_lowongan_by_id(id_lowongan)

@router.post("/", response_model=LowonganResponse, status_code=201)
def create_lowongan(lowongan: LowonganCreate, db: Session = Depends(get_db)):
    service = LowonganService(db)
    return service.tambah_lowongan(lowongan)

@router.put("/{id_lowongan}", response_model=LowonganResponse)
def update_lowongan(id_lowongan: int, lowongan: LowonganCreate, db: Session = Depends(get_db)):
    service = LowonganService(db)
    return service.ubah_lowongan(id_lowongan, lowongan)

@router.delete("/{id_lowongan}")
def delete_lowongan(id_lowongan: int, db: Session = Depends(get_db)):
    service = LowonganService(db)
    return service.hapus_lowongan(id_lowongan)
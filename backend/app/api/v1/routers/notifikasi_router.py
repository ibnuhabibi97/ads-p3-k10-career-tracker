from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.notifikasi_schema import NotifikasiResponse, NotifikasiUpdate
from app.services.notifikasi_service import NotifikasiService
from app.api.dependencies import get_notifikasi_service
from app.core.security import RoleChecker

router = APIRouter(
    prefix="/notifikasi",
    tags=["Notifikasi"]
)

semua_user = RoleChecker(["mahasiswa", "dosen", "staff"])

@router.get("/", response_model=List[NotifikasiResponse])
def ambil_notifikasi_saya(
    current_user: dict = Depends(semua_user),
    service: NotifikasiService = Depends(get_notifikasi_service)
):
    """Mengambil semua notifikasi milik user yang sedang login."""
    return service.ambil_notifikasi_user(current_user["user_id"])

@router.patch("/{notifikasi_id}/read", response_model=NotifikasiResponse)
def tandai_dibaca(
    notifikasi_id: int,
    current_user: dict = Depends(semua_user),
    service: NotifikasiService = Depends(get_notifikasi_service)
):
    """Menandai notifikasi tertentu sebagai sudah dibaca."""
    return service.tandai_dibaca(notifikasi_id, current_user["user_id"])

@router.patch("/read-all")
def tandai_semua_dibaca(
    current_user: dict = Depends(semua_user),
    service: NotifikasiService = Depends(get_notifikasi_service)
):
    """Menandai semua notifikasi milik user sebagai sudah dibaca."""
    service.tandai_semua_dibaca(current_user["user_id"])
    return {"message": "Semua notifikasi berhasil ditandai sebagai dibaca"}

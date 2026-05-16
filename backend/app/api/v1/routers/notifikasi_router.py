from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.notifikasi_schema import NotifikasiResponse, NotifikasiUpdate
from app.repositories.notifikasi_repository import NotifikasiRepository
from app.core.security import RoleChecker
from app.models.notifikasi import Notifikasi

router = APIRouter(
    prefix="/notifikasi",
    tags=["Notifikasi"]
)

semua_user = RoleChecker(["mahasiswa", "dosen", "staff"])

@router.get("/", response_model=List[NotifikasiResponse])
def ambil_notifikasi_saya(
    db: Session = Depends(get_db),
    current_user: dict = Depends(semua_user)
):
    """Mengambil semua notifikasi milik user yang sedang login."""
    repo = NotifikasiRepository(db)
    return repo.get_by_user(current_user["user_id"])

@router.patch("/{notifikasi_id}/read", response_model=NotifikasiResponse)
def tandai_dibaca(
    notifikasi_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(semua_user)
):
    """Menandai notifikasi tertentu sebagai sudah dibaca."""
    repo = NotifikasiRepository(db)
    
    db_notif = db.query(Notifikasi).filter(Notifikasi.notifikasi_id == notifikasi_id).first()
    
    if not db_notif:
        raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan")
    if db_notif.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Akses ditolak.")
        
    return repo.mark_as_read(notifikasi_id)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Union
from app.repositories.user_repository import UserRepository
from app.db.database import get_db
from app.schemas.user_schema import (
    DosenResponse, 
    UserResponse, 
    MahasiswaResponse, 
    StaffResponse,
    UserUpdate
)
from app.core.security import get_current_user, RoleChecker

router = APIRouter(prefix="/users", tags=["Users"])

hanya_dosen = RoleChecker(["dosen"])

@router.get("/me", response_model=Union[MahasiswaResponse, DosenResponse, StaffResponse, UserResponse])
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mendapatkan detail profil user yang sedang login berdasarkan role."""
    repo = UserRepository(db)
    user = repo.get_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    return user

@router.put("/me", response_model=Union[MahasiswaResponse, DosenResponse, StaffResponse, UserResponse])
def update_me(
    data: dict, 
    current_user: dict = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Memperbarui profil user yang sedang login."""
    repo = UserRepository(db)
    # Jangan biarkan update password atau role melalui endpoint ini
    safe_data = {k: v for k, v in data.items() if k not in ["password", "role", "user_id"]}
    
    updated_user = repo.update(current_user["user_id"], safe_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Gagal memperbarui profil")
    return updated_user

@router.get("/mahasiswa-bimbingan", response_model=List[MahasiswaResponse])
def get_mahasiswa_bimbingan(
    current_user: dict = Depends(hanya_dosen), 
    db: Session = Depends(get_db)
):
    """Dosen mendapatkan daftar mahasiswa bimbingannya."""
    repo = UserRepository(db)
    return repo.get_mahasiswa_bimbingan(current_user["user_id"])

@router.get("/dosen", response_model=List[DosenResponse])
def get_all_dosen(db: Session = Depends(get_db)):
    repo = UserRepository(db)
    return repo.get_all_dosen()

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.pendaftaran_schemas import PendaftaranCreate, PendaftaranResponse, PendaftaranUpdate
from app.services.pendaftaran_service import PendaftaranService
from app.core.security import get_current_user, RoleChecker

router = APIRouter(prefix="/pendaftaran", tags=["Pendaftaran"])

# Definisi akses
hanya_mahasiswa = RoleChecker(["mahasiswa"])
hanya_staff = RoleChecker(["staff"])

@router.post("/", response_model=PendaftaranResponse, status_code=status.HTTP_201_CREATED)
def daftar_magang(
    data: PendaftaranCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(hanya_mahasiswa) # Hanya mahasiswa yang bisa submit
):
    """
    Endpoint untuk mahasiswa mendaftar lowongan. 
    ID Mahasiswa diambil otomatis dari token JWT.
    """
    service = PendaftaranService(db)
    # Gunakan user_id dari token untuk keamanan
    return service.submit_pendaftaran(data, current_user["user_id"])

@router.patch("/{pendaftaran_id}/status", response_model=PendaftaranResponse)
def update_status_pendaftaran(
    pendaftaran_id: int,
    data: PendaftaranUpdate, # Schema yang berisi status_seleksi
    db: Session = Depends(get_db),
    current_user: dict = Depends(hanya_staff) # Hanya staff yang bisa edit status
):
    """
    Endpoint khusus Staff untuk memperbarui status seleksi (Diterima/Ditolak/dll).
    """
    if not data.status_seleksi:
        raise HTTPException(status_code=400, detail="Field status_seleksi wajib diisi")
        
    service = PendaftaranService(db)
    return service.update_status_seleksi(pendaftaran_id, data.status_seleksi)

@router.get("/saya", response_model=list[PendaftaranResponse])
def lihat_lamaran_saya(
    db: Session = Depends(get_db),
    current_user: dict = Depends(hanya_mahasiswa)
):
    """Mahasiswa melihat riwayat lamarannya sendiri."""
    from app.repositories.pendaftaran_repository import PendaftaranRepository
    repo = PendaftaranRepository(db)
    return repo.get_by_mahasiswa(current_user["user_id"])
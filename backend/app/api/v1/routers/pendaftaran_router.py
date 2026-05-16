from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.pendaftaran_schemas import PendaftaranCreate, PendaftaranResponse, PendaftaranUpdate
from app.services.pendaftaran_service import PendaftaranService
from app.core.security import RoleChecker
from app.core.storage import storage_client

router = APIRouter(prefix="/pendaftaran", tags=["Pendaftaran"])

# Definisi akses
hanya_mahasiswa = RoleChecker(["mahasiswa"])
hanya_staff = RoleChecker(["staff"])

@router.post("/", response_model=PendaftaranResponse, status_code=status.HTTP_201_CREATED)
async def daftar_magang(
    lowongan_id: int = Form(...),
    file_cv: UploadFile = File(...),
    file_rekomendasi: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(hanya_mahasiswa)
):
    """
    Endpoint untuk mahasiswa mendaftar lowongan dengan upload CV dan Surat Rekomendasi.
    File disimpan di Supabase: pendaftaran/cv dan pendaftaran/surat_rekomendasi.
    """
    # 1. Upload CV
    cv_contents = await file_cv.read()
    cv_url = storage_client.upload(
        file_data=cv_contents,
        file_name=file_cv.filename,
        content_type=file_cv.content_type,
        folder="pendaftaran/cv"
    )

    # 2. Upload Surat Rekomendasi
    rek_contents = await file_rekomendasi.read()
    rek_url = storage_client.upload(
        file_data=rek_contents,
        file_name=file_rekomendasi.filename,
        content_type=file_rekomendasi.content_type,
        folder="pendaftaran/surat_rekomendasi"
    )

    # 3. Simpan data pendaftaran
    pendaftaran_data = PendaftaranCreate(
        lowongan_id=lowongan_id,
        dokumen_cv=cv_url,
        dokumen_surat_rekomendasi=rek_url
    )

    service = PendaftaranService(db)
    # Gunakan await karena submit_pendaftaran sekarang async (untuk notifikasi)
    return await service.submit_pendaftaran(pendaftaran_data, current_user["user_id"])

@router.patch("/{pendaftaran_id}/status", response_model=PendaftaranResponse)
def update_status_pendaftaran(
    pendaftaran_id: int,
    data: PendaftaranUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(hanya_staff)
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

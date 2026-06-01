from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.pendaftaran_schemas import PendaftaranCreate, PendaftaranResponse, PendaftaranUpdate
from app.services.pendaftaran_service import PendaftaranService
from app.api.dependencies import get_pendaftaran_service
from app.core.security import RoleChecker
from app.core.storage import storage_client
import asyncio

router = APIRouter(prefix="/pendaftaran", tags=["Pendaftaran"])

# Definisi akses
hanya_mahasiswa = RoleChecker(["mahasiswa"])
hanya_staff = RoleChecker(["staff"])
staff_dan_mahasiswa = RoleChecker(["staff", "mahasiswa"])

@router.post("/", response_model=PendaftaranResponse, status_code=status.HTTP_201_CREATED)
async def daftar_magang(
    background_tasks: BackgroundTasks,
    lowongan_id: int = Form(...),
    file_cv: UploadFile = File(...),
    file_rekomendasi: UploadFile = File(...),
    current_user: dict = Depends(hanya_mahasiswa),
    service: PendaftaranService = Depends(get_pendaftaran_service)
):
    """
    Endpoint untuk mahasiswa mendaftar lowongan dengan upload CV dan Surat Rekomendasi secara paralel.
    """
    # 1. Baca isi file secara paralel
    cv_contents_task = file_cv.read()
    rek_contents_task = file_rekomendasi.read()
    cv_contents, rek_contents = await asyncio.gather(cv_contents_task, rek_contents_task)

    # 2. Upload ke Supabase secara paralel
    cv_upload_task = asyncio.to_thread(
        storage_client.upload,
        file_data=cv_contents,
        file_name=file_cv.filename,
        content_type=file_cv.content_type,
        folder="pendaftaran/cv"
    )
    rek_upload_task = asyncio.to_thread(
        storage_client.upload,
        file_data=rek_contents,
        file_name=file_rekomendasi.filename,
        content_type=file_rekomendasi.content_type,
        folder="pendaftaran/surat_rekomendasi"
    )
    cv_url, rek_url = await asyncio.gather(cv_upload_task, rek_upload_task)

    # 3. Simpan data pendaftaran
    pendaftaran_data = PendaftaranCreate(
        lowongan_id=lowongan_id,
        dokumen_cv=cv_url,
        dokumen_surat_rekomendasi=rek_url
    )

    return await service.submit_pendaftaran(pendaftaran_data, current_user["user_id"], background_tasks)

@router.get("/", response_model=list[PendaftaranResponse])
def ambil_semua_pendaftaran(
    current_user: dict = Depends(hanya_staff),
    service: PendaftaranService = Depends(get_pendaftaran_service)
):
    """Staff mengambil semua daftar pendaftaran magang."""
    return service.ambil_semua_pendaftaran()

@router.get("/saya", response_model=list[PendaftaranResponse])
def lihat_lamaran_saya(
    current_user: dict = Depends(hanya_mahasiswa),
    service: PendaftaranService = Depends(get_pendaftaran_service)
):
    """Mahasiswa melihat riwayat lamarannya sendiri."""
    return service.ambil_riwayat_mahasiswa(current_user["user_id"])

@router.get("/{pendaftaran_id}", response_model=PendaftaranResponse)
def ambil_detail_pendaftaran(
    pendaftaran_id: int,
    current_user: dict = Depends(staff_dan_mahasiswa),
    service: PendaftaranService = Depends(get_pendaftaran_service)
):
    """Melihat detail pendaftaran (Staff atau Mahasiswa pemilik)."""
    pendaftaran = service.ambil_detail_pendaftaran(pendaftaran_id)
    
    # Cek otorisasi jika mahasiswa
    if str(current_user["role"]).lower() == "mahasiswa" and pendaftaran.mahasiswa_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Anda tidak memiliki akses ke data ini")
        
    return pendaftaran

@router.get("/lowongan/{lowongan_id}", response_model=list[PendaftaranResponse])
def ambil_pendaftaran_by_lowongan(
    lowongan_id: int,
    current_user: dict = Depends(hanya_staff),
    service: PendaftaranService = Depends(get_pendaftaran_service)
):
    """Staff melihat semua pelamar pada lowongan tertentu."""
    return service.ambil_pendaftaran_by_lowongan(lowongan_id)

@router.patch("/{pendaftaran_id}/status", response_model=PendaftaranResponse)
async def update_status_pendaftaran(
    pendaftaran_id: int,
    data: PendaftaranUpdate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(hanya_staff),
    service: PendaftaranService = Depends(get_pendaftaran_service)
):
    """
    Endpoint khusus Staff untuk memperbarui status seleksi (Diterima/Ditolak/dll).
    """
    if not data.status_seleksi:
        raise HTTPException(status_code=400, detail="Field status_seleksi wajib diisi")
        
    return await service.update_status_seleksi(pendaftaran_id, data.status_seleksi, background_tasks)

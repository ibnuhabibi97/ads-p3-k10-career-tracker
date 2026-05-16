from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.rekomendasi_schemas import SuratRekomendasiCreate, SuratRekomendasiResponse, SuratRekomendasiStatus
from app.services.rekomendasi_service import SuratRekomendasiService
from app.api.dependencies import get_rekomendasi_service
from app.core.security import RoleChecker
from app.core.storage import storage_client

router = APIRouter(
    prefix="/surat-rekomendasi",
    tags=["Surat Rekomendasi"]
)

hanya_mahasiswa = RoleChecker(["mahasiswa"])
hanya_dosen = RoleChecker(["dosen"])
semua_user = RoleChecker(["mahasiswa", "dosen", "staff"])

@router.post("/", response_model=SuratRekomendasiResponse, status_code=201)
async def ajukan_surat(
    dosen_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(hanya_mahasiswa),
    service: SuratRekomendasiService = Depends(get_rekomendasi_service)
):
    """
    Mahasiswa mengajukan surat rekomendasi dengan mengunggah draf surat.
    """
    # 1. Upload ke Supabase
    contents = await file.read()
    public_url = storage_client.upload(
        file_data=contents,
        file_name=file.filename,
        content_type=file.content_type,
        folder="surat_rekomendasi"
    )

    # 2. Proses ke Service
    data = SuratRekomendasiCreate(dosen_id=dosen_id)
    return await service.ajukan_surat(data, current_user["user_id"], public_url)

@router.get("/mahasiswa/saya", response_model=List[SuratRekomendasiResponse])
def lihat_surat_saya(
    current_user: dict = Depends(hanya_mahasiswa),
    service: SuratRekomendasiService = Depends(get_rekomendasi_service)
):
    """Mahasiswa melihat daftar surat rekomendasi miliknya."""
    return service.ambil_surat_mahasiswa(current_user["user_id"])

@router.get("/dosen/tinjauan", response_model=List[SuratRekomendasiResponse])
def lihat_tinjauan_dosen(
    current_user: dict = Depends(hanya_dosen),
    service: SuratRekomendasiService = Depends(get_rekomendasi_service)
):
    """Dosen melihat daftar surat yang diajukan kepadanya."""
    return service.ambil_surat_dosen(current_user["user_id"])

@router.get("/{surat_id}", response_model=SuratRekomendasiResponse)
def detail_surat(
    surat_id: int, 
    current_user: dict = Depends(semua_user),
    service: SuratRekomendasiService = Depends(get_rekomendasi_service)
):
    """Melihat detail surat rekomendasi."""
    return service.ambil_detail_surat(surat_id, current_user["user_id"])

@router.patch("/{surat_id}/proses", response_model=SuratRekomendasiResponse)
async def proses_surat_dosen(
    surat_id: int,
    status: SuratRekomendasiStatus = Form(...), # Menggunakan Enum langsung
    file_signed: Optional[UploadFile] = File(None),
    current_user: dict = Depends(hanya_dosen),
    service: SuratRekomendasiService = Depends(get_rekomendasi_service)
):
    """
    Dosen memproses surat (setuju/tolak). Jika APPROVED, wajib upload surat bertanda tangan.
    """
    signed_url = None
    if status == SuratRekomendasiStatus.APPROVED:
        if not file_signed:
            raise HTTPException(status_code=400, detail="Jika disetujui, file bertanda tangan wajib diunggah.")
        
        contents = await file_signed.read()
        signed_url = storage_client.upload(
            file_data=contents,
            file_name=file_signed.filename,
            content_type=file_signed.content_type,
            folder="surat_rekomendasi"
        )

    return await service.proses_surat_oleh_dosen(surat_id, status, current_user["user_id"], signed_url)

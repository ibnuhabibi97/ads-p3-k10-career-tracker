from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date
from enum import Enum
from app.schemas.user_schema import MahasiswaResponse
from app.schemas.lowongan_schema import LowonganResponse

class PendaftaranStatus(str, Enum):
    PENDING = "PENDING"
    REVIEW = "REVIEW"
    SELEKSI = "SELEKSI"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"

class PendaftaranBase(BaseModel):
    dokumen_cv: str
    dokumen_surat_rekomendasi: str

class PendaftaranCreate(BaseModel):
    lowongan_id: int
    dokumen_cv: Optional[str] = None
    dokumen_surat_rekomendasi: Optional[str] = None

class PendaftaranUpdate(BaseModel):
    dokumen_cv: Optional[str] = None
    dokumen_surat_rekomendasi: Optional[str] = None
    status_seleksi: Optional[PendaftaranStatus] = None

class PendaftaranResponse(PendaftaranBase):
    pendaftaran_id: int
    mahasiswa_id: int
    lowongan_id: int
    tanggal_daftar: date
    status_seleksi: PendaftaranStatus
    mahasiswa: Optional[MahasiswaResponse] = None
    lowongan: Optional[LowonganResponse] = None

    model_config = ConfigDict(from_attributes=True)

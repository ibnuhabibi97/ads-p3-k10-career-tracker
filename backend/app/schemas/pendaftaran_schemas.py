from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date
from enum import Enum

class PendaftaranStatus(str, Enum):
    PENDING = "Pending Review"
    REVIEW = "Under Review"
    SELEKSI = "Tahap Seleksi"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"

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

    model_config = ConfigDict(from_attributes=True)

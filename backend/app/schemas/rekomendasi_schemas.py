from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import date
from enum import Enum

class SuratRekomendasiStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    APPROVED = "APPROVED"
    DECLINED = "DECLINED"

class SuratRekomendasiBase(BaseModel):
    mahasiswa_id: int
    dosen_id: int
    dokumen_surat: str
    status_surat: SuratRekomendasiStatus = SuratRekomendasiStatus.PENDING
    tanggal_pengajuan: date

class SuratRekomendasiCreate(BaseModel):
    dosen_id: int

class SuratRekomendasiUpdate(BaseModel):
    dokumen_surat: Optional[str] = None
    status_surat: Optional[SuratRekomendasiStatus] = None

class SuratRekomendasiResponse(SuratRekomendasiBase):
    surat_id: int
    mahasiswa: Optional[Any] = None
    dosen: Optional[Any] = None # Untuk nested data dosen jika ada

    model_config = ConfigDict(from_attributes=True)

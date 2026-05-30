from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date
from enum import Enum
from app.schemas.user_schema import MahasiswaResponse, DosenResponse

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
    mahasiswa: Optional[MahasiswaResponse] = None
    dosen: Optional[DosenResponse] = None

    model_config = ConfigDict(from_attributes=True)

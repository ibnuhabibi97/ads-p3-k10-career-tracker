from pydantic import BaseModel, ConfigDict
from typing import Optional
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

class SuratRekomendasiCreate(BaseModel):
    dosen_id: int
    # dokumen_surat akan diisi setelah upload

class SuratRekomendasiUpdate(BaseModel):
    dokumen_surat: Optional[str] = None
    status_surat: Optional[SuratRekomendasiStatus] = None

class SuratRekomendasiResponse(SuratRekomendasiBase):
    surat_id: int

    model_config = ConfigDict(from_attributes=True)

from pydantic import BaseModel, ConfigDict
from typing import Optional

class SuratRekomendasiBase(BaseModel):
    dokumen_surat: str

class SuratRekomendasiCreate(SuratRekomendasiBase):
    mahasiswa_id: int
    dosen_id: int

class SuratRekomendasiUpdate(BaseModel):
    dokumen_surat: Optional[str] = None
    status_surat: Optional[str] = None

class SuratRekomendasiResponse(SuratRekomendasiBase):
    surat_id: int
    mahasiswa_id: int
    dosen_id: int
    status_surat: str

    model_config = ConfigDict(from_attributes=True)
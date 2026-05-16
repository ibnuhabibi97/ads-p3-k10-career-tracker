from pydantic import BaseModel, ConfigDict
from typing import Optional

class SuratRekomendasiBase(BaseModel):
    mahasiswa_id: int
    dosen_id: int
    dokumen_surat: str
    status_surat: str = "Pending"

class SuratRekomendasiCreate(BaseModel):
    dosen_id: int
    # dokumen_surat akan diisi setelah upload

class SuratRekomendasiUpdate(BaseModel):
    dokumen_surat: Optional[str] = None
    status_surat: Optional[str] = None

class SuratRekomendasiResponse(SuratRekomendasiBase):
    surat_id: int

    model_config = ConfigDict(from_attributes=True)

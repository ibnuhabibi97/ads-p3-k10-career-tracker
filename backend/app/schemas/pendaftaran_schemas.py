from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class PendaftaranBase(BaseModel):
    dokumen_cv: str

class PendaftaranCreate(PendaftaranBase):
    mahasiswa_id: int
    lowongan_id: int

class PendaftaranUpdate(BaseModel):
    dokumen_cv: Optional[str] = None
    status_seleksi: Optional[str] = None

class PendaftaranResponse(PendaftaranBase):
    pendaftaran_id: int
    mahasiswa_id: int
    lowongan_id: int
    tanggal_daftar: date
    status_seleksi: str

    model_config = ConfigDict(from_attributes=True)
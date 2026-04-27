from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class PendaftaranBase(BaseModel):
    dokumen_cv: str

class PendaftaranCreate(PendaftaranBase):
    id_lowongan: int

class PendaftaranResponse(PendaftaranBase):
    id_pendaftaran: int
    mahasiswa_id: int
    lowongan_id: int
    tgl_daftar: date
    status_seleksi: bool
    keterangan: str
    
    model_config = ConfigDict(from_attributes=True)
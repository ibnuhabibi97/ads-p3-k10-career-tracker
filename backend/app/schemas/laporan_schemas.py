from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class LaporanBase(BaseModel):
    dokumen_laporan: str

class LaporanCreate(LaporanBase):
    pass

class LaporanUpdateNilai(BaseModel):
    nilai: int
    catatan: Optional[str] = None

class LaporanResponse(LaporanBase):
    id_laporan: int
    mahasiswa_id: int
    dosen_id: Optional[int]
    status: str
    nilai: Optional[int]
    tanggal_lapor: date
    catatan: Optional[str]
    
    model_config = ConfigDict(from_attributes=True)
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date
from enum import Enum

class LaporanStatus(str, Enum):
    PENDING = "PENDING"
    REVIEW = "REVIEW"
    REVISION = "REVISION"
    GRADED = "GRADED"
    REJECTED = "REJECTED"

#Base Schema
class LaporanBase(BaseModel):
    dokumen_laporan: str


#Create Schema (Untuk POST Request oleh Mahasiswa)
class LaporanCreate(LaporanBase):
    mahasiswa_id: Optional[int] = None


#Update Schema (Untuk PUT/PATCH Request oleh Mahasiswa - hanya dokumen)
class LaporanUpdate(BaseModel):
    dokumen_laporan: Optional[str] = None


#Response(Untuk Return API)
class LaporanResponse(BaseModel):
    laporan_id: int
    mahasiswa_id: int
    dosen_id: Optional[int] = None
    status: LaporanStatus
    nilai: Optional[int] = None
    tanggal_lapor: date
    dokumen_laporan: str
    catatan: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

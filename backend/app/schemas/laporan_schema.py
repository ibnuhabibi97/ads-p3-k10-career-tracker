from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date
from enum import Enum
from app.schemas.logbook_schemas import LogbookResponse
from app.schemas.lowongan_schema import LowonganResponse
from app.schemas.user_schema import MahasiswaResponse

class LaporanStatus(str, Enum):
    ONGOING = "ONGOING"
    PENDING = "PENDING"
    REVIEW = "REVIEW"
    REVISION = "REVISION"
    GRADED = "GRADED"
    REJECTED = "REJECTED"

#Base Schema
class LaporanBase(BaseModel):
    dokumen_laporan: Optional[str] = None


#Create Schema (Untuk POST Request oleh Mahasiswa)
class LaporanCreate(LaporanBase):
    mahasiswa_id: Optional[int] = None
    lowongan_id: Optional[int] = None


#Update Schema (Untuk PUT/PATCH Request oleh Mahasiswa)
class LaporanUpdate(BaseModel):
    dokumen_laporan: Optional[str] = None
    status: Optional[LaporanStatus] = None


#Response(Untuk Return API)
class LaporanResponse(BaseModel):
    laporan_id: int
    mahasiswa_id: int
    lowongan_id: Optional[int] = None
    dosen_id: Optional[int] = None
    status: LaporanStatus
    nilai: Optional[int] = None
    tanggal_lapor: date
    dokumen_laporan: Optional[str] = None
    catatan: Optional[str] = None
    logbooks: Optional[List[LogbookResponse]] = None
    lowongan: Optional[LowonganResponse] = None
    mahasiswa: Optional[MahasiswaResponse] = None

    model_config = ConfigDict(from_attributes=True)

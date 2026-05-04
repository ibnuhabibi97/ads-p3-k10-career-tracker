from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

#Base Schema
class LaporanBase(BaseModel):
    dokumen_laporan: str
    catatan: Optional[str] = None


#Create Schema (Untuk POST Request oleh Mahasiswa)
class LaporanCreate(LaporanBase):
    mahasiswa_id: int  



#Update Schema (Untuk PUT/PATCH Request)
class LaporanUpdate(BaseModel):
    dokumen_laporan: Optional[str] = None
    catatan: Optional[str] = None
    status: Optional[str] = None
    nilai: Optional[int] = None
    dosen_id: Optional[int] = None


#Response(Untuk Return API)
class LaporanResponse(LaporanBase):
    laporan_id: int
    mahasiswa_id: int
    dosen_id: Optional[int] = None
    status: str
    nilai: Optional[int] = None
    tanggal_lapor: date

    model_config = ConfigDict(from_attributes=True)
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime, timedelta

#Base Schema
class LogbookBase(BaseModel):
    waktu_mulai: datetime
    waktu_selesai: datetime
    dosen_pembimbing: str
    keterangan: str        # Mengikuti penamaan kolom di model (keterangan)
    media: Optional[str] = None
    dokumentasi: Optional[str] = None
    jenis_kegiatan: str


#Create Schema (Untuk POST Request)
class LogbookCreate(LogbookBase):
    laporan_id: int
    mahasiswa_id: int 


#Update Schema (Untuk PUT/PATCH Request)
class LogbookUpdate(BaseModel):
    waktu_mulai: Optional[datetime] = None
    waktu_selesai: Optional[datetime] = None
    dosen_pembimbing: Optional[str] = None
    keterangan: Optional[str] = None
    media: Optional[str] = None
    dokumentasi: Optional[str] = None
    jenis_kegiatan: Optional[str] = None


#Response / In-DB Schema (Untuk Return API)
class LogbookResponse(LogbookBase):
    logbook_id: int
    laporan_id: int
    mahasiswa_id: int
    
    tanggal_log: date
    durasi_kegiatan: timedelta 

    model_config = ConfigDict(from_attributes=True)
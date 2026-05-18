from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime, timedelta

#Base Schema
class LogbookBase(BaseModel):
    waktu_mulai: Optional[datetime] = None
    waktu_selesai: Optional[datetime] = None
    dosen_id: int
    keterangan: Optional[str] = None
    media: Optional[str] = None
    dokumentasi: Optional[str] = None
    jenis_kegiatan: Optional[str] = None


#Create Schema (Untuk POST Request)
class LogbookCreate(LogbookBase):
    laporan_id: int
    mahasiswa_id: Optional[int] = None


#Update Schema (Untuk PUT/PATCH Request)
class LogbookUpdate(BaseModel):
    waktu_mulai: Optional[datetime] = None
    waktu_selesai: Optional[datetime] = None
    dosen_id: Optional[int] = None
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
    durasi_kegiatan: Optional[timedelta] = None

    model_config = ConfigDict(from_attributes=True)

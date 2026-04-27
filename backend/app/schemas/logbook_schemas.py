from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class LogbookBase(BaseModel):
    kegiatan: str
    kendala: Optional[str] = None

class LogbookCreate(LogbookBase):
    tgl_log: date

class LogbookResponse(LogbookBase):
    id_logbook: int
    mahasiswa_id: int
    tgl_log: date
    status_verifikasi: bool
    
    model_config = ConfigDict(from_attributes=True)
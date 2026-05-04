from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

#Base Schema
class LowonganBase(BaseModel):
    perusahaan: str
    judul_posisi: str
    deskripsi_pekerjaan: str
    kualifikasi: list[str]  # ARRAY(String) di SQLAlchemy = list[str] di Pydantic
    deadline: date
    is_active: bool = True


#Create Schema (Untuk POST Request)
class LowonganCreate(LowonganBase):
    pass


#Update Schema (Untuk PUT/PATCH Request)
class LowonganUpdate(BaseModel):
    perusahaan: Optional[str] = None
    judul_posisi: Optional[str] = None
    deskripsi_pekerjaan: Optional[str] = None
    kualifikasi: Optional[list[str]] = None
    deadline: Optional[date] = None
    is_active: Optional[bool] = None


#Response / In-DB Schema (Untuk Return API)
class LowonganResponse(LowonganBase):
    lowongan_id: int

    model_config = ConfigDict(from_attributes=True)
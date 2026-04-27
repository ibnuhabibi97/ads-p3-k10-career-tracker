from pydantic import BaseModel, ConfigDict
from datetime import date

class LowonganBase(BaseModel):
    judul: str
    deskripsi: str
    persyaratan: str
    deadline: date
    status: bool = True

class LowonganCreate(LowonganBase):
    pass

class LowonganResponse(LowonganBase):
    id_lowongan: int
    
    model_config = ConfigDict(from_attributes=True)
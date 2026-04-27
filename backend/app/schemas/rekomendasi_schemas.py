from pydantic import BaseModel, ConfigDict
from datetime import date

class SuratRekomendasiBase(BaseModel):
    isi_surat: str

class SuratRekomendasiCreate(SuratRekomendasiBase):
    mahasiswa_id: int

class SuratRekomendasiResponse(SuratRekomendasiBase):
    id_surat: int
    mahasiswa_id: int
    dosen_id: int
    tanggal: date
    
    model_config = ConfigDict(from_attributes=True)
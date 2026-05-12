from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class PendaftaranBase(BaseModel):
    dokumen_cv: str
    # Tambahkan field baru sebagai opsional agar tidak memicu error 422
    dokumen_surat_rekomendasi: str

class PendaftaranCreate(PendaftaranBase):
    # mahasiswa_id DIHAPUS dari sini karena sistem mengambilnya otomatis dari token JWT
    lowongan_id: int

class PendaftaranUpdate(BaseModel):
    dokumen_cv: Optional[str] = None
    dokumen_surat_rekomendasi: Optional[str] = None # Ditambahkan untuk fitur update
    status_seleksi: Optional[str] = None

class PendaftaranResponse(PendaftaranBase):
    pendaftaran_id: int
    mahasiswa_id: int
    lowongan_id: int
    tanggal_daftar: date
    status_seleksi: str
    # dokumen_surat_rekomendasi otomatis terbawa karena mewarisi PendaftaranBase

    model_config = ConfigDict(from_attributes=True)
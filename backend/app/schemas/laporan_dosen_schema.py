from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date
# Digunakan di endpoint khusus Dosen (misal: PATCH /laporan/{id}/nilai)
class LaporanPenilaianUpdate(BaseModel):
    nilai: int
    status: str = "Telah Dinilai"
    dosen_id: int

# Digunakan di endpoint khusus Mahasiswa jika ingin merevisi file (misal: PATCH /laporan/{id})
class LaporanRevisiUpdate(BaseModel):
    dokumen_laporan: Optional[str] = None
    catatan: Optional[str] = None
    # Mahasiswa tidak bisa mengubah field lain
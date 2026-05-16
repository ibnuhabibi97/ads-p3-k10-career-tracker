from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date
from app.schemas.laporan_schema import LaporanStatus

# Digunakan di endpoint khusus Dosen untuk memberikan nilai dan catatan revisi
# (misal: PATCH /laporan/{id}/nilai)
class LaporanPenilaianUpdate(BaseModel):
    nilai: int
    status: LaporanStatus  # Menggunakan Enum
    dosen_id: Optional[int] = None
    catatan: Optional[str] = None  # Catatan/feedback revisi dari dosen

# Digunakan di endpoint khusus Dosen untuk memberikan catatan revisi saat menolak
# (misal: PATCH /laporan/{id}/revisi-dosen)
class LaporanRevisiDosenUpdate(BaseModel):
    catatan: str  # Catatan revisi/feedback dari dosen
    status: LaporanStatus = LaporanStatus.REJECTED  # Menggunakan Enum
    dosen_id: Optional[int] = None

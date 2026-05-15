from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

# Digunakan di endpoint khusus Dosen untuk memberikan nilai dan catatan revisi
# (misal: PATCH /laporan/{id}/nilai)
class LaporanPenilaianUpdate(BaseModel):
    nilai: int
    status: str  # "Pending", "Telah Dinilai", atau "Ditolak"
    dosen_id: Optional[int] = None
    catatan: Optional[str] = None  # Catatan/feedback revisi dari dosen

# Digunakan di endpoint khusus Dosen untuk memberikan catatan revisi saat menolak
# (misal: PATCH /laporan/{id}/revisi-dosen)
class LaporanRevisiDosenUpdate(BaseModel):
    catatan: str  # Catatan revisi/feedback dari dosen
    status: str = "Ditolak"  # Default status ketika ada catatan revisi
    dosen_id: Optional[int] = None
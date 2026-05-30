from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime
from app.schemas.rekomendasi_schemas import SuratRekomendasiStatus

class SuratRekomendasi(Base):
    __tablename__ = "surat_rekomendasi"

    surat_id = Column(Integer, primary_key=True, index=True)
    mahasiswa_id = Column(Integer, ForeignKey("mahasiswa.user_id"), nullable=False)
    dosen_id = Column(Integer, ForeignKey("dosen.user_id"), nullable=False)
    
    dokumen_surat = Column(String, nullable=False)
    status_surat = Column(
        SQLEnum(SuratRekomendasiStatus), 
        default=SuratRekomendasiStatus.PENDING,
        nullable=False
    )
    tanggal_pengajuan = Column(Date, default=datetime.date.today, nullable=False)

    # Relasi
    mahasiswa = relationship("Mahasiswa", back_populates="surat_rekomendasi")
    dosen = relationship("Dosen", back_populates="surat_diberikan")
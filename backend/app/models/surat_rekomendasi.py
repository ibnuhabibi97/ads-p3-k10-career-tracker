from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime

class SuratRekomendasi(Base):
    __tablename__ = "surat_rekomendasi"

    surat_id = Column(Integer, primary_key=True, index=True)
    mahasiswa_id = Column(Integer, ForeignKey("mahasiswa.user_id"), nullable=False)
    dosen_id = Column(Integer, ForeignKey("dosen.user_id"), nullable=False)
    
    dokumen_surat = Column(String, nullable=False)
    status_surat = Column(String, default="Pending") # Contoh: Pending, Diterima, Ditolak

    # Relasi
    mahasiswa = relationship("Mahasiswa", back_populates="surat_rekomendasi")
    dosen = relationship("Dosen", back_populates="surat_diberikan")
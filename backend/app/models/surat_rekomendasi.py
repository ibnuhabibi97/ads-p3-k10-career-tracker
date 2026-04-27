from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime

class SuratRekomendasi(Base):
    __tablename__ = "surat_rekomendasi"

    id_surat = Column(Integer, primary_key=True, index=True)
    mahasiswa_id = Column(Integer, ForeignKey("mahasiswa.user_id"), nullable=False)
    dosen_id = Column(Integer, ForeignKey("dosen.user_id"), nullable=False)
    
    isi_surat = Column(String, nullable=False)
    tanggal = Column(Date, default=datetime.date.today)

    # Relasi
    mahasiswa = relationship("Mahasiswa", back_populates="surat_rekomendasi")
    dosen = relationship("Dosen", back_populates="surat_diberikan")
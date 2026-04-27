from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime

class Pendaftaran(Base):
    __tablename__ = "pendaftaran"

    id_pendaftaran = Column(Integer, primary_key=True, index=True)
    mahasiswa_id = Column(Integer, ForeignKey("mahasiswa.user_id"), nullable=False)
    lowongan_id = Column(Integer, ForeignKey("lowongan.id_lowongan"), nullable=False)
    
    tgl_daftar = Column(Date, default=datetime.date.today)
    dokumen_cv = Column(String, nullable=False) # Menyimpan path/URL file
    status_seleksi = Column(Boolean, default=False)
    keterangan = Column(String, default="Pending Review")

    # Relasi
    mahasiswa = relationship("Mahasiswa", back_populates="pendaftaran")
    lowongan = relationship("Lowongan", back_populates="pendaftaran")
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime
from app.schemas.pendaftaran_schemas import PendaftaranStatus

class Pendaftaran(Base):
    __tablename__ = "pendaftaran"

    pendaftaran_id = Column(Integer, primary_key=True, index=True)
    mahasiswa_id = Column(Integer, ForeignKey("mahasiswa.user_id"), nullable=False)
    lowongan_id = Column(Integer, ForeignKey("lowongan.lowongan_id"), nullable=False)

    tanggal_daftar = Column(Date, default=datetime.date.today)
    dokumen_cv = Column(String, nullable=False) # Path/URL file di Supabase
    dokumen_surat_rekomendasi = Column(String, nullable=False) # Path/URL file di Supabase
    status_seleksi = Column(
        SQLEnum(PendaftaranStatus), 
        default=PendaftaranStatus.PENDING,
        nullable=False
    )

    # Relasi
    mahasiswa = relationship("Mahasiswa", back_populates="pendaftaran")
    lowongan = relationship("Lowongan", back_populates="pendaftaran")
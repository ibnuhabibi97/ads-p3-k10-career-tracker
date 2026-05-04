from sqlalchemy import Column, Integer, String, Boolean, Date
from sqlalchemy.orm import relationship
from app.models.base import Base
from sqlalchemy.dialects.postgresql import ARRAY

class Lowongan(Base):
    __tablename__ = "lowongan"

    lowongan_id = Column(Integer, primary_key=True, index=True)
    perusahaan = Column(String, nullable=False)
    judul_posisi = Column(String, index=True, nullable=False)
    deskripsi_pekerjaan = Column(String, nullable=False)
    kualifikasi = Column(ARRAY(String), nullable=False)
    deadline = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relasi
    pendaftaran = relationship("Pendaftaran", back_populates="lowongan")
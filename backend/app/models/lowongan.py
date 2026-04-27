from sqlalchemy import Column, Integer, String, Boolean, Date
from sqlalchemy.orm import relationship
from app.models.base import Base

class Lowongan(Base):
    __tablename__ = "lowongan"

    id_lowongan = Column(Integer, primary_key=True, index=True)
    judul = Column(String, index=True, nullable=False)
    deskripsi = Column(String, nullable=False)
    persyaratan = Column(String, nullable=False)
    deadline = Column(Date, nullable=False)
    status = Column(Boolean, default=True)

    # Relasi
    pendaftaran = relationship("Pendaftaran", back_populates="lowongan")
from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime
from app.schemas.laporan_schema import LaporanStatus

class Laporan(Base):
    __tablename__ = "laporan"

    laporan_id = Column(Integer, primary_key=True, index=True)
    mahasiswa_id = Column(Integer, ForeignKey("mahasiswa.user_id"), nullable=False)
    lowongan_id = Column(Integer, ForeignKey("lowongan.lowongan_id"), nullable=True)
    dosen_id = Column(Integer, ForeignKey("dosen.user_id"), nullable=True)

    status = Column(
        SQLEnum(LaporanStatus), 
        default=LaporanStatus.ONGOING, 
        nullable=False
    )
    nilai = Column(Integer, nullable=True)
    tanggal_lapor = Column(Date, default=datetime.date.today)
    catatan = Column(String, nullable=True) 
    dokumen_laporan = Column(String, nullable=True) # Path/URL file

    # Relasi
    mahasiswa = relationship("Mahasiswa", back_populates="laporans")
    dosen = relationship("Dosen", back_populates="laporans_dinilai")
    lowongan = relationship("Lowongan", back_populates="laporans")
    logbooks = relationship("Logbook", back_populates="laporan", cascade="all, delete-orphan")

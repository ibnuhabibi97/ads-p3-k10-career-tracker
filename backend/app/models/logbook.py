from sqlalchemy import Column, DateTime, Integer, Interval, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime

class Logbook(Base):
    __tablename__ = "logbook"

    logbook_id = Column(Integer, primary_key=True, index=True)
    laporan_id = Column(Integer, ForeignKey("laporan.laporan_id"), nullable=False)
    mahasiswa_id = Column(Integer, ForeignKey("mahasiswa.user_id"), nullable=False)
    dosen_id = Column(Integer, ForeignKey("dosen.user_id"), nullable=False)
    
    tanggal_log = Column(Date, default=datetime.date.today)
    waktu_mulai = Column(DateTime, nullable=False)
    waktu_selesai = Column(DateTime, nullable=False)
    durasi_kegiatan = Column(Interval, nullable=False) # Durasi dalam jam
    keterangan = Column(String, nullable=False)
    media = Column(String, nullable=True)
    dokumentasi = Column(String, nullable=True) # Path/URL file
    jenis_kegiatan = Column(String, nullable=False)

    # Relasi
    laporan = relationship("Laporan", back_populates="logbooks")
    mahasiswa = relationship("Mahasiswa", back_populates="logbooks")
    dosen = relationship("Dosen", back_populates="logbooks_pembimbing")
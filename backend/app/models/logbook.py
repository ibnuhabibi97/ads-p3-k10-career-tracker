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
    waktu_mulai = Column(DateTime, nullable=True)
    waktu_selesai = Column(DateTime, nullable=True)
    durasi_kegiatan = Column(Interval, nullable=True) 
    keterangan = Column(String, nullable=True)
    media = Column(String, nullable=True)
    dokumentasi = Column(String, nullable=True) 
    jenis_kegiatan = Column(String, nullable=True)

    # Relasi
    laporan = relationship("Laporan", back_populates="logbooks")
    mahasiswa = relationship("Mahasiswa", back_populates="logbooks")
    dosen = relationship("Dosen", back_populates="logbooks_pembimbing")

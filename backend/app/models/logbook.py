from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime

class Logbook(Base):
    __tablename__ = "logbook"

    id_logbook = Column(Integer, primary_key=True, index=True)
    mahasiswa_id = Column(Integer, ForeignKey("mahasiswa.user_id"), nullable=False)
    
    tgl_log = Column(Date, default=datetime.date.today)
    kegiatan = Column(String, nullable=False)
    kendala = Column(String, nullable=True)
    status_verifikasi = Column(Boolean, default=False)

    # Relasi
    mahasiswa = relationship("Mahasiswa", back_populates="logbooks")
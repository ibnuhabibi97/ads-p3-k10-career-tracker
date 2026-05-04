from sqlalchemy import Boolean, Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
import datetime

class Notifikasi(Base):
    __tablename__ = "notifikasi"

    notifikasi_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    isi_notifikasi = Column(String, nullable=False)
    target_url = Column(String, nullable=True) # URL tujuan saat notifikasi diklik
    is_read = Column(Boolean, default=False)
    
    # Relasi
    user = relationship("User", back_populates="notifikasi")
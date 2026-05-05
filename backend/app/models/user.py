from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    nama = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)

    __mapper_args__ = {
        "polymorphic_on": role,
        "polymorphic_identity": "user",
    }
    # Relasi ke entitas lain
    notifikasi = relationship("Notifikasi", back_populates="user")

class Mahasiswa(User):
    __tablename__ = "mahasiswa"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    nim = Column(String, unique=True, index=True, nullable=False)
    fakultas = Column(String, nullable=False)
    prodi = Column(String, nullable=False)

    __mapper_args__ = {"polymorphic_identity": "mahasiswa"}

    # Relasi ke entitas lain
    pendaftaran = relationship("Pendaftaran", back_populates="mahasiswa")
    laporans = relationship("Laporan", back_populates="mahasiswa")
    surat_rekomendasi = relationship("SuratRekomendasi", back_populates="mahasiswa")

class Dosen(User):
    __tablename__ = "dosen"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    nip = Column(String, unique=True, index=True, nullable=False)

    __mapper_args__ = {"polymorphic_identity": "dosen"}

    # Relasi ke entitas lain
    laporans_dinilai = relationship("Laporan", back_populates="dosen")
    surat_diberikan = relationship("SuratRekomendasi", back_populates="dosen")

class Staff(User):
    __tablename__ = "staff"
    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    nip = Column(String, unique=True, index=True, nullable=False)

    __mapper_args__ = {"polymorphic_identity": "staff"}
# Isi dari app/models/__init__.py

from app.models.base import Base

# Import semua class modelmu di sini agar SQLAlchemy mengenalinya
from app.models.user import User, Mahasiswa, Dosen, Staff
from app.models.lowongan import Lowongan
from app.models.pendaftaran import Pendaftaran
from app.models.laporan import Laporan
from app.models.logbook import Logbook
from app.models.surat_rekomendasi import SuratRekomendasi
from app.models.notifikasi import Notifikasi
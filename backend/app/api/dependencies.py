from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.database import get_db

from app.services.auth_service import AuthService
from app.services.lowongan_service import LowonganService
from app.services.pendaftaran_service import PendaftaranService
from app.services.laporan_service import LaporanService
from app.services.logbook_service import LogbookService
from app.services.rekomendasi_service import SuratRekomendasiService
from app.services.notifikasi_service import NotifikasiService

def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)

def get_lowongan_service(db: Session = Depends(get_db)) -> LowonganService:
    return LowonganService(db)

def get_pendaftaran_service(db: Session = Depends(get_db)) -> PendaftaranService:
    return PendaftaranService(db)

def get_laporan_service(db: Session = Depends(get_db)) -> LaporanService:
    return LaporanService(db)

def get_logbook_service(db: Session = Depends(get_db)) -> LogbookService:
    return LogbookService(db)

def get_rekomendasi_service(db: Session = Depends(get_db)) -> SuratRekomendasiService:
    return SuratRekomendasiService(db)

def get_notifikasi_service(db: Session = Depends(get_db)) -> NotifikasiService:
    return NotifikasiService(db)

import sys
import os
import pytest
import asyncio
import atexit
import httpx
from httpx import ASGITransport
from jwt import decode
import hashlib
from unittest.mock import patch, AsyncMock

# Mengarahkan Python untuk melihat folder root 'backend'
# Ini memperbaiki ModuleNotFoundError: No module named 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import or_
from app.db.database import SessionLocal
from app.models.user import User
from app.models.lowongan import Lowongan
from app.models.pendaftaran import Pendaftaran
from app.models.laporan import Laporan
from app.models.logbook import Logbook
from app.models.notifikasi import Notifikasi
from app.models.surat_rekomendasi import SuratRekomendasi
from app.schemas.user_schema import UserRole

from app.main import app
from app.core.config import settings

@pytest.fixture(autouse=True)
def mock_storage():
    """Mock upload Supabase agar test tidak butuh kredensial asli."""
    with patch("app.core.storage.SupabaseStorage.upload") as mock:
        # Mocking return value to include the requested folder to satisfy assertions
        def side_effect(file_data, file_name, content_type, folder="lowongan"):
            return f"https://mock-supabase-url.com/{folder}/{file_name}"
        mock.side_effect = side_effect
        yield mock

@pytest.fixture(autouse=True)
def mock_email():
    """Mock pengiriman email agar test tidak gagal karena kredensial SMTP."""
    with patch("app.services.email_service.kirim_email_notifikasi", new_callable=AsyncMock) as mock:
        yield mock

def _jwt_secret_key() -> str:
    secret_key = str(settings.SECRET_KEY)
    if len(secret_key.encode("utf-8")) < 32:
        return hashlib.sha256(secret_key.encode("utf-8")).hexdigest()
    return secret_key

transport = ASGITransport(app=app)
_async_client = httpx.AsyncClient(transport=transport, base_url="http://testserver")

def _run(coro):
    return asyncio.run(coro)

class SyncAsyncClient:
    def __init__(self, async_client):
        self._client = async_client

    def get(self, *args, **kwargs):
        return _run(self._client.get(*args, **kwargs))

    def post(self, *args, **kwargs):
        return _run(self._client.post(*args, **kwargs))

    def put(self, *args, **kwargs):
        return _run(self._client.put(*args, **kwargs))

    def delete(self, *args, **kwargs):
        return _run(self._client.delete(*args, **kwargs))

    def patch(self, *args, **kwargs):
        return _run(self._client.patch(*args, **kwargs))

    def close(self):
        return _run(self._client.aclose())

client_wrapper = SyncAsyncClient(_async_client)

atexit.register(lambda: _run(_async_client.aclose()))

TEST_USERNAMES = [
    "mhspelamar_baru",
    "staffhr_baru",
    "mhspelamar",
    "staffhr",
    "ibnutester",
    "mhspelamar_test",
    "dosenpembimbing",
    "attacker_log",
    "attacker_lap",
    "attacker_pendaftaran",
    "attacker_mhs",
    "attacker_mhs_lapor",
    "attacker_mhs_lapor",
    "dosen_lain"
]

TEST_EMAIL_SUFFIX = "@apps.ipb.ac.id"

TEST_LOWONGAN_COMPANIES = [
    "PT Teknologi Pintar",
    "PT Nusantara Tech",
    "PT Kurang Data",
    "PT Salah Tipe",
]

TEST_LOWONGAN_KEYWORDS = [
    "Intern",
    "Developer",
    "Data Scientist",
]

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Bersihkan dummy data test sebelum dan sesudah seluruh sesi pytest."""
    def clean_db(db):
        users = db.query(User).filter(
            or_(
                User.username.in_(TEST_USERNAMES),
                User.email.ilike(f"%{TEST_EMAIL_SUFFIX}"),
            )
        ).all()
        user_ids = [user.user_id for user in users]

        lowongans_by_company = db.query(Lowongan).filter(
            Lowongan.perusahaan.in_(TEST_LOWONGAN_COMPANIES)
        ).all()

        lowongans_by_keyword = db.query(Lowongan).filter(
            or_(*[Lowongan.judul_posisi.ilike(f"%{keyword}%") for keyword in TEST_LOWONGAN_KEYWORDS])
        ).all()

        lowongans = {low.lowongan_id: low for low in lowongans_by_company + lowongans_by_keyword}.values()
        lowongan_ids = [low.lowongan_id for low in lowongans]

        if lowongan_ids:
            db.query(Pendaftaran).filter(Pendaftaran.lowongan_id.in_(lowongan_ids)).delete(synchronize_session=False)

        if user_ids:
            # Hapus dependensi dengan urutan yang benar (Bottom-Up)
            db.query(Pendaftaran).filter(Pendaftaran.mahasiswa_id.in_(user_ids)).delete(synchronize_session=False)
            db.query(Logbook).filter(Logbook.mahasiswa_id.in_(user_ids)).delete(synchronize_session=False)
            db.query(Laporan).filter(Laporan.mahasiswa_id.in_(user_ids)).delete(synchronize_session=False)
            db.query(Laporan).filter(Laporan.dosen_id.in_(user_ids)).delete(synchronize_session=False)
            db.query(Notifikasi).filter(Notifikasi.user_id.in_(user_ids)).delete(synchronize_session=False)
            db.query(SuratRekomendasi).filter(SuratRekomendasi.mahasiswa_id.in_(user_ids)).delete(synchronize_session=False)
            db.query(SuratRekomendasi).filter(SuratRekomendasi.dosen_id.in_(user_ids)).delete(synchronize_session=False)

        deleted_users = 0
        for user in users:
            db.delete(user)
            deleted_users += 1

        deleted_lowongans = 0
        for low in lowongans:
            db.delete(low)
            deleted_lowongans += 1

        return deleted_users, deleted_lowongans

    db = SessionLocal()
    try:
        deleted_users, deleted_lowongans = clean_db(db)
        if deleted_users or deleted_lowongans:
            db.commit()
            print(f"Pre-test cleanup: {deleted_users} user(s), {deleted_lowongans} lowongan deleted.")
        else:
            db.rollback()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    yield

    db = SessionLocal()
    try:
        deleted_users, deleted_lowongans = clean_db(db)
        if deleted_users or deleted_lowongans:
            db.commit()
            print(f"Post-test cleanup: {deleted_users} user(s), {deleted_lowongans} lowongan deleted.")
        else:
            db.rollback()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

@pytest.fixture
def client():
    """Fixture untuk membuat test client FastAPI menggunakan WSGITransport."""
    return client_wrapper

@pytest.fixture
def staff_token(client):
    # Register staff user
    payload = {
        "nama": "Staff HR",
        "username": "staffhr",
        "email": "staffhr@apps.ipb.ac.id",
        "password": "password123",
        "role": UserRole.STAFF.value,
        "nip": "123456789"
    }
    client.post("/api/v1/auth/register", json=payload)
    
    # Login
    login_payload = {
        "username": "staffhr",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", data=login_payload)
    return response.json()["access_token"]

@pytest.fixture
def mahasiswa_token(client):
    # Register mahasiswa user
    payload = {
        "nama": "Mahasiswa Test",
        "username": "mhspelamar_test",
        "email": "mhspelamar_test@apps.ipb.ac.id",
        "password": "password123",
        "role": UserRole.MAHASISWA.value,
        "nim": "G64180002",
        "fakultas": "Teknologi Informasi",
        "prodi": "Informatika"
    }
    client.post("/api/v1/auth/register", json=payload)
    
    # Login
    login_payload = {
        "username": "mhspelamar_test",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", data=login_payload)
    return response.json()["access_token"]

@pytest.fixture
def dosen_token(client):
    # Register dosen user
    payload = {
        "nama": "Dosen Test",
        "username": "dosenpembimbing",
        "email": "dosenpembimbing@apps.ipb.ac.id",
        "password": "password123",
        "role": UserRole.DOSEN.value,
        "nip": "198501012015121001"
    }
    client.post("/api/v1/auth/register", json=payload)
    
    # Login
    login_payload = {
        "username": "dosenpembimbing",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", data=login_payload)
    return response.json()["access_token"]

@pytest.fixture
def mahasiswa_id(client):
    # Register mahasiswa user
    payload = {
        "nama": "Mahasiswa Test",
        "username": "mhspelamar_test",
        "email": "mhspelamar_test@apps.ipb.ac.id",
        "password": "password123",
        "role": UserRole.MAHASISWA.value,
        "nim": "G64180002",
        "fakultas": "Teknologi Informasi",
        "prodi": "Informatika"
    }
    client.post("/api/v1/auth/register", json=payload)
    
    # Login
    login_payload = {
        "username": "mhspelamar_test",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", data=login_payload)
    token = response.json()["access_token"]
    
    # Decode token to get user_id
    payload = decode(token, _jwt_secret_key(), algorithms=["HS256"])
    return int(payload["id"])

@pytest.fixture
def dosen_id(client):
    # Register dosen user
    payload = {
        "nama": "Dosen Test",
        "username": "dosenpembimbing",
        "email": "dosenpembimbing@apps.ipb.ac.id",
        "password": "password123",
        "role": UserRole.DOSEN.value,
        "nip": "198501012015121001"
    }
    client.post("/api/v1/auth/register", json=payload)
    
    # Login
    login_payload = {
        "username": "dosenpembimbing",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", data=login_payload)
    token = response.json()["access_token"]
    
    # Decode token to get user_id
    payload = decode(token, _jwt_secret_key(), algorithms=["HS256"])
    return int(payload["id"])

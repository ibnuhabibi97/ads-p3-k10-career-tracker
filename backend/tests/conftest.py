import sys
import os
import pytest

# Mengarahkan Python untuk melihat folder root 'backend'
# Ini memperbaiki ModuleNotFoundError: No module named 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import or_
from app.db.database import SessionLocal
from app.models.user import User
from app.models.lowongan import Lowongan
from app.models.pendaftaran import Pendaftaran

TEST_USERNAMES = [
    "mhspelamar_baru",
    "staffhr_baru",
    "mhspelamar",
    "staffhr",
    "ibnutester",
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
            db.query(Pendaftaran).filter(Pendaftaran.mahasiswa_id.in_(user_ids)).delete(synchronize_session=False)

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
    """Fixture untuk membuat test client FastAPI."""
    from fastapi.testclient import TestClient
    from app.main import app
    yield TestClient(app)
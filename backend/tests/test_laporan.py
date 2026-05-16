import pytest
from datetime import date
from app.schemas.laporan_schema import LaporanStatus

PREFIX = "/api/v1"

def test_create_laporan_positive(client, mahasiswa_token):
    """Test positif: Mahasiswa membuat laporan baru dengan file upload"""
    files = {
        "file": ("laporan_test.pdf", b"dummy content", "application/pdf")
    }
    
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.post(f"{PREFIX}/laporan/", files=files, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert "laporan_id" in data
    assert data["status"] == LaporanStatus.PENDING.value

def test_create_laporan_negative_unauthorized(client):
    """Test negatif: Akses tanpa token"""
    files = {"file": ("test.pdf", b"content")}
    response = client.post(f"{PREFIX}/laporan/", files=files)
    assert response.status_code == 401

@pytest.fixture
def other_mahasiswa_token(client):
    """Fixture untuk mahasiswa lain (attacker)"""
    payload = {
        "nama": "Attacker", "username": "attacker_lap", "email": "atk_lap@apps.ipb.ac.id",
        "password": "password123", "role": "mahasiswa", "nim": "G64182222",
        "fakultas": "FMIPA", "prodi": "Informatika"
    }
    client.post(f"{PREFIX}/auth/register", json=payload)
    login_res = client.post(f"{PREFIX}/auth/login", data={"username": "attacker_lap", "password": "password123"})
    return login_res.json()["access_token"]

def test_update_laporan_negative_forbidden_ownership(client, other_mahasiswa_token, mahasiswa_token):
    """Test Keamanan: Mahasiswa lain tidak bisa update laporan orang lain"""
    # 1. Mahasiswa asli buat laporan
    files = {"file": ("orig.pdf", b"content")}
    headers_orig = {"Authorization": f"Bearer {mahasiswa_token}"}
    res_orig = client.post(f"{PREFIX}/laporan/", files=files, headers=headers_orig)
    assert res_orig.status_code == 201
    laporan_id = res_orig.json()["laporan_id"]

    # 2. Attacker coba update
    payload = {"dokumen_laporan": "https://hacked.com"}
    headers_atk = {"Authorization": f"Bearer {other_mahasiswa_token}"}
    response = client.put(f"{PREFIX}/laporan/{laporan_id}", json=payload, headers=headers_atk)
    assert response.status_code == 403

def test_update_nilai_laporan_positive(client, dosen_token, mahasiswa_token):
    """Test positif: Dosen memberi nilai"""
    # 1. Mahasiswa buat laporan
    files = {"file": ("lapor.pdf", b"content")}
    headers_mhs = {"Authorization": f"Bearer {mahasiswa_token}"}
    res_mhs = client.post(f"{PREFIX}/laporan/", files=files, headers=headers_mhs)
    assert res_mhs.status_code == 201
    laporan_id = res_mhs.json()["laporan_id"]

    # 2. Dosen nilai
    payload = {"nilai": 90, "status": LaporanStatus.GRADED.value}
    headers_dsn = {"Authorization": f"Bearer {dosen_token}"}
    response = client.patch(f"{PREFIX}/laporan/{laporan_id}/nilai", json=payload, headers=headers_dsn)
    assert response.status_code == 200
    assert response.json()["nilai"] == 90
    assert response.json()["status"] == LaporanStatus.GRADED.value

def test_delete_laporan_positive(client, mahasiswa_token):
    """Test positif: Mahasiswa hapus laporan miliknya sendiri"""
    files = {"file": ("to_delete.pdf", b"content")}
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    res = client.post(f"{PREFIX}/laporan/", files=files, headers=headers)
    assert res.status_code == 201
    laporan_id = res.json()["laporan_id"]
    
    response = client.delete(f"{PREFIX}/laporan/{laporan_id}", headers=headers)
    assert response.status_code == 200

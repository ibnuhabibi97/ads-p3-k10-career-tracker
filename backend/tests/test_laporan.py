import pytest
import asyncio
import httpx
from httpx import ASGITransport
from app.main import app

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

client = SyncAsyncClient(_async_client)
PREFIX = "/api/v1"

# Variabel global untuk menyimpan ID hasil create agar bisa diuji di fungsi lain
test_laporan_id = None

def test_create_laporan_positive(mahasiswa_token):
    """Test positif: Mahasiswa membuat laporan baru (mahasiswa_id otomatis dari token)"""
    global test_laporan_id
    payload = {
        "dokumen_laporan": "https://drive.google.com/file/d/1234567890/view",
        "catatan": "Laporan magang semester 6 di PT XYZ"
    }
    
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.post(f"{PREFIX}/laporan/", json=payload, headers=headers)
    assert response.status_code == 201
    
    data = response.json()
    assert data["dokumen_laporan"] == payload["dokumen_laporan"]
    assert data["status"] == "Pending"
    assert "laporan_id" in data
    assert "mahasiswa_id" in data # Terisi otomatis dari token
    
    test_laporan_id = data["laporan_id"]

def test_create_laporan_negative_unauthorized(client):
    """Test negatif: Akses tanpa token"""
    payload = {
        "dokumen_laporan": "https://drive.google.com/file/d/test/view"
    }
    
    response = client.post(f"{PREFIX}/laporan/", json=payload)
    assert response.status_code == 401

# ==========================================
# OWNERSHIP & SECURITY TESTS
# ==========================================

@pytest.fixture
def other_mahasiswa_token(client):
    """Fixture untuk mahasiswa lain (attacker)"""
    payload = {
        "nama": "Attacker Mahasiswa Laporan",
        "username": "attacker_mhs_lapor",
        "email": "attacker_lapor@apps.ipb.ac.id",
        "password": "password123",
        "role": "mahasiswa",
        "nim": "G64188888",
        "fakultas": "FMIPA",
        "prodi": "Informatika"
    }
    client.post(f"{PREFIX}/auth/register", json=payload)
    
    login_payload = {"username": "attacker_mhs_lapor", "password": "password123"}
    response = client.post(f"{PREFIX}/auth/login", data=login_payload)
    return response.json()["access_token"]

def test_update_laporan_negative_forbidden_ownership(other_mahasiswa_token):
    """Test Keamanan: Mahasiswa lain tidak bisa update laporan orang lain"""
    payload = {
        "dokumen_laporan": "https://drive.google.com/file/d/hacked/view"
    }
    
    headers = {"Authorization": f"Bearer {other_mahasiswa_token}"}
    response = client.put(f"{PREFIX}/laporan/{test_laporan_id}", json=payload, headers=headers)
    assert response.status_code == 403
    assert "bukan pemilik" in response.json()["detail"].lower()

# ==========================================
# UPDATE TESTS - DOSEN
# ==========================================

def test_update_nilai_laporan_positive(dosen_token):
    """Test positif: Dosen memberi nilai pada laporan (dosen_id otomatis dari token)"""
    payload = {
        "nilai": 85,
        "status": "Telah Dinilai",
        "catatan": "Kerja bagus"
    }
    
    headers = {"Authorization": f"Bearer {dosen_token}"}
    response = client.patch(f"{PREFIX}/laporan/{test_laporan_id}/nilai", json=payload, headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["nilai"] == 85
    assert data["status"] == "Telah Dinilai"
    assert "dosen_id" in data # Terisi otomatis dari token dosen

def test_update_nilai_laporan_negative_mahasiswa_cannot_grade(mahasiswa_token):
    """Test negatif: Mahasiswa tidak bisa memberi nilai"""
    payload = {
        "nilai": 85,
        "status": "Telah Dinilai"
    }
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.patch(f"{PREFIX}/laporan/{test_laporan_id}/nilai", json=payload, headers=headers)
    assert response.status_code == 403

# ==========================================
# DELETE TESTS
# ==========================================

def test_delete_laporan_positive(mahasiswa_token):
    """Test positif: Mahasiswa hapus laporan miliknya sendiri"""
    # Buat laporan baru untuk dihapus
    payload = {
        "dokumen_laporan": "https://drive.google.com/file/d/delete-test/view"
    }
    
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    create_response = client.post(f"{PREFIX}/laporan/", json=payload, headers=headers)
    assert create_response.status_code == 201
    laporan_to_delete = create_response.json()["laporan_id"]
    
    # Hapus laporan
    delete_response = client.delete(f"{PREFIX}/laporan/{laporan_to_delete}", headers=headers)
    assert delete_response.status_code == 200
    
    # Verifikasi bahwa data benar-benar terhapus
    get_response = client.get(f"{PREFIX}/laporan/{laporan_to_delete}", headers=headers)
    assert get_response.status_code == 404

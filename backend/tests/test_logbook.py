import pytest
from datetime import datetime, timedelta

PREFIX = "/api/v1"

# Setup laporan data
@pytest.fixture
def setup_laporan_id(client, mahasiswa_token):
    """Setup: Buat laporan test dulu (parent dari logbook)"""
    payload = {
        "dokumen_laporan": "https://drive.google.com/file/d/test-laporan/view"
    }
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.post(f"{PREFIX}/laporan/", json=payload, headers=headers)
    assert response.status_code == 201
    return response.json()["laporan_id"]

# Setup logbook data
@pytest.fixture
def setup_logbook_id(client, mahasiswa_token, setup_laporan_id, dosen_id):
    """Setup: Buat logbook test"""
    payload = {
        "laporan_id": setup_laporan_id,
        "dosen_id": dosen_id,
        "waktu_mulai": "2026-05-15T08:00:00",
        "waktu_selesai": "2026-05-15T12:00:00",
        "keterangan": "Mengerjakan sistem database untuk aplikasi inventory",
        "media": "WhatsApp",
        "dokumentasi": "https://drive.google.com/file/d/logbook001/view",
        "jenis_kegiatan": "Programming"
    }
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.post(f"{PREFIX}/logbook/", json=payload, headers=headers)
    assert response.status_code == 201
    return response.json()["logbook_id"]

def test_create_logbook_positive(client, mahasiswa_token, setup_laporan_id, dosen_id):
    """Test positif: Mahasiswa membuat logbook baru"""
    payload = {
        "laporan_id": setup_laporan_id,
        "dosen_id": dosen_id,
        "waktu_mulai": "2026-05-15T14:00:00",
        "waktu_selesai": "2026-05-15T16:00:00",
        "keterangan": "Logbook tambahan",
        "jenis_kegiatan": "Documentation"
    }
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.post(f"{PREFIX}/logbook/", json=payload, headers=headers)
    assert response.status_code == 201

def test_get_logbook_by_id_positive(client, mahasiswa_token, setup_logbook_id):
    """Test positif: Ambil logbook berdasarkan ID"""
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/logbook/{setup_logbook_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["logbook_id"] == setup_logbook_id

def test_update_logbook_negative_forbidden_ownership(client, setup_logbook_id):
    """Test Keamanan: Mahasiswa lain tidak bisa update logbook orang lain"""
    # Create another user for attack
    payload_reg = {
        "nama": "Attacker", "username": "attacker_log", "email": "atk_log@apps.ipb.ac.id",
        "password": "password123", "role": "mahasiswa", "nim": "G64187777",
        "fakultas": "FMIPA", "prodi": "Informatika"
    }
    client.post(f"{PREFIX}/auth/register", json=payload_reg)
    login_res = client.post(f"{PREFIX}/auth/login", data={"username": "attacker_log", "password": "password123"})
    other_token = login_res.json()["access_token"]

    payload = {"keterangan": "Mencoba meretas"}
    headers = {"Authorization": f"Bearer {other_token}"}
    response = client.put(f"{PREFIX}/logbook/{setup_logbook_id}", json=payload, headers=headers)
    assert response.status_code == 403

def test_update_logbook_positive(client, mahasiswa_token, setup_logbook_id):
    """Test positif: Mahasiswa update logbook miliknya sendiri"""
    payload = {"keterangan": "Updated keterangan"}
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.put(f"{PREFIX}/logbook/{setup_logbook_id}", json=payload, headers=headers)
    assert response.status_code == 200

def test_delete_logbook_positive(client, mahasiswa_token, setup_laporan_id, dosen_id):
    """Test positif: Mahasiswa hapus logbook miliknya"""
    payload = {
        "laporan_id": setup_laporan_id,
        "dosen_id": dosen_id,
        "waktu_mulai": "2026-05-16T09:00:00",
        "waktu_selesai": "2026-05-16T14:00:00",
        "keterangan": "Untuk dihapus",
        "jenis_kegiatan": "Testing"
    }
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    create_response = client.post(f"{PREFIX}/logbook/", json=payload, headers=headers)
    assert create_response.status_code == 201
    logbook_id = create_response.json()["logbook_id"]
    
    response = client.delete(f"{PREFIX}/logbook/{logbook_id}", headers=headers)
    assert response.status_code == 200

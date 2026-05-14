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

# Variabel global untuk menyimpan ID hasil create agar bisa diuji di fungsi lain
test_lowongan_id = None

# Prefix URL yang disesuaikan dengan main.py
PREFIX = "/api/v1/lowongan"

def test_create_lowongan_positive(staff_token):
    global test_lowongan_id
    payload = {
        "perusahaan": "PT Nusantara Tech",
        "judul_posisi": "Backend Developer Intern",
        "deskripsi_pekerjaan": "Membantu pengembangan API perusahaan",
        "kualifikasi": ["S1 Teknik Informatika", "Python", "FastAPI"],
        "deadline": "2026-12-31",
        "is_active": True
    }
    
    headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.post(f"{PREFIX}/", json=payload, headers=headers)
    assert response.status_code == 201
    
    data = response.json()
    assert data["perusahaan"] == payload["perusahaan"]
    assert data["judul_posisi"] == payload["judul_posisi"]
    assert "lowongan_id" in data
    
    test_lowongan_id = data["lowongan_id"]

def test_create_lowongan_negative_missing_field(staff_token):
    payload = {
        "perusahaan": "PT Kurang Data",
        "judul_posisi": "Frontend Developer Intern"
        # deskripsi, kualifikasi, dan deadline sengaja dihilangkan
    }
    
    headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.post(f"{PREFIX}/", json=payload, headers=headers)
    assert response.status_code == 422 

def test_create_lowongan_negative_invalid_datatype(staff_token):
    payload = {
        "perusahaan": "PT Salah Tipe",
        "judul_posisi": "Data Scientist",
        "deskripsi_pekerjaan": "Analisis data",
        "kualifikasi": "Python dan SQL", # Seharusnya berupa list/array
        "deadline": "2026-12-31"
    }
    
    headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.post(f"{PREFIX}/", json=payload, headers=headers)
    assert response.status_code == 422

def test_get_all_lowongan_positive(mahasiswa_token):
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_lowongan_aktif_positive(mahasiswa_token):
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/aktif", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    for item in data:
        assert item["is_active"] is True

def test_search_lowongan_positive_perusahaan(mahasiswa_token):
    keyword = "Nusantara"
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/?q={keyword}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Memastikan kata kunci ada di salah satu hasil perusahaan
    match_found = any(keyword.lower() in item["perusahaan"].lower() for item in data)
    assert match_found is True

def test_search_lowongan_positive_judul_posisi(mahasiswa_token):
    keyword = "backend developer"
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/?q={keyword}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Memastikan kata kunci ada di salah satu hasil judul_posisi
    match_found = any(keyword.lower() in item["judul_posisi"].lower() for item in data)
    assert match_found is True

def test_search_lowongan_negative_not_found(mahasiswa_token):
    keyword = "PosisiGaibAtauPerusahaanFiktif"
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/?q={keyword}", headers=headers)
    
    # Ekspektasi statusnya adalah 200 (Pencarian berhasil dieksekusi)
    assert response.status_code == 200

    data = response.json()
    # Memastikan hasilnya adalah list (array)
    assert isinstance(data, list)
    # Memastikan list tersebut kosong (karena datanya memang tidak ada)
    assert len(data) == 0

def test_get_lowongan_by_id_positive(mahasiswa_token):
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/{test_lowongan_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["lowongan_id"] == test_lowongan_id

def test_get_lowongan_by_id_negative_not_found(mahasiswa_token):
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/999999", headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Data lowongan tidak ditemukan"

def test_update_lowongan_positive(staff_token):
    payload = {
        "judul_posisi": "Senior Backend Developer",
        "is_active": False
    }
    
    headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.put(f"{PREFIX}/{test_lowongan_id}", json=payload, headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["judul_posisi"] == "Senior Backend Developer"
    assert data["is_active"] is False

def test_update_lowongan_negative_not_found(staff_token):
    payload = {
        "judul_posisi": "Posisi Gaib"
    }
    headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.put(f"{PREFIX}/999999", json=payload, headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Data lowongan gagal diubah karena tidak ditemukan"

def test_update_lowongan_negative_invalid_datatype(staff_token):
    payload = {
        "deadline": "bukan-tanggal-yang-valid"
    }
    headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.put(f"{PREFIX}/{test_lowongan_id}", json=payload, headers=headers)
    assert response.status_code == 422

def test_delete_lowongan_positive(staff_token):
    headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.delete(f"{PREFIX}/{test_lowongan_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Data lowongan berhasil dihapus"
    
    # Verifikasi bahwa data benar-benar terhapus
    check_response = client.get(f"{PREFIX}/{test_lowongan_id}", headers=headers)
    assert check_response.status_code == 404

def test_delete_lowongan_negative_not_found(staff_token):
    headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.delete(f"{PREFIX}/999999", headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Data lowongan gagal dihapus karena tidak ditemukan"
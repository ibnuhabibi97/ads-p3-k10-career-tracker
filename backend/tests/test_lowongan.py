import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Variabel global untuk menyimpan ID hasil create agar bisa diuji di fungsi lain
test_lowongan_id = None

# Prefix URL yang disesuaikan dengan main.py
PREFIX = "/api/v1/lowongan"

def test_create_lowongan_positive():
    global test_lowongan_id
    payload = {
        "perusahaan": "PT Nusantara Tech",
        "judul_posisi": "Backend Developer Intern",
        "deskripsi_pekerjaan": "Membantu pengembangan API perusahaan",
        "kualifikasi": ["S1 Teknik Informatika", "Python", "FastAPI"],
        "deadline": "2026-12-31",
        "is_active": True
    }
    
    response = client.post(f"{PREFIX}/", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert data["perusahaan"] == payload["perusahaan"]
    assert data["judul_posisi"] == payload["judul_posisi"]
    assert "lowongan_id" in data
    
    test_lowongan_id = data["lowongan_id"]

def test_create_lowongan_negative_missing_field():
    payload = {
        "perusahaan": "PT Kurang Data",
        "judul_posisi": "Frontend Developer Intern"
        # deskripsi, kualifikasi, dan deadline sengaja dihilangkan
    }
    
    response = client.post(f"{PREFIX}/", json=payload)
    assert response.status_code == 422 

def test_create_lowongan_negative_invalid_datatype():
    payload = {
        "perusahaan": "PT Salah Tipe",
        "judul_posisi": "Data Scientist",
        "deskripsi_pekerjaan": "Analisis data",
        "kualifikasi": "Python dan SQL", # Seharusnya berupa list/array
        "deadline": "2026-12-31"
    }
    
    response = client.post(f"{PREFIX}/", json=payload)
    assert response.status_code == 422

def test_get_all_lowongan_positive():
    response = client.get(f"{PREFIX}/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_lowongan_aktif_positive():
    response = client.get(f"{PREFIX}/aktif")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    for item in data:
        assert item["is_active"] is True

def test_search_lowongan_positive_perusahaan():
    keyword = "Nusantara"
    response = client.get(f"{PREFIX}/?q={keyword}")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Memastikan kata kunci ada di salah satu hasil perusahaan
    match_found = any(keyword.lower() in item["perusahaan"].lower() for item in data)
    assert match_found is True

def test_search_lowongan_positive_judul_posisi():
    keyword = "backend developer"
    response = client.get(f"{PREFIX}/?q={keyword}")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Memastikan kata kunci ada di salah satu hasil judul_posisi
    match_found = any(keyword.lower() in item["judul_posisi"].lower() for item in data)
    assert match_found is True

def test_search_lowongan_negative_not_found():
    keyword = "PosisiGaibAtauPerusahaanFiktif"
    response = client.get(f"{PREFIX}/?q={keyword}")
    
    # Ekspektasi statusnya adalah 200 (Pencarian berhasil dieksekusi)
    assert response.status_code == 200

    data = response.json()
    # Memastikan hasilnya adalah list (array)
    assert isinstance(data, list)
    # Memastikan list tersebut kosong (karena datanya memang tidak ada)
    assert len(data) == 0

def test_get_lowongan_by_id_positive():
    response = client.get(f"{PREFIX}/{test_lowongan_id}")
    assert response.status_code == 200
    assert response.json()["lowongan_id"] == test_lowongan_id

def test_get_lowongan_by_id_negative_not_found():
    response = client.get(f"{PREFIX}/999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Data lowongan tidak ditemukan"

def test_update_lowongan_positive():
    payload = {
        "judul_posisi": "Senior Backend Developer",
        "is_active": False
    }
    
    response = client.put(f"{PREFIX}/{test_lowongan_id}", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["judul_posisi"] == "Senior Backend Developer"
    assert data["is_active"] is False

def test_update_lowongan_negative_not_found():
    payload = {
        "judul_posisi": "Posisi Gaib"
    }
    response = client.put(f"{PREFIX}/999999", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Data lowongan gagal diubah karena tidak ditemukan"

def test_update_lowongan_negative_invalid_datatype():
    payload = {
        "deadline": "bukan-tanggal-yang-valid"
    }
    response = client.put(f"{PREFIX}/{test_lowongan_id}", json=payload)
    assert response.status_code == 422

def test_delete_lowongan_positive():
    response = client.delete(f"{PREFIX}/{test_lowongan_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Data lowongan berhasil dihapus"
    
    # Verifikasi bahwa data benar-benar terhapus
    check_response = client.get(f"{PREFIX}/{test_lowongan_id}")
    assert check_response.status_code == 404

def test_delete_lowongan_negative_not_found():
    response = client.delete(f"{PREFIX}/999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Data lowongan gagal dihapus karena tidak ditemukan"
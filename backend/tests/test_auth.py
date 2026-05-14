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
from unittest.mock import patch
PREFIX = "/api/v1/auth"

# Variabel global untuk menyimpan token JWT antar test
test_access_token = None

def test_register_user_positive():
    payload = {
        "nama": "Ibnu Mahasiswa",
        "username": "ibnutester",
        "email": "ibnu.tester@apps.ipb.ac.id",
        "password": "passwordrahasia123",
        "role": "mahasiswa",
        "nim": "G64180001",
        "fakultas": "Teknologi Informasi",
        "prodi": "Informatika"
    }
    response = client.post(f"{PREFIX}/register", json=payload)
    assert response.status_code == 201
    assert response.json()["username"] == "ibnutester"

def test_register_user_negative_duplicate():
    # Mengirim data yang sama persis dengan test sebelumnya
    payload = {
        "nama": "Ibnu Mahasiswa",
        "username": "ibnutester",
        "email": "ibnu.tester@apps.ipb.ac.id",
        "password": "passwordrahasia123",
        "role": "mahasiswa",
        "nim": "G64180001",
        "fakultas": "Teknologi Informasi",
        "prodi": "Informatika"
    }
    response = client.post(f"{PREFIX}/register", json=payload)
    assert response.status_code == 400
    assert "sudah terdaftar" in response.json()["detail"].lower()

def test_login_user_positive():
    global test_access_token
    # Perhatikan: Login menggunakan keys 'username' dan 'password' standar OAuth2
    payload = {
        "username": "ibnutester",
        "password": "passwordrahasia123"
    }
    # Perhatikan: menggunakan 'data=' bukan 'json='
    response = client.post(f"{PREFIX}/login", data=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Simpan token untuk test selanjutnya
    test_access_token = data["access_token"]

def test_login_user_negative_wrong_password():
    payload = {
        "username": "ibnutester",
        "password": "password-salah-banget"
    }
    response = client.post(f"{PREFIX}/login", data=payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Username atau password salah"

def test_change_password_negative_unauthorized():
    # Mencoba akses tanpa token header
    payload = {
        "password_lama": "passwordrahasia123",
        "password_baru": "passwordbaru321"
    }
    response = client.put(f"{PREFIX}/change-password", json=payload)
    assert response.status_code == 401 # Unauthorized

def test_change_password_positive():
    # Menambahkan token ke Headers
    headers = {
        "Authorization": f"Bearer {test_access_token}"
    }
    payload = {
        "password_lama": "passwordrahasia123",
        "password_baru": "passwordbaru321"
    }
    response = client.put(f"{PREFIX}/change-password", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Password berhasil diubah"

def test_login_with_new_password():
    # Memastikan password baru benar-benar bekerja
    payload = {
        "username": "ibnutester",
        "password": "passwordbaru321"
    }
    response = client.post(f"{PREFIX}/login", data=payload)
    assert response.status_code == 200

@patch("app.services.auth_service.kirim_email_reset_password")
def test_forgot_password_endpoint(mock_kirim_email): 
    # Mencegah pengiriman email asli
    mock_kirim_email.return_value = None 
    
    payload = {
        "email": "ibnu.tester@apps.ipb.ac.id" # Sesuaikan dengan email test yang baru
    }
    response = client.post(f"{PREFIX}/forgot-password", json=payload)
    assert response.status_code == 200
    assert "link reset telah dikirim" in response.json()["message"]

def test_reset_password_negative_invalid_token():
    payload = {
        "token": "ini.token.ngasal.yang.pasti.gagal",
        "password_baru": "hacker123"
    }
    response = client.post(f"{PREFIX}/reset-password", json=payload)
    assert response.status_code == 400
    assert "Token tidak valid" in response.json()["detail"]
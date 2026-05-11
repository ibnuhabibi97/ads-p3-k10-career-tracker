import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
PREFIX = "/api/v1"

# Variabel global
token_mhs = ""
token_staff = ""
lowongan_test_id = 0
pendaftaran_test_id = 0

def test_setup_users_and_lowongan():
    """Setup: Register & Login Mahasiswa, Staff, dan buat 1 Lowongan"""
    global token_mhs, token_staff, lowongan_test_id

    # 1. Setup Mahasiswa
    client.post(f"{PREFIX}/auth/register", json={
        "nama": "Mahasiswa Pelamar Baru", "username": "mhspelamar_baru", 
        "email": "pelamar.baru@apps.ipb.ac.id", "password": "password123", 
        "role": "mahasiswa", "nim": "G64190001", "fakultas": "FMIPA", "prodi": "Ilmu Komputer"
    })
    res_mhs = client.post(f"{PREFIX}/auth/login", data={"username": "mhspelamar_baru", "password": "password123"})
    assert res_mhs.status_code == 200, "Login Mahasiswa gagal!"
    token_mhs = res_mhs.json()["access_token"]

    # 2. Setup Staff
    client.post(f"{PREFIX}/auth/register", json={
        "nama": "Staff HR Baru", "username": "staffhr_baru", 
        "email": "hr.baru@apps.ipb.ac.id", "password": "password123", 
        "role": "staff", "nip": "199001012020121002"
    })
    res_staff = client.post(f"{PREFIX}/auth/login", data={"username": "staffhr_baru", "password": "password123"})
    assert res_staff.status_code == 200, "Login Staff gagal!"
    token_staff = res_staff.json()["access_token"]

    # 3. Setup Lowongan (DISESUAIKAN DENGAN SCHEMA LOWONGAN BARU)
    res_lowongan = client.post(
        f"{PREFIX}/lowongan/", 
        headers={"Authorization": f"Bearer {token_staff}"},
        json={
            "perusahaan": "PT Teknologi Pintar",
            "judul_posisi": "Data Scientist Intern",
            "deskripsi_pekerjaan": "Membangun model machine learning dan analisis data.",
            "kualifikasi": [
                "Mahasiswa tingkat akhir", 
                "Menguasai Python dan SQL"
            ], # Perhatikan: Ini sekarang berbentuk List/Array
            "deadline": "2026-12-31" # Format tanggal YYYY-MM-DD
        } 
    )
    
    assert res_lowongan.status_code == 201, f"GAGAL BUAT LOWONGAN: {res_lowongan.json()}"
    lowongan_test_id = res_lowongan.json().get("lowongan_id")


# ==========================================
# SKENARIO VALIDASI SCHEMA
# ==========================================

def test_daftar_tanpa_surat_rekomendasi_gagal():
    # Mengetes apakah Pydantic memblokir request yang tidak membawa surat rekomendasi
    payload = {
        "lowongan_id": lowongan_test_id,
        "dokumen_cv": "https://link-cv.com/cv.pdf"
        # dokumen_surat_rekomendasi sengaja dihilangkan
    }
    response = client.post(
        f"{PREFIX}/pendaftaran/",
        headers={"Authorization": f"Bearer {token_mhs}"},
        json=payload
    )
    # Harus ditolak oleh validasi Schema (Unprocessable Entity)
    assert response.status_code == 422 

# ==========================================
# SKENARIO PENDAFTARAN UTAMA
# ==========================================

def test_mahasiswa_daftar_lowongan_sukses():
    global pendaftaran_test_id
    payload = {
        "lowongan_id": lowongan_test_id,
        "dokumen_cv": "https://link-cv.com/cv.pdf",
        "dokumen_surat_rekomendasi": "https://link-surat.com/rekomendasi.pdf" # Wajib ada!
    }
    response = client.post(
        f"{PREFIX}/pendaftaran/",
        headers={"Authorization": f"Bearer {token_mhs}"},
        json=payload
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status_seleksi"] == "Pending Review"
    pendaftaran_test_id = data["pendaftaran_id"]

def test_mahasiswa_daftar_lowongan_duplikat_gagal():
    # Mencoba mendaftar lagi dengan data lengkap agar lolos Pydantic, 
    # tapi harus diblokir oleh logika Service (Business Logic)
    payload = {
        "lowongan_id": lowongan_test_id,
        "dokumen_cv": "https://link-cv.com/cv_revisi.pdf",
        "dokumen_surat_rekomendasi": "https://link-surat.com/rekomendasi_baru.pdf"
    }
    response = client.post(
        f"{PREFIX}/pendaftaran/",
        headers={"Authorization": f"Bearer {token_mhs}"},
        json=payload
    )
    # Harus ditolak (Bad Request) karena duplikat
    assert response.status_code == 400 
    assert "sudah mendaftar" in response.json()["detail"].lower()

def test_staff_coba_daftar_lowongan_gagal():
    payload = {
        "lowongan_id": lowongan_test_id,
        "dokumen_cv": "cv_staff.pdf",
        "dokumen_surat_rekomendasi": "surat_staff.pdf"
    }
    response = client.post(
        f"{PREFIX}/pendaftaran/",
        headers={"Authorization": f"Bearer {token_staff}"},
        json=payload
    )
    assert response.status_code == 403

# ==========================================
# SKENARIO UPDATE & READ
# ==========================================

def test_mahasiswa_coba_update_status_gagal():
    payload = {"status_seleksi": "Diterima"}
    response = client.patch(
        f"{PREFIX}/pendaftaran/{pendaftaran_test_id}/status",
        headers={"Authorization": f"Bearer {token_mhs}"},
        json=payload
    )
    assert response.status_code == 403

def test_staff_update_status_sukses():
    payload = {"status_seleksi": "Tahap Wawancara"}
    response = client.patch(
        f"{PREFIX}/pendaftaran/{pendaftaran_test_id}/status",
        headers={"Authorization": f"Bearer {token_staff}"},
        json=payload
    )
    assert response.status_code == 200
    assert response.json()["status_seleksi"] == "Tahap Wawancara"

def test_mahasiswa_lihat_lamaran_saya():
    response = client.get(
        f"{PREFIX}/pendaftaran/saya",
        headers={"Authorization": f"Bearer {token_mhs}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(item["lowongan_id"] == lowongan_test_id for item in data)
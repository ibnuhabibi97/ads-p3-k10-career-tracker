import pytest
from datetime import date

PREFIX = "/api/v1"

@pytest.fixture
def setup_lowongan_id(client, staff_token):
    """Setup: Buat 1 Lowongan untuk ditest"""
    res_lowongan = client.post(
        f"{PREFIX}/lowongan/", 
        headers={"Authorization": f"Bearer {staff_token}"},
        json={
            "perusahaan": "PT Teknologi Pintar",
            "judul_posisi": "Data Scientist Intern",
            "deskripsi_pekerjaan": "Membangun model machine learning dan analisis data.",
            "kualifikasi": ["Mahasiswa tingkat akhir", "Menguasai Python"],
            "deadline": "2026-12-31"
        } 
    )
    assert res_lowongan.status_code == 201
    return res_lowongan.json().get("lowongan_id")

def test_mahasiswa_daftar_lowongan_sukses(client, mahasiswa_token, setup_lowongan_id):
    """Test positif: Mahasiswa mendaftar dengan upload CV dan Surat Rekomendasi"""
    data = {
        "lowongan_id": setup_lowongan_id
    }
    files = {
        "file_cv": ("my_cv.pdf", b"pdf content", "application/pdf"),
        "file_rekomendasi": ("surat.pdf", b"pdf content", "application/pdf")
    }
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    
    response = client.post(f"{PREFIX}/pendaftaran/", data=data, files=files, headers=headers)
    assert response.status_code == 201
    
    res_data = response.json()
    assert res_data["lowongan_id"] == setup_lowongan_id
    assert "pendaftaran/cv" in res_data["dokumen_cv"]
    assert "pendaftaran/surat_rekomendasi" in res_data["dokumen_surat_rekomendasi"]
    assert res_data["status_seleksi"] == "Pending Review"

def test_daftar_tanpa_file_gagal(client, mahasiswa_token, setup_lowongan_id):
    """Test negatif: Mencoba daftar tanpa menyertakan file wajib"""
    data = {"lowongan_id": setup_lowongan_id}
    # Tanpa files
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.post(f"{PREFIX}/pendaftaran/", data=data, headers=headers)
    assert response.status_code == 422

def test_mahasiswa_daftar_lowongan_duplikat_gagal(client, mahasiswa_token, setup_lowongan_id):
    """Test negatif: Mahasiswa tidak bisa daftar 2x di lowongan yang sama"""
    data = {"lowongan_id": setup_lowongan_id}
    files = {
        "file_cv": ("cv.pdf", b"content", "application/pdf"),
        "file_rekomendasi": ("surat.pdf", b"content", "application/pdf")
    }
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    
    # Pendaftaran pertama
    res1 = client.post(f"{PREFIX}/pendaftaran/", data=data, files=files, headers=headers)
    assert res1.status_code == 201
    
    # Pendaftaran kedua
    res2 = client.post(f"{PREFIX}/pendaftaran/", data=data, files=files, headers=headers)
    assert res2.status_code == 400
    assert "sudah mendaftar" in res2.json()["detail"].lower()

def test_staff_coba_daftar_lowongan_gagal(client, staff_token, setup_lowongan_id):
    """Test Keamanan: Staff tidak diizinkan mendaftar (hanya mahasiswa)"""
    data = {"lowongan_id": setup_lowongan_id}
    files = {
        "file_cv": ("cv.pdf", b"content", "application/pdf"),
        "file_rekomendasi": ("surat.pdf", b"content", "application/pdf")
    }
    headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.post(f"{PREFIX}/pendaftaran/", data=data, files=files, headers=headers)
    assert response.status_code == 403

def test_staff_update_status_sukses(client, staff_token, mahasiswa_token, setup_lowongan_id):
    """Test positif: Staff memperbarui status pendaftaran"""
    # 1. Mahasiswa daftar dulu
    data = {"lowongan_id": setup_lowongan_id}
    files = {
        "file_cv": ("cv.pdf", b"content", "application/pdf"),
        "file_rekomendasi": ("surat.pdf", b"content", "application/pdf")
    }
    mhs_headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    reg_res = client.post(f"{PREFIX}/pendaftaran/", data=data, files=files, headers=mhs_headers)
    pendaftaran_id = reg_res.json()["pendaftaran_id"]
    
    # 2. Staff update status
    payload = {"status_seleksi": "Accepted"}
    staff_headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.patch(f"{PREFIX}/pendaftaran/{pendaftaran_id}/status", json=payload, headers=staff_headers)
    
    assert response.status_code == 200
    assert response.json()["status_seleksi"] == "Accepted"

def test_mahasiswa_lihat_lamaran_saya(client, mahasiswa_token, setup_lowongan_id):
    """Test positif: Mahasiswa melihat daftar pendaftarannya sendiri"""
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/pendaftaran/saya", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

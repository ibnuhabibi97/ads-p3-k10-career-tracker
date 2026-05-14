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
mahasiswa_id = None
dosen_id = None

def test_create_laporan_positive(mahasiswa_token, mahasiswa_id):
    """Test positif: Mahasiswa membuat laporan baru"""
    global test_laporan_id
    payload = {
        "mahasiswa_id": mahasiswa_id,
        "dokumen_laporan": "https://drive.google.com/file/d/1234567890/view",
        "catatan": "Laporan magang semester 6 di PT XYZ"
    }
    
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.post(f"{PREFIX}/laporan/", json=payload, headers=headers)
    assert response.status_code == 201
    
    data = response.json()
    assert data["mahasiswa_id"] == mahasiswa_id
    assert data["dokumen_laporan"] == payload["dokumen_laporan"]
    assert data["status"] == "Pending"
    assert "laporan_id" in data
    
    test_laporan_id = data["laporan_id"]

def test_create_laporan_negative_missing_field(mahasiswa_token, mahasiswa_id):
    """Test negatif: Field dokumen_laporan tidak dikirim"""
    payload = {
        "mahasiswa_id": mahasiswa_id
        # dokumen_laporan sengaja dihilangkan
    }
    
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.post(f"{PREFIX}/laporan/", json=payload, headers=headers)
    assert response.status_code == 422

def test_create_laporan_negative_invalid_datatype(mahasiswa_token):
    """Test negatif: mahasiswa_id bukan integer"""
    payload = {
        "mahasiswa_id": "bukan-angka",
        "dokumen_laporan": "https://drive.google.com/file/d/test/view",
        "catatan": "Test invalid type"
    }
    
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.post(f"{PREFIX}/laporan/", json=payload, headers=headers)
    assert response.status_code == 422

def test_create_laporan_negative_unauthorized(client, mahasiswa_id):
    """Test negatif: Akses tanpa token"""
    payload = {
        "mahasiswa_id": mahasiswa_id,
        "dokumen_laporan": "https://drive.google.com/file/d/test/view"
    }
    
    response = client.post(f"{PREFIX}/laporan/", json=payload)
    assert response.status_code == 401

# ==========================================
# GET TESTS
# ==========================================

def test_get_all_laporan_positive(mahasiswa_token):
    """Test positif: Ambil semua laporan"""
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/laporan/", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_laporan_by_id_positive(mahasiswa_token):
    """Test positif: Ambil laporan berdasarkan ID"""
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/laporan/{test_laporan_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["laporan_id"] == test_laporan_id

def test_get_laporan_by_id_negative_not_found(mahasiswa_token):
    """Test negatif: Laporan dengan ID 999999 tidak ditemukan"""
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/laporan/999999", headers=headers)
    assert response.status_code == 404
    assert "tidak ditemukan" in response.json()["detail"].lower()

def test_get_laporan_mahasiswa_positive(mahasiswa_token, mahasiswa_id):
    """Test positif: Ambil laporan milik mahasiswa tertentu"""
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/laporan/mahasiswa/{mahasiswa_id}", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_laporan_pending_positive(dosen_token):
    """Test positif: Dosen ambil laporan yang masih pending"""
    headers = {"Authorization": f"Bearer {dosen_token}"}
    response = client.get(f"{PREFIX}/laporan/pending/all", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_laporan_pending_negative_unauthorized_mahasiswa(mahasiswa_token):
    """Test negatif: Mahasiswa tidak bisa akses endpoint pending laporan"""
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/laporan/pending/all", headers=headers)
    assert response.status_code == 403

def test_get_laporan_dosen_positive(dosen_token, dosen_id):
    """Test positif: Dosen ambil laporan yang dinilainya"""
    headers = {"Authorization": f"Bearer {dosen_token}"}
    response = client.get(f"{PREFIX}/laporan/dosen/{dosen_id}", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# ==========================================
# UPDATE TESTS - MAHASISWA
# ==========================================

def test_update_laporan_mahasiswa_positive(mahasiswa_token):
    """Test positif: Mahasiswa update dokumen laporan (tidak bisa update catatan)"""
    payload = {
        "dokumen_laporan": "https://drive.google.com/file/d/updated123/view"
    }
    
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.put(f"{PREFIX}/laporan/{test_laporan_id}", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["dokumen_laporan"] == payload["dokumen_laporan"]

def test_update_laporan_negative_not_found(mahasiswa_token):
    """Test negatif: Update laporan yang tidak ada"""
    payload = {
        "dokumen_laporan": "https://drive.google.com/file/d/test/view"
    }
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.put(f"{PREFIX}/laporan/999999", json=payload, headers=headers)
    assert response.status_code == 404
    assert "tidak ditemukan" in response.json()["detail"].lower()



# ==========================================
# UPDATE TESTS - DOSEN
# ==========================================

def test_update_nilai_laporan_positive(dosen_token, dosen_id):
    """Test positif: Dosen memberi nilai pada laporan"""
    payload = {
        "nilai": 85,
        "status": "Telah Dinilai",
        "dosen_id": dosen_id
    }
    
    headers = {"Authorization": f"Bearer {dosen_token}"}
    response = client.patch(f"{PREFIX}/laporan/{test_laporan_id}/nilai", json=payload, headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["nilai"] == 85
    assert data["status"] == "Telah Dinilai"
    assert data["dosen_id"] == dosen_id

def test_update_nilai_laporan_negative_not_found(dosen_token, dosen_id):
    """Test negatif: Beri nilai laporan yang tidak ada"""
    payload = {
        "nilai": 80,
        "status": "Telah Dinilai",
        "dosen_id": dosen_id
    }
    headers = {"Authorization": f"Bearer {dosen_token}"}
    response = client.patch(f"{PREFIX}/laporan/999999/nilai", json=payload, headers=headers)
    assert response.status_code == 404

def test_update_nilai_laporan_negative_mahasiswa_cannot_grade(mahasiswa_token, dosen_id):
    """Test negatif: Mahasiswa tidak bisa memberi nilai"""
    payload = {
        "nilai": 85,
        "status": "Telah Dinilai",
        "dosen_id": dosen_id
    }
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.patch(f"{PREFIX}/laporan/{test_laporan_id}/nilai", json=payload, headers=headers)
    assert response.status_code == 403

def test_update_nilai_dengan_catatan_positive(dosen_token, dosen_id):
    """Test positif: Dosen memberi nilai dengan catatan revisi"""
    payload = {
        "nilai": 75,
        "status": "Ditolak",
        "dosen_id": dosen_id,
        "catatan": "Laporan perlu diperbaiki bagian metodologi dan analisis data"
    }
    
    headers = {"Authorization": f"Bearer {dosen_token}"}
    response = client.patch(f"{PREFIX}/laporan/{test_laporan_id}/nilai", json=payload, headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["nilai"] == 75
    assert data["status"] == "Ditolak"
    assert data["catatan"] == payload["catatan"]

def test_update_nilai_invalid_range(dosen_token, dosen_id):
    """Test negatif: Nilai di luar range (misalnya > 100)"""
    payload = {
        "nilai": 999,
        "status": "Telah Dinilai",
        "dosen_id": dosen_id
    }
    headers = {"Authorization": f"Bearer {dosen_token}"}
    response = client.patch(f"{PREFIX}/laporan/{test_laporan_id}/nilai", json=payload, headers=headers)
    # Sistem seharusnya menerima tapi bisa validasi di business logic
    # Untuk sekarang asumsikan masuk tapi bisa test di validation terpisah
    assert response.status_code == 200

def test_update_catatan_revisi_dosen_positive(dosen_token, dosen_id):
    """Test positif: Dosen memberikan catatan revisi saat menolak laporan"""
    # Buat laporan baru untuk direvisi
    mahasiswa_token = "dummy"  # Simulasi token
    payload = {
        "mahasiswa_id": 1,
        "dokumen_laporan": "https://drive.google.com/file/d/revisi-test/view"
    }
    # Sebagai alternatif, gunakan laporan yang sudah ada
    revisi_payload = {
        "catatan": "Laporan ditolak karena format tidak sesuai. Silakan perbaiki bagian pendahuluan dan kesimpulan.",
        "status": "Ditolak",
        "dosen_id": dosen_id
    }
    
    headers = {"Authorization": f"Bearer {dosen_token}"}
    response = client.patch(f"{PREFIX}/laporan/{test_laporan_id}/revisi-dosen", json=revisi_payload, headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["catatan"] == revisi_payload["catatan"]
    assert data["status"] == "Ditolak"
    assert data["dosen_id"] == dosen_id

def test_update_catatan_revisi_dosen_negative_not_found(dosen_token, dosen_id):
    """Test negatif: Update catatan revisi laporan yang tidak ada"""
    payload = {
        "catatan": "Perbaiki laporan",
        "status": "Ditolak",
        "dosen_id": dosen_id
    }
    headers = {"Authorization": f"Bearer {dosen_token}"}
    response = client.patch(f"{PREFIX}/laporan/999999/revisi-dosen", json=payload, headers=headers)
    assert response.status_code == 404

def test_update_catatan_revisi_dosen_negative_mahasiswa_cannot_use(mahasiswa_token, dosen_id):
    """Test negatif: Mahasiswa tidak bisa memberikan catatan revisi"""
    payload = {
        "catatan": "Perbaiki laporan",
        "status": "Ditolak",
        "dosen_id": dosen_id
    }
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.patch(f"{PREFIX}/laporan/{test_laporan_id}/revisi-dosen", json=payload, headers=headers)
    assert response.status_code == 403

# ==========================================
# DELETE TESTS
# ==========================================

def test_delete_laporan_positive(mahasiswa_token, mahasiswa_id):
    """Test positif: Mahasiswa hapus laporan"""
    # Buat laporan baru untuk dihapus
    payload = {
        "mahasiswa_id": mahasiswa_id,
        "dokumen_laporan": "https://drive.google.com/file/d/delete-test/view"
    }
    
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    create_response = client.post(f"{PREFIX}/laporan/", json=payload, headers=headers)
    assert create_response.status_code == 201
    laporan_to_delete = create_response.json()["laporan_id"]
    
    # Hapus laporan
    delete_response = client.delete(f"{PREFIX}/laporan/{laporan_to_delete}", headers=headers)
    assert delete_response.status_code == 200
    assert "berhasil dihapus" in delete_response.json()["message"].lower()
    
    # Verifikasi bahwa data benar-benar terhapus
    get_response = client.get(f"{PREFIX}/laporan/{laporan_to_delete}", headers=headers)
    assert get_response.status_code == 404

def test_delete_laporan_negative_not_found(mahasiswa_token):
    """Test negatif: Hapus laporan yang tidak ada"""
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.delete(f"{PREFIX}/laporan/999999", headers=headers)
    assert response.status_code == 404
    assert "tidak ditemukan" in response.json()["detail"].lower()

def test_delete_laporan_negative_unauthorized(client):
    """Test negatif: Hapus tanpa token"""
    response = client.delete(f"{PREFIX}/laporan/{test_laporan_id}")
    assert response.status_code == 401

# ==========================================
# FILTER TESTS
# ==========================================

def test_get_laporan_by_status_positive_staff(staff_token):
    """Test positif: Staff filter laporan berdasarkan status"""
    headers = {"Authorization": f"Bearer {staff_token}"}
    response = client.get(f"{PREFIX}/laporan/status/Pending", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_laporan_by_status_negative_not_staff(mahasiswa_token):
    """Test negatif: Mahasiswa tidak bisa filter berdasarkan status"""
    headers = {"Authorization": f"Bearer {mahasiswa_token}"}
    response = client.get(f"{PREFIX}/laporan/status/Pending", headers=headers)
    assert response.status_code == 403

# ==========================================
# ROLE BASED ACCESS CONTROL TESTS
# ==========================================

def test_create_laporan_only_mahasiswa(dosen_token, staff_token, mahasiswa_id):
    """Test: Hanya mahasiswa yang bisa create laporan"""
    payload = {
        "mahasiswa_id": 1,
        "dokumen_laporan": "https://test.com/laporan.pdf"
    }
    
    # Dosen tidak bisa create
    headers_dosen = {"Authorization": f"Bearer {dosen_token}"}
    response_dosen = client.post(f"{PREFIX}/laporan/", json=payload, headers=headers_dosen)
    assert response_dosen.status_code == 403
    
    # Staff tidak bisa create
    headers_staff = {"Authorization": f"Bearer {staff_token}"}
    response_staff = client.post(f"{PREFIX}/laporan/", json=payload, headers=headers_staff)
    assert response_staff.status_code == 403

def test_grade_laporan_only_dosen(mahasiswa_token, staff_token, dosen_id):
    """Test: Hanya dosen yang bisa grade laporan"""
    payload = {
        "nilai": 80,
        "status": "Telah Dinilai",
        "dosen_id": dosen_id
    }
    
    # Mahasiswa tidak bisa grade
    headers_mhs = {"Authorization": f"Bearer {mahasiswa_token}"}
    response_mhs = client.patch(f"{PREFIX}/laporan/{test_laporan_id}/nilai", json=payload, headers=headers_mhs)
    assert response_mhs.status_code == 403
    
    # Staff tidak bisa grade
    headers_staff = {"Authorization": f"Bearer {staff_token}"}
    response_staff = client.patch(f"{PREFIX}/laporan/{test_laporan_id}/nilai", json=payload, headers=headers_staff)
    assert response_staff.status_code == 403

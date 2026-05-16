import pytest
from app.schemas.rekomendasi_schemas import SuratRekomendasiStatus
from app.schemas.user_schema import UserRole

PREFIX = "/api/v1"

def test_flow_surat_rekomendasi_full(client, mahasiswa_token, dosen_token, dosen_id):
    """
    Test End-to-End: 
    1. Mahasiswa ajukan surat (upload draf)
    2. Verifikasi notifikasi muncul di sisi Dosen
    3. Dosen setujui surat (upload surat bertanda tangan)
    4. Verifikasi notifikasi muncul di sisi Mahasiswa
    """
    
    # 1. Mahasiswa ajukan surat
    data_ajukan = {"dosen_id": dosen_id}
    files_ajukan = {"file": ("draft_surat.pdf", b"ini draf surat", "application/pdf")}
    headers_mhs = {"Authorization": f"Bearer {mahasiswa_token}"}
    
    res_ajukan = client.post(f"{PREFIX}/surat-rekomendasi/", data=data_ajukan, files=files_ajukan, headers=headers_mhs)
    assert res_ajukan.status_code == 201
    surat_id = res_ajukan.json()["surat_id"]
    assert res_ajukan.json()["status_surat"] == SuratRekomendasiStatus.PENDING.value
    
    # 2. Verifikasi notifikasi di sisi Dosen
    headers_dsn = {"Authorization": f"Bearer {dosen_token}"}
    res_notif_dsn = client.get(f"{PREFIX}/notifikasi/", headers=headers_dsn)
    assert res_notif_dsn.status_code == 200
    notif_list_dsn = res_notif_dsn.json()
    assert len(notif_list_dsn) > 0
    assert any("mengajukan" in n["isi_notifikasi"] for n in notif_list_dsn)
    
    # 3. Dosen setujui surat (upload ttd)
    data_proses = {"status": SuratRekomendasiStatus.APPROVED.value}
    files_proses = {"file_signed": ("surat_ttd.pdf", b"ini surat bertanda tangan", "application/pdf")}
    
    res_proses = client.patch(f"{PREFIX}/surat-rekomendasi/{surat_id}/proses", data=data_proses, files=files_proses, headers=headers_dsn)
    assert res_proses.status_code == 200
    assert res_proses.json()["status_surat"] == SuratRekomendasiStatus.APPROVED.value
    assert "mock-supabase" in res_proses.json()["dokumen_surat"] 
    
    # 4. Verifikasi notifikasi di sisi Mahasiswa
    res_notif_mhs = client.get(f"{PREFIX}/notifikasi/", headers=headers_mhs)
    assert res_notif_mhs.status_code == 200
    notif_list_mhs = res_notif_mhs.json()
    assert any("DISETUJUI" in n["isi_notifikasi"] for n in notif_list_mhs)

def test_ajukan_surat_negative_not_mahasiswa(client, staff_token, dosen_id):
    """Staff tidak boleh mengajukan surat rekomendasi"""
    data = {"dosen_id": dosen_id}
    files = {"file": ("test.pdf", b"test content")}
    headers = {"Authorization": f"Bearer {staff_token}"}
    
    response = client.post(f"{PREFIX}/surat-rekomendasi/", data=data, files=files, headers=headers)
    assert response.status_code == 403

def test_proses_surat_negative_wrong_dosen(client, dosen_token, mahasiswa_token, setup_other_dosen):
    """Dosen A tidak boleh memproses surat yang ditujukan ke Dosen B"""
    other_dosen_token, other_dosen_id = setup_other_dosen
    
    # 1. Mahasiswa ajukan ke Dosen B
    data = {"dosen_id": other_dosen_id}
    files = {"file": ("draft.pdf", b"content")}
    headers_mhs = {"Authorization": f"Bearer {mahasiswa_token}"}
    res_ajukan = client.post(f"{PREFIX}/surat-rekomendasi/", data=data, files=files, headers=headers_mhs)
    surat_id = res_ajukan.json()["surat_id"]
    
    # 2. Dosen A mencoba proses (status DECLINED agar tidak butuh file_signed)
    headers_dsn_a = {"Authorization": f"Bearer {dosen_token}"}
    res_proses = client.patch(f"{PREFIX}/surat-rekomendasi/{surat_id}/proses", data={"status": SuratRekomendasiStatus.DECLINED.value}, headers=headers_dsn_a)
    assert res_proses.status_code == 404

@pytest.fixture
def setup_other_dosen(client):
    """Fixture untuk membuat dosen lain"""
    payload = {
        "nama": "Dosen Lain", "username": "dosen_lain", "email": "dosen_lain@apps.ipb.ac.id",
        "password": "password123", "role": UserRole.DOSEN.value, "nip": "199999999999999"
    }
    client.post(f"{PREFIX}/auth/register", json=payload)
    login_res = client.post(f"{PREFIX}/auth/login", data={"username": "dosen_lain", "password": "password123"})
    token = login_res.json()["access_token"]
    
    from jwt import decode
    from app.core.config import settings
    import hashlib
    
    def _get_key():
        secret_key = str(settings.SECRET_KEY)
        if len(secret_key.encode("utf-8")) < 32:
            return hashlib.sha256(secret_key.encode("utf-8")).hexdigest()
        return secret_key
        
    payload_jwt = decode(token, _get_key(), algorithms=["HS256"])
    return token, int(payload_jwt["id"])

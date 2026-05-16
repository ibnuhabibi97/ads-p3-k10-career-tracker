# Career Tracker - Sistem Informasi Magang IPB

Sistem Informasi berbasis API untuk manajemen pendaftaran, pelaporan, dan penilaian magang mahasiswa. Proyek ini dibangun menggunakan **FastAPI** dengan arsitektur berlapis (*Layered Architecture*) untuk memastikan kode yang bersih, mudah diuji, dan skalabel.

## 🚀 Fitur Utama
- **Autentikasi & Otorisasi**: Manajemen user (Mahasiswa, Dosen, Staff) menggunakan JWT (JSON Web Token) dengan Role-Based Access Control (RBAC).
- **Manajemen Lowongan**: Staff dapat mengelola (CRUD) lowongan magang yang tersedia.
- **Pendaftaran Magang**: Mahasiswa dapat melamar lowongan dengan mengunggah CV dan Surat Rekomendasi langsung ke cloud storage.
- **Logbook Magang**: Pencatatan kegiatan harian mahasiswa magang beserta dokumentasi pendukung.
- **Laporan Magang**: Mahasiswa mengunggah laporan akhir untuk dinilai oleh Dosen Pembimbing.
- **Surat Rekomendasi**: Alur pengajuan surat dari mahasiswa ke dosen, dengan sistem tanda tangan digital (upload ulang berkas bertandatangan) dan notifikasi ganda.
- **Cloud Storage Integration**: Integrasi dengan **Supabase Storage** untuk penyimpanan berkas dokumen secara aman dan terorganisir.

## 🏗️ Arsitektur Proyek
Aplikasi ini mengikuti pola arsitektur berlapis:
1.  **Routers**: Menangani HTTP Request, skema validasi (Pydantic), dan otorisasi level endpoint.
2.  **Services**: Berisi logika bisnis inti aplikasi dan koordinasi antar repositori.
3.  **Repositories**: Abstraksi akses database (SQLAlchemy) untuk operasi CRUD.
4.  **Models**: Definisi struktur tabel database.
5.  **Schemas**: Definisi kontrak data (Pydantic) untuk request dan response API.

## 🛠️ Daftar Endpoint API

### 🔐 Autentikasi (`/auth`)
- `POST /auth/register` - Mendaftarkan pengguna baru (Mahasiswa/Dosen/Staff).
- `POST /auth/login` - Mendapatkan token JWT.
- `POST /auth/change-password` - Mengganti password pengguna (Login required).
- `POST /auth/forgot-password` - Meminta reset password via email.
- `POST /auth/reset-password` - Reset password menggunakan token email.

### 💼 Lowongan Magang (`/lowongan`)
- `GET /lowongan/` - Melihat semua lowongan.
- `GET /lowongan/aktif` - Melihat lowongan yang belum melewati deadline.
- `GET /lowongan/search` - Mencari lowongan berdasarkan perusahaan atau judul.
- `GET /lowongan/{id}` - Detail lowongan.
- `POST /lowongan/` - Membuat lowongan baru (Staff only).
- `PUT /lowongan/{id}` - Update data lowongan (Staff only).
- `DELETE /lowongan/{id}` - Menghapus lowongan (Staff only).

### 📝 Pendaftaran (`/pendaftaran`)
- `POST /pendaftaran/` - Mendaftar lowongan with upload CV & Surat Rekomendasi (Mahasiswa only).
- `GET /pendaftaran/saya` - Melihat riwayat lamaran milik sendiri (Mahasiswa only).
- `PATCH /pendaftaran/{id}/status` - Memperbarui status seleksi lamaran (Staff only).

### 📔 Logbook Magang (`/logbook`)
- `POST /logbook/` - Membuat entri logbook harian beserta upload foto/file dokumentasi (Mahasiswa only).
- `GET /logbook/` - Melihat semua logbook.
- `GET /logbook/{id}` - Detail logbook.
- `GET /logbook/mahasiswa/{mahasiswa_id}` - Melihat semua logbook mahasiswa tertentu.
- `GET /logbook/laporan/{laporan_id}` - Melihat logbook yang terikat pada laporan tertentu.
- `PUT /logbook/{id}` - Update logbook (Hanya pemilik).
- `DELETE /logbook/{id}` - Hapus logbook (Hanya pemilik).

### 📄 Laporan Magang (`/laporan`)
- `POST /laporan/` - Mengunggah berkas laporan magang akhir (Mahasiswa only).
- `GET /laporan/` - Melihat semua daftar laporan.
- `GET /laporan/{id}` - Detail laporan.
- `GET /laporan/mahasiswa/{mahasiswa_id}` - Melihat laporan mahasiswa tertentu.
- `PATCH /laporan/{id}/nilai` - Memberikan nilai pada laporan (Dosen only).
- `PATCH /laporan/{id}/revisi-dosen` - Memberikan catatan revisi pada laporan (Dosen only).
- `DELETE /laporan/{id}` - Menghapus laporan (Hanya pemilik).

### ✉️ Surat Rekomendasi (`/surat-rekomendasi`)
- `POST /surat-rekomendasi/` - Mahasiswa mengajukan surat rekomendasi dengan upload draf (Mahasiswa only).
- `GET /surat-rekomendasi/mahasiswa/saya` - Melihat daftar pengajuan surat milik sendiri (Mahasiswa only).
- `GET /surat-rekomendasi/dosen/tinjauan` - Dosen melihat daftar permohonan surat yang masuk (Dosen only).
- `GET /surat-rekomendasi/{id}` - Detail surat rekomendasi.
- `PATCH /surat-rekomendasi/{id}/proses` - Dosen menyetujui (dengan upload surat bertanda tangan) atau menolak surat (Dosen only).

## 📁 Struktur Folder Supabase Storage
Penyimpanan berkas dikelompokkan secara rapi dalam bucket `lowongan-assets`:
- `laporan/`: Berkas laporan magang mahasiswa.
- `dokumentasi/`: Foto/berkas bukti kegiatan harian logbook.
- `pendaftaran/cv/`: Curriculum Vitae mahasiswa pelamar.
- `pendaftaran/surat_rekomendasi/`: Folder untuk draf dan surat rekomendasi final yang sudah ditandatangani.

## ⚙️ Cara Menjalankan
1.  **Clone Repository**.
2.  **Siapkan Virtual Environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # Linux/Mac
    ```
3.  **Instal Dependency**: `pip install -r backend/requirements.txt`
4.  **Konfigurasi Environment**: Buat file `backend/.env` (Gunakan `.env.example` sebagai referensi).
5.  **Migrasi Database**: `cd backend && alembic upgrade head`
6.  **Jalankan Server**: `uvicorn app.main:app --reload`

## 🧪 Pengujian
Jalankan perintah berikut untuk mengeksekusi suite pengujian:
```bash
cd backend
PYTHONPATH=. pytest
```

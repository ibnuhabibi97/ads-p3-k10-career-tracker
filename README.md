# Career Tracker - Sistem Informasi Magang IPB

Sistem Informasi berbasis API untuk manajemen pendaftaran, pelaporan, dan penilaian magang mahasiswa. Proyek ini dibangun menggunakan **FastAPI** dengan penekanan kuat pada prinsip **Pemrograman Berorientasi Objek (OOP)** dan **Arsitektur Berlapis** (*Layered Architecture*).

## 💎 Implementasi OOP
Proyek ini menerapkan prinsip-prinsip OOP untuk memastikan modularitas dan kemudahan pemeliharaan:
- **Inheritance (Pewarisan)**: Digunakan pada model `User` yang diturunkan menjadi `Mahasiswa`, `Dosen`, dan `Staff` menggunakan strategi *Joined Table Inheritance*.
- **Encapsulation (Enkapsulasi)**: Memisahkan logika akses data (Repository), logika bisnis (Service), dan logika presentasi (Router).
- **Polymorphism**: Penanganan tipe user yang berbeda melalui satu entitas base namun memiliki identitas unik masing-masing.
- **Abstraction**: Menggunakan layer repositori untuk menyembunyikan detail kompleksitas query database dari layer bisnis.

## 🏗️ Struktur Entitas (Entities)

### 1. User (Mahasiswa, Dosen, Staff)
Entitas utama pengelola akun dengan sistem otentikasi.
- **Atribut**: `user_id`, `nama`, `username`, `email`, `password`, `role` (Enum).
- **Sub-Atribut Mahasiswa**: `nim`, `fakultas`, `prodi`.
- **Sub-Atribut Dosen/Staff**: `nip`.
- **Method Utama**:
    - `registrasi_user()`: Melakukan validasi dan hashing password.
    - `login_user()`: Memverifikasi kredensial dan menghasilkan token JWT.
    - `ubah_password()`: Mengelola pembaruan keamanan akun.

### 2. Lowongan Magang
Informasi lowongan yang tersedia dari berbagai instansi.
- **Atribut**: `lowongan_id`, `perusahaan`, `judul_posisi`, `deskripsi`, `kualifikasi`, `deadline`, `is_active`.
- **Method Utama**:
    - `tambah_lowongan()`: Membuat entri lowongan baru.
    - `ambil_lowongan_aktif()`: Filter lowongan yang belum melewati deadline.

### 3. Pendaftaran
Relasi antara mahasiswa dengan lowongan yang dilamar.
- **Atribut**: `pendaftaran_id`, `mahasiswa_id`, `lowongan_id`, `dokumen_cv`, `dokumen_surat_rekomendasi`, `status_seleksi` (Enum).
- **Method Utama**:
    - `submit_pendaftaran()`: Mengelola pendaftaran dan mengirim notifikasi ke Staff.
    - `update_status_seleksi()`: Mengubah status pelamar dan memberi notifikasi ke Mahasiswa.

### 4. Logbook Magang
Catatan aktivitas harian mahasiswa selama periode magang.
- **Atribut**: `logbook_id`, `laporan_id`, `mahasiswa_id`, `dosen_id`, `tanggal_log`, `waktu_mulai`, `waktu_selesai`, `durasi_kegiatan`, `keterangan`, `dokumentasi` (URL).
- **Method Utama**:
    - `tambah_logbook()`: Mencatat kegiatan dan menghitung durasi secara otomatis.
    - `ambil_logbook_mahasiswa()`: Menampilkan riwayat aktivitas harian.

### 5. Laporan Magang
Berkas laporan akhir hasil pelaksanaan magang.
- **Atribut**: `laporan_id`, `mahasiswa_id`, `dosen_id`, `status` (Enum), `nilai`, `catatan`, `dokumen_laporan`.
- **Method Utama**:
    - `tambah_laporan()`: Mahasiswa mengunggah file laporan akhir.
    - `ubah_nilai_laporan()`: Dosen memberikan feedback, nilai, dan notifikasi.

### 6. Surat Rekomendasi
Alur permohonan tanda tangan dokumen antara mahasiswa dan dosen.
- **Atribut**: `surat_id`, `mahasiswa_id`, `dosen_id`, `dokumen_surat`, `status_surat` (Enum).
- **Method Utama**:
    - `ajukan_surat()`: Upload draf awal dan notifikasi ke Dosen.
    - `proses_surat_oleh_dosen()`: Upload surat bertandatangan dan notifikasi ke Mahasiswa.

## 🛠️ Daftar Endpoint API
*(Lihat dokumentasi API lengkap melalui `/docs` saat server berjalan)*

- `/auth`: Registrasi, Login, Reset Password.
- `/lowongan`: Manajemen lowongan magang.
- `/pendaftaran`: Alur lamaran magang dan upload CV.
- `/logbook`: Pencatatan kegiatan harian.
- `/laporan`: Unggah laporan akhir dan penilaian.
- `/surat-rekomendasi`: Alur permohonan tanda tangan dosen.
- `/notifikasi`: Manajemen pemberitahuan user.

## 📁 Cloud Storage Integration (Supabase)
Penyimpanan berkas dikelompokkan secara rapi:
- `laporan/`: Berkas laporan akhir.
- `dokumentasi/`: Berkas pendukung logbook.
- `pendaftaran/cv/`: Curriculum Vitae.
- `pendaftaran/surat_rekomendasi/`: Berkas syarat pendaftaran.
- `surat_rekomendasi/`: Berkas draf dan hasil TTD dosen.

## ⚙️ Cara Menjalankan
1.  **Instal Dependency**: `pip install -r backend/requirements.txt`
2.  **Konfigurasi Environment**: Isi file `backend/.env` dengan kredensial DB, JWT, SMTP, dan Supabase.
3.  **Migrasi Database**: `cd backend && alembic upgrade head`
4.  **Jalankan Server**: `uvicorn app.main:app --reload`

## 🧪 Pengujian
```bash
cd backend && PYTHONPATH=. pytest
```

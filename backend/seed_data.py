import os
import sys
from datetime import datetime, date, timedelta
import random

# Menambahkan root folder backend ke sys.path agar module app bisa diimport
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models import Base, User, Mahasiswa, Dosen, Staff, Lowongan, Pendaftaran, Laporan, Logbook, SuratRekomendasi, Notifikasi
from app.core.security import get_password_hash
from app.schemas.laporan_schema import LaporanStatus
from app.schemas.rekomendasi_schemas import SuratRekomendasiStatus
from app.schemas.pendaftaran_schemas import PendaftaranStatus

def seed_data():
    db: Session = SessionLocal()
    
    print("--- Memulai proses Seeding Data Lengkap ---")
    
    try:
        # 1. Buat Dummy Staff (5 orang)
        staffs = []
        for i in range(1, 6):
            username = f"staff_{i}"
            nip = f"19700101199501100{i}"
            user = db.query(Staff).filter((User.username == username) | (Staff.nip == nip)).first()
            if not user:
                user = Staff(
                    nama=f"Staff Akademik {i}",
                    username=username,
                    email=f"ibnuteladan24{i}@gmail.com",
                    password=get_password_hash("password123"),
                    role="staff",
                    nip=nip
                )
                db.add(user)
                staffs.append(user)
            else:
                staffs.append(user)
        print(f"Berhasil menyiapkan {len(staffs)} Staff.")

        # 2. Buat Dummy Dosen (5 orang)
        dosens = []
        dosen_names = [
            "Dr. Ahmad Suryadi, M.Kom",
            "Prof. Siti Aminah, M.T.",
            "Budi Hermawan, S.T., M.Sc.",
            "Dr. Diana Lestari",
            "Indra Wijaya, Ph.D"
        ]
        for i, name in enumerate(dosen_names, 1):
            username = f"dosen_{i}"
            nip = f"19850101201012100{i}"
            user = db.query(Dosen).filter((User.username == username) | (Dosen.nip == nip)).first()
            if not user:
                user = Dosen(
                    nama=name,
                    username=username,
                    email=f"burhanudinibnu562{i}@gmail.com",
                    password=get_password_hash("password123"),
                    role="dosen",
                    nip=nip
                )
                db.add(user)
                dosens.append(user)
            else:
                dosens.append(user)
        print(f"Berhasil menyiapkan {len(dosens)} Dosen.")

        db.flush()

        # 3. Buat Dummy Mahasiswa (5 orang)
        mahasiswas = []
        mhs_names = [
            ("Rizki Pratama", "G6401211001"),
            ("Aulia Salsabila", "G6401211002"),
            ("Fajar Nugraha", "G6401211003"),
            ("Siti Khodijah", "G6401211004"),
            ("Bambang Susanto", "G6401211005")
        ]
        for i, (name, nim) in enumerate(mhs_names, 1):
            username = f"mhs_{i}"
            user = db.query(Mahasiswa).filter((User.username == username) | (Mahasiswa.nim == nim)).first()
            if not user:
                user = Mahasiswa(
                    nama=name,
                    username=username,
                    email=f"ibnuhsbibi{i}@gmail.com",
                    password=get_password_hash("password123"),
                    role="mahasiswa",
                    nim=nim,
                    prodi="Ilmu Komputer",
                    fakultas="FMIPA",
                    dosen_pembimbing_id=dosens[i-1].user_id # Setiap mhs punya dosen pembimbing unik dari list
                )
                db.add(user)
                mahasiswas.append(user)
            else:
                mahasiswas.append(user)
        print(f"Sedang memproses {len(mahasiswas)} Mahasiswa...")

        db.flush()

        # 4. Buat Lowongan (5 lowongan)
        lowongans = []
        jobs = [
            ("Frontend Developer Intern", "PT Tech Indonesia", "Membantu pengembangan UI website menggunakan React."),
            ("Backend Engineer Trainee", "Data Solutions Co.", "Membangun API menggunakan FastAPI dan PostgreSQL."),
            ("UI/UX Designer Apprentice", "Creative Studio", "Mendesain user flow dan wireframe aplikasi mobile."),
            ("QA Automation Intern", "Fintech Guard", "Menulis test script menggunakan Selenium atau Pytest."),
            ("Cyber Security Junior", "Security Ops", "Membantu monitoring ancaman keamanan jaringan.")
        ]
        for title, company, desc in jobs:
            lowongan = db.query(Lowongan).filter(Lowongan.judul_posisi == title, Lowongan.perusahaan == company).first()
            if not lowongan:
                lowongan = Lowongan(
                    perusahaan=company,
                    judul_posisi=title,
                    deskripsi_pekerjaan=desc,
                    kualifikasi=["Mahasiswa Informatika/SI", "Memiliki laptop pribadi", "Siap bekerja remote"],
                    deadline=date.today() + timedelta(days=random.randint(15, 60)),
                    is_active=True
                )
                db.add(lowongan)
                lowongans.append(lowongan)
            else:
                lowongans.append(lowongan)
        print(f"Sedang memproses {len(lowongans)} Lowongan...")

        db.flush()

        # 5. Buat Pendaftaran (Minimal 5, variasi status)
        pendaftarans = []
        statuses = [PendaftaranStatus.ACCEPTED, PendaftaranStatus.ACCEPTED, PendaftaranStatus.PENDING, PendaftaranStatus.REJECTED, PendaftaranStatus.PENDING]
        
        for i in range(5):
            mhs = mahasiswas[i]
            lowongan = lowongans[i]
            existing = db.query(Pendaftaran).filter(Pendaftaran.mahasiswa_id == mhs.user_id, Pendaftaran.lowongan_id == lowongan.lowongan_id).first()
            if not existing:
                pendaftaran = Pendaftaran(
                    mahasiswa_id=mhs.user_id,
                    lowongan_id=lowongan.lowongan_id,
                    status_seleksi=statuses[i],
                    dokumen_cv=f"https://bieizpbunvujqqpfzfpd.supabase.co/storage/v1/object/public/pendaftaran/cv/sample.pdf",
                    dokumen_surat_rekomendasi=f"https://bieizpbunvujqqpfzfpd.supabase.co/storage/v1/object/public/pendaftaran/surat_rekomendasi/sample.pdf",
                    tanggal_daftar=datetime.now() - timedelta(days=random.randint(1, 10))
                )
                db.add(pendaftaran)
                pendaftarans.append(pendaftaran)
            else:
                pendaftarans.append(existing)
        print(f"Sedang memproses {len(pendaftarans)} Pendaftaran...")

        db.flush()

        # 6. Buat Laporan untuk Mahasiswa yang Diterima (Minimal 5 instance Laporan)
        laporans = []
        for i in range(5):
            mhs = mahasiswas[i]
            lowongan = lowongans[i]
            
            # Pastikan pendaftaran statusnya ACCEPTED
            pendaftaran = db.query(Pendaftaran).filter(Pendaftaran.mahasiswa_id == mhs.user_id, Pendaftaran.lowongan_id == lowongan.lowongan_id).first()
            if pendaftaran:
                pendaftaran.status_seleksi = PendaftaranStatus.ACCEPTED
            
            existing_laporan = db.query(Laporan).filter(Laporan.mahasiswa_id == mhs.user_id).first()
            if not existing_laporan:
                laporan = Laporan(
                    mahasiswa_id=mhs.user_id,
                    lowongan_id=lowongan.lowongan_id,
                    dosen_id=mhs.dosen_pembimbing_id,
                    status=LaporanStatus.PENDING,
                    tanggal_lapor=date.today() - timedelta(days=5)
                )
                db.add(laporan)
                laporans.append(laporan)
            else:
                laporans.append(existing_laporan)
        print(f"Sedang memproses {len(laporans)} Laporan Magang...")

        db.flush()

        # 7. Buat Logbook untuk setiap laporan (5 entri per laporan)
        logbook_count = 0
        for laporan in laporans:
            existing_logs = db.query(Logbook).filter(Logbook.laporan_id == laporan.laporan_id).count()
            if existing_logs < 5:
                for j in range(1, 6):
                    log_date = date.today() - timedelta(days=j)
                    log = Logbook(
                        laporan_id=laporan.laporan_id,
                        mahasiswa_id=laporan.mahasiswa_id,
                        dosen_id=laporan.dosen_id,
                        tanggal_log=log_date,
                        waktu_mulai=datetime.combine(log_date, datetime.min.time()) + timedelta(hours=8),
                        waktu_selesai=datetime.combine(log_date, datetime.min.time()) + timedelta(hours=17),
                        keterangan=f"Melaksanakan tugas harian hari ke-{j} mengenai proyek intern.",
                        jenis_kegiatan="Berita Acara Kegiatan",
                        media="Zoom/Offline"
                    )
                    db.add(log)
                    logbook_count += 1
        print(f"Berhasil menambahkan {logbook_count} entri Logbook baru.")

        # 8. Buat Surat Rekomendasi (5 instance)
        rek_count = 0
        for i in range(5):
            mhs = mahasiswas[i]
            existing = db.query(SuratRekomendasi).filter(SuratRekomendasi.mahasiswa_id == mhs.user_id).first()
            if not existing:
                rek = SuratRekomendasi(
                    mahasiswa_id=mhs.user_id,
                    dosen_id=mhs.dosen_pembimbing_id,
                    dokumen_surat=f"https://bieizpbunvujqqpfzfpd.supabase.co/storage/v1/object/public/surat_rekomendasi/sample.pdf",
                    status_surat=random.choice(list(SuratRekomendasiStatus)),
                    tanggal_pengajuan=date.today() - timedelta(days=2)
                )
                db.add(rek)
                rek_count += 1
        print(f"Berhasil menambahkan {rek_count} Surat Rekomendasi.")

        # 9. Buat Notifikasi dummy (3 per mahasiswa)
        notif_count = 0
        for mhs in mahasiswas:
            existing_notif = db.query(Notifikasi).filter(Notifikasi.user_id == mhs.user_id).count()
            if existing_notif < 3:
                for k in range(3):
                    notif = Notifikasi(
                        user_id=mhs.user_id,
                        isi_notifikasi=f"Pesan sistem penting #{k+1} untuk Anda.",
                        is_read=False
                    )
                    db.add(notif)
                    notif_count += 1
        print(f"Berhasil menambahkan {notif_count} Notifikasi dummy.")

        db.commit()
        print("\n--- Seeding Data SELESAI Berhasil ---")
        print(f"Total Users: {db.query(User).count()}")
        print(f"Total Lowongan: {db.query(Lowongan).count()}")
        print(f"Total Pendaftaran: {db.query(Pendaftaran).count()}")
        print(f"Total Laporan: {db.query(Laporan).count()}")
        print(f"Total Logbook: {db.query(Logbook).count()}")

    except Exception as e:
        db.rollback()
        print(f"--- Seeding GAGAL: {e} ---")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    # Base.metadata.create_all(bind=engine)
    seed_data()

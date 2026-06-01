from datetime import date
from fastapi import HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.repositories.pendaftaran_repository import PendaftaranRepository
from app.repositories.notifikasi_repository import NotifikasiRepository
from app.repositories.user_repository import UserRepository
from app.repositories.lowongan_repository import LowonganRepository
from app.schemas.pendaftaran_schemas import PendaftaranCreate, PendaftaranUpdate, PendaftaranStatus
from app.services.email_service import kirim_email_notifikasi
from app.services.laporan_service import LaporanService

class PendaftaranService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PendaftaranRepository(db)
        self.lowongan_repo = LowonganRepository(db)
        self.notif_repo = NotifikasiRepository(db)
        self.user_repo = UserRepository(db)
        self.laporan_service = LaporanService(db)

    async def submit_pendaftaran(self, pendaftaran_data: PendaftaranCreate, mahasiswa_id: int, background_tasks: BackgroundTasks):
        # 1. Cek validitas lowongan (aktif & belum deadline)
        lowongan = self.lowongan_repo.get_by_id(pendaftaran_data.lowongan_id)
        if not lowongan or not lowongan.is_active or lowongan.deadline < date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lowongan ini sudah tidak aktif atau telah melewati batas waktu pendaftaran."
            )

        # 2. Cek apakah mahasiswa sudah mendaftar di lowongan ini
        sudah_daftar = self.repo.cek_pendaftaran_ada(mahasiswa_id, pendaftaran_data.lowongan_id)
        if sudah_daftar:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Anda sudah mendaftar di lowongan ini dan tidak dapat mengubah data."
            )
        
        # 3. Susun data untuk disimpan
        data_dict = pendaftaran_data.model_dump()
        data_dict["mahasiswa_id"] = mahasiswa_id
        data_dict["status_seleksi"] = PendaftaranStatus.PENDING
        
        db_pendaftaran = self.repo.create(data_dict)

        # --- NOTIFIKASI KE STAFF ---
        mahasiswa = self.user_repo.get_by_id(mahasiswa_id)
        all_staff = self.user_repo.get_all_staff()
        
        if mahasiswa:
            for staff in all_staff:
                # 1. Notifikasi sistem
                self.notif_repo.create({
                    "user_id": staff.user_id,
                    "isi_notifikasi": f"Mahasiswa {mahasiswa.nama} mendaftar pada lowongan baru.",
                    "target_url": f"/staff/pendaftaran/{db_pendaftaran.pendaftaran_id}"
                })

                # 2. Email ke staff (BackgroundTasks)
                pesan_email = f"""
                <html>
                <body>
                    <h3>Notifikasi Pendaftaran Magang Baru</h3>
                    <p>Halo {staff.nama},</p>
                    <p>Mahasiswa <b>{mahasiswa.nama}</b> telah mendaftar pada salah satu lowongan magang.</p>
                    <p>Silakan tinjau berkas pendaftaran di sistem.</p>
                </body>
                </html>
                """
                background_tasks.add_task(kirim_email_notifikasi, staff.email, "Pendaftaran Magang Baru", pesan_email)

        return db_pendaftaran

    async def update_status_seleksi(self, pendaftaran_id: int, status_baru: PendaftaranStatus, background_tasks: BackgroundTasks):
        # Cari data pendaftaran
        db_pendaftaran = self.repo.get_by_id(pendaftaran_id)
        if not db_pendaftaran:
            raise HTTPException(status_code=404, detail="Data pendaftaran tidak ditemukan")

        # Update hanya field status_seleksi
        update_data = {"status_seleksi": status_baru}
        updated = self.repo.update(pendaftaran_id, update_data)

        # --- INISIALISASI LAPORAN & LOGBOOK JIKA DITERIMA ---
        if status_baru == PendaftaranStatus.ACCEPTED:
            try:
                self.laporan_service.inisialisasi_laporan(
                    mahasiswa_id=db_pendaftaran.mahasiswa_id,
                    lowongan_id=db_pendaftaran.lowongan_id
                )
            except Exception as e:
                print(f"Gagal inisialisasi laporan: {e}")

        # --- NOTIFIKASI KE MAHASISWA ---
        mahasiswa = self.user_repo.get_by_id(db_pendaftaran.mahasiswa_id)
        if mahasiswa:
            status_label = status_baru.value
            self.notif_repo.create({
                "user_id": mahasiswa.user_id,
                "isi_notifikasi": f"Status pendaftaran magang Anda telah diperbarui menjadi: {status_label}.",
                "target_url": "/mahasiswa/pendaftaran/saya"
            })

            pesan_email = f"""
            <html>
            <body>
                <h3>Update Status Pendaftaran Magang</h3>
                <p>Halo {mahasiswa.nama},</p>
                <p>Status lamaran magang Anda telah diperbarui oleh Staff HR.</p>
                <p>Status Terbaru: <b>{status_label}</b></p>
                <p>Silakan cek detailnya di sistem.</p>
            </body>
            </html>
            """
            background_tasks.add_task(kirim_email_notifikasi, mahasiswa.email, "Update Status Pendaftaran Magang", pesan_email)

        return updated

    def ambil_riwayat_mahasiswa(self, mahasiswa_id: int):
        return self.repo.get_by_mahasiswa(mahasiswa_id)

    def ambil_semua_pendaftaran(self):
        """Staff melihat semua lamaran yang masuk."""
        return self.repo.get_all()

    def ambil_pendaftaran_by_lowongan(self, lowongan_id: int):
        """Staff melihat lamaran khusus pada lowongan tertentu."""
        return self.repo.get_by_lowongan(lowongan_id)

    def ambil_detail_pendaftaran(self, pendaftaran_id: int):
        """Mengambil detail pendaftaran berdasarkan ID."""
        db_pendaftaran = self.repo.get_by_id(pendaftaran_id)
        if not db_pendaftaran:
            raise HTTPException(status_code=404, detail="Data pendaftaran tidak ditemukan")
        return db_pendaftaran

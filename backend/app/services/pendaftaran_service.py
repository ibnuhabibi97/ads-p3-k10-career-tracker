from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.pendaftaran_repository import PendaftaranRepository
from app.repositories.notifikasi_repository import NotifikasiRepository
from app.repositories.user_repository import UserRepository
from app.schemas.pendaftaran_schemas import PendaftaranCreate, PendaftaranUpdate, PendaftaranStatus
from app.services.email_service import kirim_email_notifikasi

class PendaftaranService:
    def __init__(self, db: Session):
        self.repo = PendaftaranRepository(db)
        self.notif_repo = NotifikasiRepository(db)
        self.user_repo = UserRepository(db)

    async def submit_pendaftaran(self, pendaftaran_data: PendaftaranCreate, mahasiswa_id: int):
        # Cek apakah mahasiswa sudah mendaftar di lowongan ini
        sudah_daftar = self.repo.cek_pendaftaran_ada(mahasiswa_id, pendaftaran_data.lowongan_id)
        if sudah_daftar:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Anda sudah mendaftar di lowongan ini dan tidak dapat mengubah data."
            )
        
        # Susun data untuk disimpan
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

                # 2. Email ke staff
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
                try:
                    await kirim_email_notifikasi(staff.email, "Pendaftaran Magang Baru", pesan_email)
                except Exception as e:
                    print(f"Gagal kirim email ke staff {staff.email}: {e}")

        return db_pendaftaran

    async def update_status_seleksi(self, pendaftaran_id: int, status_baru: PendaftaranStatus):
        # Cari data pendaftaran
        db_pendaftaran = self.repo.get_by_id(pendaftaran_id)
        if not db_pendaftaran:
            raise HTTPException(status_code=404, detail="Data pendaftaran tidak ditemukan")

        # Update hanya field status_seleksi
        update_data = {"status_seleksi": status_baru}
        updated = self.repo.update(pendaftaran_id, update_data)

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
            try:
                await kirim_email_notifikasi(mahasiswa.email, "Update Status Pendaftaran Magang", pesan_email)
            except Exception as e:
                print(f"Gagal kirim email ke mahasiswa {mahasiswa.email}: {e}")

        return updated

    def ambil_riwayat_mahasiswa(self, mahasiswa_id: int):
        return self.repo.get_by_mahasiswa(mahasiswa_id)

from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
from app.repositories.rekomendasi_repository import SuratRekomendasiRepository
from app.repositories.notifikasi_repository import NotifikasiRepository
from app.repositories.user_repository import UserRepository
from app.schemas.rekomendasi_schemas import SuratRekomendasiCreate, SuratRekomendasiUpdate, SuratRekomendasiStatus
from app.services.email_service import kirim_email_notifikasi

class SuratRekomendasiService:
    def __init__(self, db: Session):
        self.repo = SuratRekomendasiRepository(db)
        self.notif_repo = NotifikasiRepository(db)
        self.user_repo = UserRepository(db)

    async def ajukan_surat(self, data: SuratRekomendasiCreate, mahasiswa_id: int, public_url: str, background_tasks: BackgroundTasks):
        """
        Alur: Mahasiswa upload surat -> sistem notif ke dosen (sistem + email)
        """
        # 1. Ambil data dosen pembimbing default jika tidak dikirim dari FE
        dosen_id = data.dosen_id
        if not dosen_id:
            mahasiswa = self.user_repo.get_by_id(mahasiswa_id)
            dosen_id = getattr(mahasiswa, 'dosen_pembimbing_id', None)
            
        if not dosen_id:
            raise HTTPException(status_code=400, detail="Dosen pembimbing belum ditentukan untuk profil Anda.")

        # 2. Simpan data surat
        data_dict = {
            "mahasiswa_id": mahasiswa_id,
            "dosen_id": dosen_id,
            "dokumen_surat": public_url,
            "status_surat": SuratRekomendasiStatus.PENDING
        }
        db_surat = self.repo.create(data_dict)

        # 3. Ambil data dosen & mahasiswa untuk notifikasi
        dosen = self.user_repo.get_by_id(dosen_id)
        mahasiswa = self.user_repo.get_by_id(mahasiswa_id)

        if dosen:
            # 4. Kirim notifikasi sistem ke dosen
            self.notif_repo.create({
                "user_id": dosen.user_id,
                "isi_notifikasi": f"Mahasiswa {mahasiswa.nama} mengajukan permohonan surat rekomendasi.",
                "target_url": f"/dosen/surat-rekomendasi/{db_surat.surat_id}"
            })

            # 5. Kirim email ke dosen (BackgroundTasks)
            pesan_email = f"""
            <html>
            <body>
                <h3>Permohonan Surat Rekomendasi Baru</h3>
                <p>Halo {dosen.nama},</p>
                <p>Mahasiswa <b>{mahasiswa.nama}</b> telah mengajukan permohonan surat rekomendasi.</p>
                <p>Silakan login ke sistem untuk meninjau dan menandatangani dokumen tersebut.</p>
            </body>
            </html>
            """
            background_tasks.add_task(kirim_email_notifikasi, dosen.email, "Permohonan Surat Rekomendasi Baru", pesan_email)

        return db_surat

    async def proses_surat_oleh_dosen(self, surat_id: int, status: SuratRekomendasiStatus, dosen_id: int, signed_url: str = None, background_tasks: BackgroundTasks = None):
        """
        Alur: Dosen tolak/setujui surat -> jika setuju upload surat bertanda tangan -> notif ke mahasiswa
        """
        db_surat = self.repo.get_by_id(surat_id)
        if not db_surat or db_surat.dosen_id != dosen_id:
            raise HTTPException(status_code=404, detail="Data surat tidak ditemukan atau Anda tidak memiliki akses.")

        # Update data surat
        update_data = {"status_surat": status}
        if signed_url:
            update_data["dokumen_surat"] = signed_url
        
        updated_surat = self.repo.update(surat_id, update_data)

        # Notifikasi ke mahasiswa
        mahasiswa = self.user_repo.get_by_id(db_surat.mahasiswa_id)
        dosen = self.user_repo.get_by_id(dosen_id)

        if mahasiswa:
            status_teks = "DISETUJUI" if status == SuratRekomendasiStatus.APPROVED else "DITOLAK"
            # 1. Notifikasi sistem
            self.notif_repo.create({
                "user_id": mahasiswa.user_id,
                "isi_notifikasi": f"Permohonan surat rekomendasi Anda telah {status_teks} oleh {dosen.nama}.",
                "target_url": "/mahasiswa/surat-rekomendasi"
            })

            # 2. Email ke mahasiswa (BackgroundTasks)
            pesan_email = f"""
            <html>
            <body>
                <h3>Update Status Surat Rekomendasi</h3>
                <p>Halo {mahasiswa.nama},</p>
                <p>Permohonan surat rekomendasi Anda telah <b>{status_teks}</b> oleh dosen pembimbing <b>{dosen.nama}</b>.</p>
                {"<p>Silakan download surat yang telah ditandatangani di aplikasi.</p>" if status == SuratRekomendasiStatus.APPROVED else ""}
            </body>
            </html>
            """
            if background_tasks:
                background_tasks.add_task(kirim_email_notifikasi, mahasiswa.email, f"Surat Rekomendasi {status_teks}", pesan_email)
            else:
                try:
                    await kirim_email_notifikasi(mahasiswa.email, f"Surat Rekomendasi {status_teks}", pesan_email)
                except Exception as e:
                    print(f"Gagal kirim email: {e}")

        return updated_surat

    def ambil_surat_mahasiswa(self, mahasiswa_id: int):
        return self.repo.get_by_mahasiswa(mahasiswa_id)

    def ambil_surat_dosen(self, dosen_id: int):
        return self.repo.get_by_dosen(dosen_id)

    def ambil_detail_surat(self, surat_id: int, user_id: int):
        surat = self.repo.get_by_id(surat_id)
        if not surat:
            raise HTTPException(status_code=404, detail="Data surat tidak ditemukan")
            
        if (surat.mahasiswa_id != user_id and surat.dosen_id != user_id):
             raise HTTPException(status_code=403, detail="Akses ditolak.")
        return surat

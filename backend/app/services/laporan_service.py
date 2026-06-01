from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
import datetime
from app.repositories.laporan_repository import LaporanRepository
from app.repositories.logbook_repository import LogbookRepository
from app.repositories.notifikasi_repository import NotifikasiRepository
from app.repositories.user_repository import UserRepository
from app.schemas.laporan_schema import LaporanCreate, LaporanUpdate, LaporanStatus
from app.schemas.laporan_dosen_schema import LaporanPenilaianUpdate, LaporanRevisiDosenUpdate
from app.services.email_service import kirim_email_notifikasi
from app.models.laporan import Laporan
from app.models.logbook import Logbook

class LaporanService:
    def __init__(self, db: Session):
        self.repo = LaporanRepository(db)
        self.logbook_repo = LogbookRepository(db)
        self.notif_repo = NotifikasiRepository(db)
        self.user_repo = UserRepository(db)

    def ambil_semua_laporan(self):
        """Ambil semua laporan"""
        return self.repo.get_all()

    def ambil_laporan_by_id(self, laporan_id: int):
        """Ambil laporan berdasarkan ID"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan tidak ditemukan")
        return laporan

    def ambil_laporan_mahasiswa(self, mahasiswa_id: int):
        """Ambil semua laporan milik mahasiswa tertentu"""
        return self.repo.get_by_mahasiswa_id(mahasiswa_id)

    def ambil_laporan_pending(self):
        """Ambil semua laporan yang masih pending (belum dinilai)"""
        return self.repo.get_pending_laporan()

    def ambil_laporan_by_status(self, status: str):
        """Ambil laporan berdasarkan status"""
        return self.repo.get_by_status(status)

    def ambil_laporan_dosen(self, dosen_id: int):
        """Ambil semua laporan yang dinilai oleh dosen tertentu"""
        return self.repo.get_by_dosen_id(dosen_id)

    def inisialisasi_laporan(self, mahasiswa_id: int, lowongan_id: int):
        """Inisialisasi laporan (Internship Record) dan Logbook kosong saat diterima."""
        # 1. Cek apakah sudah ada
        laporan_ada = self.repo.db.query(Laporan).filter(
            Laporan.mahasiswa_id == mahasiswa_id,
            Laporan.lowongan_id == lowongan_id
        ).first()
        
        if laporan_ada:
            return laporan_ada

        # 2. Ambil data mahasiswa untuk mendapatkan dosen pembimbing default
        mahasiswa = self.user_repo.get_by_id(mahasiswa_id)
        dosen_id = getattr(mahasiswa, 'dosen_pembimbing_id', None)

        # 3. Buat Laporan
        laporan_data = {
            "mahasiswa_id": mahasiswa_id,
            "lowongan_id": lowongan_id,
            "dosen_id": dosen_id,
            "status": LaporanStatus.ONGOING
        }
        db_laporan = self.repo.create(laporan_data)

        # 4. Buat Logbook kosong secara batch (misal 30 hari ke depan)
        today = datetime.date.today()
        logbooks_to_add = []
        for i in range(30):
            log_date = today + datetime.timedelta(days=i)
            logbooks_to_add.append(Logbook(
                laporan_id=db_laporan.laporan_id,
                mahasiswa_id=mahasiswa_id,
                dosen_id=dosen_id,
                tanggal_log=log_date,
                keterangan="",
                jenis_kegiatan=""
            ))
        
        self.repo.db.add_all(logbooks_to_add)
        self.repo.db.commit()
        
        return db_laporan

    def tambah_laporan(self, data: LaporanCreate, user_id: int):
        """Buat laporan baru"""
        data_dict = data.model_dump()
        data_dict["mahasiswa_id"] = user_id # Enforce user_id dari token
        data_dict["status"] = LaporanStatus.PENDING
        return self.repo.create(data_dict)

    def ubah_laporan(self, laporan_id: int, data: LaporanUpdate, user_id: int):
        """Update laporan oleh mahasiswa (hanya dokumen)"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan gagal diubah karena tidak ditemukan")
            
        if laporan.mahasiswa_id != user_id:
            raise HTTPException(status_code=403, detail="Akses ditolak. Anda bukan pemilik laporan ini.")
            
        return self.repo.update(laporan_id, data.model_dump(exclude_unset=True))

    async def ubah_nilai_laporan(self, laporan_id: int, data: LaporanPenilaianUpdate, dosen_id: int, background_tasks: BackgroundTasks):
        """Update nilai laporan oleh dosen (dengan optional catatan)"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan tidak ditemukan")
        
        # Update dengan data penilaian
        update_data = {
            "nilai": data.nilai,
            "status": data.status, # Sekarang sudah Enum dari Schema
            "dosen_id": dosen_id
        }
        if data.catatan:
            update_data["catatan"] = data.catatan
            
        updated_laporan = self.repo.update(laporan_id, update_data)

        # --- NOTIFIKASI KE MAHASISWA ---
        mahasiswa = self.user_repo.get_by_id(laporan.mahasiswa_id)
        dosen = self.user_repo.get_by_id(dosen_id)

        if mahasiswa:
            # 1. Notifikasi sistem
            self.notif_repo.create({
                "user_id": mahasiswa.user_id,
                "isi_notifikasi": f"Laporan magang Anda telah dinilai oleh {dosen.nama} dengan nilai {data.nilai}.",
                "target_url": f"/mahasiswa/laporan/{laporan_id}"
            })

            # 2. Email ke mahasiswa (BackgroundTasks)
            pesan_email = f"""
            <html>
            <body>
                <h3>Hasil Penilaian Laporan Magang</h3>
                <p>Halo {mahasiswa.nama},</p>
                <p>Laporan magang Anda telah selesai dinilai oleh <b>{dosen.nama}</b>.</p>
                <p>Nilai: <b>{data.nilai}</b></p>
                <p>Status: <b>{data.status.value}</b></p>
                {f"<p>Catatan: {data.catatan}</p>" if data.catatan else ""}
                <p>Silakan cek detail penilaian di sistem.</p>
            </body>
            </html>
            """
            background_tasks.add_task(kirim_email_notifikasi, mahasiswa.email, "Hasil Penilaian Laporan Magang", pesan_email)

        return updated_laporan

    async def ubah_catatan_revisi_dosen(self, laporan_id: int, data: LaporanRevisiDosenUpdate, dosen_id: int, background_tasks: BackgroundTasks):
        """Update catatan revisi oleh dosen ketika menolak laporan"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan tidak ditemukan")
        
        # Update catatan dan status
        update_data = {
            "catatan": data.catatan,
            "status": data.status, # Sudah Enum
            "dosen_id": dosen_id
        }
        
        updated_laporan = self.repo.update(laporan_id, update_data)

        # --- NOTIFIKASI KE MAHASISWA ---
        mahasiswa = self.user_repo.get_by_id(laporan.mahasiswa_id)
        dosen = self.user_repo.get_by_id(dosen_id)

        if mahasiswa:
            self.notif_repo.create({
                "user_id": mahasiswa.user_id,
                "isi_notifikasi": f"Laporan magang Anda memerlukan revisi dari {dosen.nama}.",
                "target_url": f"/mahasiswa/laporan/{laporan_id}"
            })

            pesan_email = f"""
            <html>
            <body>
                <h3>Revisi Laporan Magang</h3>
                <p>Halo {mahasiswa.nama},</p>
                <p>Laporan magang Anda memerlukan revisi menurut dosen pembimbing <b>{dosen.nama}</b>.</p>
                <p>Catatan Revisi: <i>"{data.catatan}"</i></p>
                <p>Silakan segera lakukan perbaikan dan unggah kembali laporan Anda.</p>
            </body>
            </html>
            """
            background_tasks.add_task(kirim_email_notifikasi, mahasiswa.email, "Revisi Laporan Magang", pesan_email)

        return updated_laporan

    def hapus_laporan(self, laporan_id: int, user_id: int):
        """Hapus laporan"""
        laporan = self.repo.get_by_id(laporan_id)
        if not laporan:
            raise HTTPException(status_code=404, detail="Data laporan gagal dihapus karena tidak ditemukan")
            
        if laporan.mahasiswa_id != user_id:
            raise HTTPException(status_code=403, detail="Akses ditolak. Anda bukan pemilik laporan ini.")
            
        self.repo.delete(laporan_id)
        return {"message": "Data laporan berhasil dihapus"}

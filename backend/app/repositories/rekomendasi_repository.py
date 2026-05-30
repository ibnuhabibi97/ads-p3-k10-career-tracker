from sqlalchemy.orm import Session, joinedload
from app.models.surat_rekomendasi import SuratRekomendasi

class SuratRekomendasiRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data_dict: dict):
        db_surat = SuratRekomendasi(**data_dict)
        self.db.add(db_surat)
        self.db.commit()
        self.db.refresh(db_surat)
        return db_surat

    def get_by_id(self, surat_id: int):
        return self.db.query(SuratRekomendasi).options(
            joinedload(SuratRekomendasi.mahasiswa),
            joinedload(SuratRekomendasi.dosen)
        ).filter(SuratRekomendasi.surat_id == surat_id).first()

    def get_by_mahasiswa(self, mahasiswa_id: int):
        return self.db.query(SuratRekomendasi).options(
            joinedload(SuratRekomendasi.mahasiswa),
            joinedload(SuratRekomendasi.dosen)
        ).filter(SuratRekomendasi.mahasiswa_id == mahasiswa_id).all()

    def get_by_dosen(self, dosen_id: int):
        return self.db.query(SuratRekomendasi).options(
            joinedload(SuratRekomendasi.mahasiswa),
            joinedload(SuratRekomendasi.dosen)
        ).filter(SuratRekomendasi.dosen_id == dosen_id).all()

    def update(self, surat_id: int, update_data: dict):
        db_surat = self.get_by_id(surat_id)
        if db_surat:
            for key, value in update_data.items():
                setattr(db_surat, key, value)
            self.db.commit()
            self.db.refresh(db_surat)
        return db_surat

    def delete(self, surat_id: int):
        db_surat = self.get_by_id(surat_id)
        if db_surat:
            self.db.delete(db_surat)
            self.db.commit()
            return True
        return False

from sqlalchemy.orm import Session
from app.models.lowongan import Lowongan
from app.schemas.lowongan_schema import LowonganCreate

class LowonganRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Lowongan).all()

    def get_by_id(self, id_lowongan: int):
        return self.db.query(Lowongan).filter(Lowongan.id_lowongan == id_lowongan).first()

    def create(self, lowongan_data: LowonganCreate):
        db_lowongan = Lowongan(
            judul=lowongan_data.judul,
            deskripsi=lowongan_data.deskripsi,
            persyaratan=lowongan_data.persyaratan,
            deadline=lowongan_data.deadline,
            status=lowongan_data.status
        )
        self.db.add(db_lowongan)
        self.db.commit()
        self.db.refresh(db_lowongan)
        return db_lowongan

    def update(self, id_lowongan: int, lowongan_data: LowonganCreate):
        db_lowongan = self.get_by_id(id_lowongan)
        if db_lowongan:
            db_lowongan.judul = lowongan_data.judul
            db_lowongan.deskripsi = lowongan_data.deskripsi
            db_lowongan.persyaratan = lowongan_data.persyaratan
            db_lowongan.deadline = lowongan_data.deadline
            db_lowongan.status = lowongan_data.status
            self.db.commit()
            self.db.refresh(db_lowongan)
        return db_lowongan

    def delete(self, id_lowongan: int):
        db_lowongan = self.get_by_id(id_lowongan)
        if db_lowongan:
            self.db.delete(db_lowongan)
            self.db.commit()
            return True
        return False
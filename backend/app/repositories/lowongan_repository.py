from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.lowongan import Lowongan
from app.schemas.lowongan_schema import LowonganCreate, LowonganUpdate

class LowonganRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Lowongan).all()

    def get_active(self):
        return self.db.query(Lowongan).filter(Lowongan.is_active == True).all()

    def get_by_id(self, lowongan_id: int):
        return self.db.query(Lowongan).filter(Lowongan.lowongan_id == lowongan_id).first()

    def create(self, lowongan_data: LowonganCreate):
        # Menggunakan model_dump() agar tidak perlu mapping manual satu per satu
        db_lowongan = Lowongan(**lowongan_data.model_dump())
        self.db.add(db_lowongan)
        self.db.commit()
        self.db.refresh(db_lowongan)
        return db_lowongan
    
    def search(self, keyword: str):
        search_pattern = f"%{keyword}%"
        return self.db.query(Lowongan).filter(
            or_(
                Lowongan.judul_posisi.ilike(search_pattern),
                Lowongan.perusahaan.ilike(search_pattern)
            ),
            Lowongan.is_active == True # (Opsional) Hanya mencari lowongan yang masih aktif
        ).all()

    def update(self, lowongan_id: int, lowongan_data: LowonganUpdate):
        db_lowongan = self.get_by_id(lowongan_id)
        if db_lowongan:
            # exclude_unset=True memastikan hanya field yang dikirim user yang diupdate
            update_data = lowongan_data.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_lowongan, key, value)
                
            self.db.commit()
            self.db.refresh(db_lowongan)
        return db_lowongan

    def delete(self, lowongan_id: int):
        db_lowongan = self.get_by_id(lowongan_id)
        if db_lowongan:
            self.db.delete(db_lowongan)
            self.db.commit()
            return True
        return False
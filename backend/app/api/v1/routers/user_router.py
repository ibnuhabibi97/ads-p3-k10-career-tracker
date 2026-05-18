from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.repositories.user_repository import UserRepository
from app.db.database import get_db
from app.schemas.user_schema import DosenResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/dosen", response_model=List[DosenResponse])
def get_all_dosen(db: Session = Depends(get_db)):
    repo = UserRepository(db)
    return repo.get_all_dosen()

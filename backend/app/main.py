from fastapi import FastAPI
from app.api.v1.routers import lowongan_router
from app.db.database import engine
from app.models import Base
from app.api.v1.routers import auth_router
from app.api.v1.routers import pendaftaran_router


app = FastAPI(
    title="Sistem Informasi Magang IPB API",
    description="Backend service untuk sistem pendaftaran dan penilaian magang mahasiswa.",
    version="1.0.0"
)

# Mendaftarkan router
app.include_router(lowongan_router.router, prefix="/api/v1")
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(pendaftaran_router.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Selamat datang di API Sistem Informasi Magang"}
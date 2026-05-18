from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routers import lowongan_router, user_router, auth_router, pendaftaran_router, laporan_router, logbook_router, rekomendasi_router, notifikasi_router
from app.db.database import engine
from app.models import Base

app = FastAPI(
    title="Sistem Informasi Magang IPB API",
    description="Backend service untuk sistem pendaftaran dan penilaian magang mahasiswa.",
    version="1.0.0"
)

#Daftarkan CORSMiddleware 
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mendaftarkan router
app.include_router(lowongan_router.router, prefix="/api/v1")
app.include_router(user_router.router, prefix="/api/v1")
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(pendaftaran_router.router, prefix="/api/v1")
app.include_router(laporan_router.router, prefix="/api/v1")
app.include_router(logbook_router.router, prefix="/api/v1")
app.include_router(rekomendasi_router.router, prefix="/api/v1")
app.include_router(notifikasi_router.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Selamat datang di API Sistem Informasi Magang"}

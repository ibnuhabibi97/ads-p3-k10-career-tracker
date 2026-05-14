from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


#Daftarkan CORSMiddleware 
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Daftar origin yang diizinkan
    allow_credentials=True,      # Mengizinkan pengiriman kredensial (seperti cookies atau header Authorization HTTP)
    allow_methods=["*"],         # Mengizinkan semua HTTP Method (GET, POST, PUT, DELETE, PATCH, OPTIONS)
    allow_headers=["*"],         # Mengizinkan semua header
)

# Mendaftarkan router
app.include_router(lowongan_router.router, prefix="/api/v1")
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(pendaftaran_router.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Selamat datang di API Sistem Informasi Magang"}
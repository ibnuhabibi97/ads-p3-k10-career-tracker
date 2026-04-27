import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables from .env file
load_dotenv()

# Ambil variabel lingkungan untuk koneksi database
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DB")
DB_HOST = os.getenv("POSTGRES_HOST")
DB_PORT = os.getenv("POSTGRES_PORT")

# Format URL: postgresql://user:password@host:port/dbname
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Engine untuk berkomunikasi dengan database
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal akan digunakan untuk membuat instance koneksi di setiap request (Dependency Injection)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class yang akan diwarisi oleh semua model ORM kita
Base = declarative_base()

# Dependency untuk mendapatkan session database di FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
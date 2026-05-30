import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables from .env file
load_dotenv()

# Format URL: postgresql://user:password@host:port/dbname
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Engine untuk berkomunikasi dengan database
# pool_pre_ping=True membantu menangani koneksi yang terputus di serverless environments
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    # Supabase/Cloud DB biasanya butuh ini jika menggunakan pgbouncer atau SSL
    connect_args={"sslmode": "require"} if "localhost" not in SQLALCHEMY_DATABASE_URL else {}
)

# SessionLocal akan digunakan untuk membuat instance koneksi di setiap request (Dependency Injection)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency untuk mendapatkan session database di FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
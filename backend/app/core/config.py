from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    #Info Aplikasi
    PROJECT_NAME: str = "Sistem Informasi Magang IPB API"
    VERSION: str = "1.0.0"

    #Konfigurasi Database
    DATABASE_URL: str 

    #Konfigurasi Keamanan (JWT & Auth)
    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 # Waktu token kedaluwarsa (dalam menit)

    # --- Konfigurasi SMTP (Email) ---
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    
    # URL Frontend yang akan dituju saat link reset diklik
    FRONTEND_URL: str = "http://localhost:3000/reset-password"
    
    # Membaca variabel dari file .env secara otomatis
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        # Ignore extra variables di .env yang tidak didefinisikan di class ini
        extra="ignore" 
    )

# Membuat instance global agar bisa di-import oleh file lain (seperti UserService)
settings = Settings()
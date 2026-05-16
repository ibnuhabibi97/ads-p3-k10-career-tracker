from supabase import create_client, Client
from app.core.config import settings
import uuid
import logging

logger = logging.getLogger(__name__)

class SupabaseStorage:
    def __init__(self):
        try:
            # Menggunakan service_role key untuk bypass RLS pada upload jika diperlukan
            self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            self.bucket = settings.SUPABASE_BUCKET
        except Exception as e:
            logger.error(f"Gagal inisialisasi Supabase Client: {e}")
            self.client = None

    def upload(self, file_data: bytes, file_name: str, content_type: str, folder: str = "lowongan") -> str:
        """
        Upload file ke Supabase Storage dan mengembalikan Public URL.
        """
        if not self.client:
            raise Exception("Supabase client tidak terinisialisasi. Cek konfigurasi SUPABASE_URL dan SUPABASE_KEY.")

        # 1. Buat path unik: misal "lowongan/uuid.pdf"
        ext = file_name.split(".")[-1] if "." in file_name else ""
        path = f"{folder}/{uuid.uuid4()}{'.' + ext if ext else ''}"
        
        try:
            # 2. Eksekusi Upload
            self.client.storage.from_(self.bucket).upload(
                path=path,
                file=file_data,
                file_options={"content-type": content_type}
            )
            
            # 3. Ambil Public URL
            return self.client.storage.from_(self.bucket).get_public_url(path)
        except Exception as e:
            logger.error(f"Gagal upload file ke Supabase: {e}")
            raise e

# Instance global untuk digunakan di router/service
storage_client = SupabaseStorage()

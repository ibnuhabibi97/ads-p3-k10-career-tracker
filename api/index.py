import sys
import os

# Menemukan root folder proyek (career-tracker)
current_dir = os.path.dirname(__file__)
root_path = os.path.abspath(os.path.join(current_dir, ".."))
backend_path = os.path.join(root_path, "backend")

# Masukkan ke sys.path agar folder 'app' di dalam 'backend' bisa diimpor
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Impor instance FastAPI 'app' dari backend/app/main.py
try:
    from app.main import app
except ImportError as e:
    # Fallback jika struktur folder berbeda di environment tertentu
    sys.path.insert(0, os.path.join(backend_path, "app"))
    from main import app

# Vercel akan mencari variabel bernama 'app' di file ini

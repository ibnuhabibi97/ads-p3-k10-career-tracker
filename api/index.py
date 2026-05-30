import sys
import os

# Menambahkan folder backend ke sys.path secara absolut agar package 'app' bisa terbaca
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.append(backend_path)

from app.main import app

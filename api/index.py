import sys
import os

# Menambahkan folder backend ke sys.path agar package 'app' bisa terbaca
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app

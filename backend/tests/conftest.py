import sys
import os
import pytest

# Mengarahkan Python untuk melihat folder root 'backend'
# Ini memperbaiki ModuleNotFoundError: No module named 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture
def client():
    """Fixture untuk membuat test client FastAPI."""
    from fastapi.testclient import TestClient
    from app.main import app
    yield TestClient(app)
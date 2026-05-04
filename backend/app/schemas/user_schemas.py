from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional, Literal

# ==========================================
# 1. SCHEMAS UNTUK PARENT (USER)
# ==========================================

class UserBase(BaseModel):
    nama: str
    username: str
    email: EmailStr
    # 'role' tidak dimasukkan ke sini agar bisa di-override secara spesifik di child

class UserCreate(UserBase):
    password: str
    role: str # Untuk parent, role bisa apa saja

class UserUpdate(BaseModel):
    nama: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    # 'role' biasanya tidak diizinkan untuk di-update agar tidak merusak relasi polimorfik

class UserResponse(UserBase):
    user_id: int
    role: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 2. SCHEMAS UNTUK MAHASISWA
# ==========================================

class MahasiswaBase(UserBase):
    nim: str
    fakultas: str
    prodi: str

class MahasiswaCreate(MahasiswaBase):
    password: str
    # Mengunci role agar selalu "mahasiswa"
    role: Literal["mahasiswa"] = "mahasiswa"

class MahasiswaUpdate(UserUpdate):
    nim: Optional[str] = None
    fakultas: Optional[str] = None
    prodi: Optional[str] = None

class MahasiswaResponse(MahasiswaBase):
    user_id: int
    role: Literal["mahasiswa"]

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 3. SCHEMAS UNTUK DOSEN
# ==========================================

class DosenBase(UserBase):
    nip: str

class DosenCreate(DosenBase):
    password: str
    role: Literal["dosen"] = "dosen"

class DosenUpdate(UserUpdate):
    nip: Optional[str] = None

class DosenResponse(DosenBase):
    user_id: int
    role: Literal["dosen"]

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 4. SCHEMAS UNTUK STAFF
# ==========================================

class StaffBase(UserBase):
    nip: str

class StaffCreate(StaffBase):
    password: str
    role: Literal["staff"] = "staff"

class StaffUpdate(UserUpdate):
    nip: Optional[str] = None

class StaffResponse(StaffBase):
    user_id: int
    role: Literal["staff"]

    model_config = ConfigDict(from_attributes=True)
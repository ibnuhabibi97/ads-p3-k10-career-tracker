from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional, Literal
from enum import Enum

class UserRole(str, Enum):
    MAHASISWA = "mahasiswa"
    DOSEN = "dosen"
    STAFF = "staff"
    USER = "user" # Base role

# SCHEMAS UNTUK PARENT (USER)
class UserBase(BaseModel):
    nama: str
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: UserRole
    
    # TAMBAHAN: Field opsional agar data tidak dibuang oleh Pydantic
    # saat mendaftar lewat endpoint general /auth/register
    nim: Optional[str] = None
    fakultas: Optional[str] = None
    prodi: Optional[str] = None
    nip: Optional[str] = None

class UserUpdate(BaseModel):
    nama: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    # 'role' biasanya tidak diizinkan untuk di-update agar tidak merusak relasi polimorfik

class UserResponse(UserBase):
    user_id: int
    role: UserRole

    model_config = ConfigDict(from_attributes=True)


#SCHEMAS UNTUK MAHASISWA

class MahasiswaBase(UserBase):
    nim: str
    fakultas: str
    prodi: str

class MahasiswaCreate(MahasiswaBase):
    password: str
    # Mengunci role agar selalu "mahasiswa"
    role: UserRole = UserRole.MAHASISWA

class MahasiswaUpdate(UserUpdate):
    nim: Optional[str] = None
    fakultas: Optional[str] = None
    prodi: Optional[str] = None

class MahasiswaResponse(MahasiswaBase):
    user_id: int
    role: UserRole = UserRole.MAHASISWA

    model_config = ConfigDict(from_attributes=True)


# SCHEMAS UNTUK DOSEN

class DosenBase(UserBase):
    nip: str

class DosenCreate(DosenBase):
    password: str
    role: UserRole = UserRole.DOSEN

class DosenUpdate(UserUpdate):
    nip: Optional[str] = None

class DosenResponse(DosenBase):
    user_id: int
    role: UserRole = UserRole.DOSEN

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 4. SCHEMAS UNTUK STAFF
# ==========================================

class StaffBase(UserBase):
    nip: str

class StaffCreate(StaffBase):
    password: str
    role: UserRole = UserRole.STAFF

class StaffUpdate(UserUpdate):
    nip: Optional[str] = None

class StaffResponse(StaffBase):
    user_id: int
    role: UserRole = UserRole.STAFF

    model_config = ConfigDict(from_attributes=True)

#Schema untuk forget password
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    password_baru: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class ChangePasswordRequest(BaseModel):
    password_lama: str
    password_baru: str

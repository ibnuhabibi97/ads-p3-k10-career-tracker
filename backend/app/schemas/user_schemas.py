from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class UserBase(BaseModel):
    nama: str
    username: str
    email: EmailStr

class MahasiswaCreate(UserBase):
    password: str
    nim: str
    prodi: str

class UserResponse(UserBase):
    user_id: int
    role: str
    
    model_config = ConfigDict(from_attributes=True)

class MahasiswaResponse(UserResponse):
    nim: str
    prodi: str
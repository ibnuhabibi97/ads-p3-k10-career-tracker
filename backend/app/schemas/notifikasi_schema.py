from pydantic import BaseModel, ConfigDict
from typing import Optional

class NotifikasiBase(BaseModel):
    isi_notifikasi: str
    target_url: Optional[str] = None

class NotifikasiCreate(NotifikasiBase):
    user_id: int

class NotifikasiUpdate(BaseModel):
    is_read: Optional[bool] = None

class NotifikasiResponse(NotifikasiBase):
    notifikasi_id: int
    user_id: int
    is_read: bool

    model_config = ConfigDict(from_attributes=True)
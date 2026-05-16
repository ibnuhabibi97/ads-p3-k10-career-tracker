"""ubah_role_menjadi_enum

Revision ID: 77cceca53d33
Revises: d2ce259ec612
Create Date: 2026-05-16 13:21:27.354145

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '77cceca53d33'
down_revision: Union[str, None] = 'd2ce259ec612'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Definisi nama enum
enum_name = 'userrole'

def upgrade() -> None:
    # 1. Buat tipe data ENUM secara manual di PostgreSQL
    user_role = postgresql.ENUM('MAHASISWA', 'DOSEN', 'STAFF', 'USER', name=enum_name)
    user_role.create(op.get_bind())

    # 2. Ubah kolom menggunakan tipe data baru dengan konversi eksplisit (USING)
    # Mapping nilai string lama ke nilai Enum baru (member name)
    op.execute(f"ALTER TABLE users ALTER COLUMN role TYPE {enum_name} USING "
               f"CASE "
               f"WHEN role = 'mahasiswa' THEN 'MAHASISWA'::userrole "
               f"WHEN role = 'dosen' THEN 'DOSEN'::userrole "
               f"WHEN role = 'staff' THEN 'STAFF'::userrole "
               f"WHEN role = 'user' THEN 'USER'::userrole "
               f"ELSE 'USER'::userrole END")
               
    op.alter_column('users', 'role', nullable=False)


def downgrade() -> None:
    # 1. Kembalikan ke VARCHAR
    op.alter_column('users', 'role',
               type_=sa.VARCHAR(),
               nullable=False,
               postgresql_using="role::text")

    # 2. Hapus tipe ENUM
    user_role = postgresql.ENUM(name=enum_name)
    user_role.drop(op.get_bind())

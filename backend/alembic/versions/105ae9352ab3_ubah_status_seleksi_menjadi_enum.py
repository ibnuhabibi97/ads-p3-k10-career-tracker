"""ubah_status_seleksi_menjadi_enum

Revision ID: 105ae9352ab3
Revises: d91a4b912f1f
Create Date: 2026-05-16 12:34:34.712206

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '105ae9352ab3'
down_revision: Union[str, None] = 'd91a4b912f1f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Definisi nama enum
enum_name = 'pendaftaranstatus'

def upgrade() -> None:
    # 1. Buat tipe data ENUM secara manual di PostgreSQL
    pendaftaran_status = postgresql.ENUM('PENDING', 'REVIEW', 'SELEKSI', 'ACCEPTED', 'REJECTED', name=enum_name)
    pendaftaran_status.create(op.get_bind())

    # 2. Ubah kolom menggunakan tipe data baru dengan konversi eksplisit (USING)
    # Mapping nilai string lama ke nilai Enum baru
    op.execute(f"ALTER TABLE pendaftaran ALTER COLUMN status_seleksi TYPE {enum_name} USING "
               f"CASE "
               f"WHEN status_seleksi = 'Pending Review' THEN 'PENDING'::pendaftaranstatus "
               f"WHEN status_seleksi = 'Under Review' THEN 'REVIEW'::pendaftaranstatus "
               f"WHEN status_seleksi = 'Interview' THEN 'SELEKSI'::pendaftaranstatus "
               f"WHEN status_seleksi = 'Accepted' THEN 'ACCEPTED'::pendaftaranstatus "
               f"WHEN status_seleksi = 'Rejected' THEN 'REJECTED'::pendaftaranstatus "
               f"ELSE 'PENDING'::pendaftaranstatus END")
               
    op.alter_column('pendaftaran', 'status_seleksi', nullable=False)


def downgrade() -> None:
    # 1. Kembalikan ke VARCHAR
    op.alter_column('pendaftaran', 'status_seleksi',
               type_=sa.VARCHAR(),
               nullable=True,
               postgresql_using="status_seleksi::text")

    # 2. Hapus tipe ENUM
    pendaftaran_status = postgresql.ENUM(name=enum_name)
    pendaftaran_status.drop(op.get_bind())

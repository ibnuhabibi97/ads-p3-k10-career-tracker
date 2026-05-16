"""ubah_status_laporan_dan_rekomendasi_menjadi_enum

Revision ID: d2ce259ec612
Revises: 105ae9352ab3
Create Date: 2026-05-16 13:08:31.942259

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd2ce259ec612'
down_revision: Union[str, None] = '105ae9352ab3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Definisi nama enum
enum_laporan = 'laporanstatus'
enum_rekomendasi = 'suratrekomendasistatus'

def upgrade() -> None:
    # 1. Buat tipe data ENUM secara manual di PostgreSQL
    laporan_status = postgresql.ENUM('PENDING', 'REVIEW', 'REVISION', 'GRADED', 'REJECTED', name=enum_laporan)
    laporan_status.create(op.get_bind())
    
    rekomendasi_status = postgresql.ENUM('PENDING', 'PROCESSING', 'APPROVED', 'DECLINED', name=enum_rekomendasi)
    rekomendasi_status.create(op.get_bind())

    # 2. Ubah kolom Laporan
    op.execute(f"ALTER TABLE laporan ALTER COLUMN status TYPE {enum_laporan} USING "
               f"CASE "
               f"WHEN status = 'Pending' THEN 'PENDING'::laporanstatus "
               f"WHEN status = 'Review In Progress' THEN 'REVIEW'::laporanstatus "
               f"WHEN status = 'Revision Required' THEN 'REVISION'::laporanstatus "
               f"WHEN status = 'Telah Dinilai' OR status = 'Graded' THEN 'GRADED'::laporanstatus "
               f"WHEN status = 'Ditolak' OR status = 'Rejected' THEN 'REJECTED'::laporanstatus "
               f"ELSE 'PENDING'::laporanstatus END")
    op.alter_column('laporan', 'status', nullable=False)

    # 3. Ubah kolom Surat Rekomendasi
    op.execute(f"ALTER TABLE surat_rekomendasi ALTER COLUMN status_surat TYPE {enum_rekomendasi} USING "
               f"CASE "
               f"WHEN status_surat = 'Pending' THEN 'PENDING'::suratrekomendasistatus "
               f"WHEN status_surat = 'Processing' THEN 'PROCESSING'::suratrekomendasistatus "
               f"WHEN status_surat = 'Diterima' OR status_surat = 'Approved' THEN 'APPROVED'::suratrekomendasistatus "
               f"WHEN status_surat = 'Ditolak' OR status_surat = 'Declined' THEN 'DECLINED'::suratrekomendasistatus "
               f"ELSE 'PENDING'::suratrekomendasistatus END")
    op.alter_column('surat_rekomendasi', 'status_surat', nullable=False)


def downgrade() -> None:
    # 1. Kembalikan ke VARCHAR
    op.alter_column('surat_rekomendasi', 'status_surat',
               type_=sa.VARCHAR(),
               nullable=True,
               postgresql_using="status_surat::text")
    op.alter_column('laporan', 'status',
               type_=sa.VARCHAR(),
               nullable=True,
               postgresql_using="status::text")

    # 2. Hapus tipe ENUM
    laporan_status = postgresql.ENUM(name=enum_laporan)
    laporan_status.drop(op.get_bind())
    rekomendasi_status = postgresql.ENUM(name=enum_rekomendasi)
    rekomendasi_status.drop(op.get_bind())

"""tambah ONGOING ke LaporanStatus

Revision ID: b7d8c9a0b1c2
Revises: 19c241a036e6
Create Date: 2026-06-01 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b7d8c9a0b1c2'
down_revision: Union[str, None] = '19c241a036e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Postgres specific command to add value to ENUM
    # Menggunakan commit_as_batch tidak bisa untuk ALTER TYPE
    # Kita gunakan raw execute. 
    # Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block in some PG versions
    # But Alembic handles this if we use op.execute
    op.execute("ALTER TYPE laporanstatus ADD VALUE 'ONGOING'")

def downgrade() -> None:
    # Postgres tidak mendukung penghapusan nilai ENUM secara langsung
    pass

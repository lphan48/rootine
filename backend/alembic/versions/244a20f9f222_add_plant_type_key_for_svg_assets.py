"""add plant type key for svg assets

Revision ID: 244a20f9f222
Revises: aad3451d0a9b
Create Date: 2026-03-19 16:18:22.634013

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '244a20f9f222'
down_revision: Union[str, Sequence[str], None] = 'aad3451d0a9b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('plant_types', sa.Column('key', sa.String(), nullable=True))

    op.execute(
        """
        UPDATE plant_types
        SET key = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '_', 'g'))
        """
    )
    op.execute("UPDATE plant_types SET key = 'plant' WHERE key IS NULL OR key = ''")

    op.execute(
        """
        WITH ranked AS (
            SELECT id,
                   key,
                   row_number() OVER (PARTITION BY key ORDER BY id) AS rn
            FROM plant_types
        )
        UPDATE plant_types p
        SET key = CASE WHEN ranked.rn = 1 THEN ranked.key ELSE ranked.key || '_' || ranked.rn::text END
        FROM ranked
        WHERE p.id = ranked.id
        """
    )

    op.alter_column('plant_types', 'key', nullable=False)
    op.create_unique_constraint('uq_plant_types_key', 'plant_types', ['key'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('uq_plant_types_key', 'plant_types', type_='unique')
    op.drop_column('plant_types', 'key')

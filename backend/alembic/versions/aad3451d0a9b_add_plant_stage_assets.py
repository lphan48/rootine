"""add plant stage assets

Revision ID: aad3451d0a9b
Revises: f4e5312f0182
Create Date: 2026-03-19 16:02:41.376898

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'aad3451d0a9b'
down_revision: Union[str, Sequence[str], None] = 'f4e5312f0182'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "plant_stage_assets" not in inspector.get_table_names():
        op.create_table(
            "plant_stage_assets",
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("plant_type_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column(
                "stage",
                sa.Enum("seed", "sprout", "small_plant", "mature_plant", name="plantstage"),
                nullable=False,
            ),
            sa.Column("image_path", sa.String(), nullable=False),
            sa.ForeignKeyConstraint(["plant_type_id"], ["plant_types.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("plant_type_id", "stage", name="uq_plant_stage_assets_type_stage"),
        )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "plant_stage_assets" in inspector.get_table_names():
        op.drop_table("plant_stage_assets")

"""seed starter sunflower

Revision ID: 3a88c44c58fd
Revises: 244a20f9f222
Create Date: 2026-03-19 16:24:16.347855

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3a88c44c58fd'
down_revision: Union[str, Sequence[str], None] = '244a20f9f222'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()

    sunflower_id = conn.execute(
        sa.text("SELECT id FROM plant_types WHERE key = 'sunflower'")
    ).scalar()

    if sunflower_id is None:
        sunflower_id = str(uuid.uuid4())
        conn.execute(
            sa.text(
                """
                INSERT INTO plant_types (id, key, name, growth_target_xp, unlock_account_xp)
                VALUES (:id, :key, :name, :growth_target_xp, :unlock_account_xp)
                """
            ),
            {
                "id": sunflower_id,
                "key": "sunflower",
                "name": "Sunflower",
                "growth_target_xp": 500,
                "unlock_account_xp": 0,
            },
        )
    else:
        conn.execute(
            sa.text(
                """
                UPDATE plant_types
                SET name = :name,
                    growth_target_xp = :growth_target_xp,
                    unlock_account_xp = :unlock_account_xp
                WHERE key = :key
                """
            ),
            {
                "key": "sunflower",
                "name": "Sunflower",
                "growth_target_xp": 500,
                "unlock_account_xp": 0,
            },
        )

    stage_assets = [
        ("seed", "/static/plants/sunflower/seed.svg"),
        ("sprout", "/static/plants/sunflower/sprout.svg"),
        ("small_plant", "/static/plants/sunflower/small_plant.svg"),
        ("mature_plant", "/static/plants/sunflower/mature_plant.svg"),
    ]

    for stage, image_path in stage_assets:
        conn.execute(
            sa.text(
                """
                INSERT INTO plant_stage_assets (id, plant_type_id, stage, image_path)
                VALUES (:id, :plant_type_id, CAST(:stage AS plantstage), :image_path)
                ON CONFLICT (plant_type_id, stage)
                DO UPDATE SET image_path = EXCLUDED.image_path
                """
            ),
            {
                "id": str(uuid.uuid4()),
                "plant_type_id": str(sunflower_id),
                "stage": stage,
                "image_path": image_path,
            },
        )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(
        """
        DELETE FROM plant_stage_assets
        WHERE plant_type_id IN (
            SELECT id FROM plant_types WHERE key = 'sunflower'
        )
        """
    )

    op.execute(
        """
        DELETE FROM plant_types
        WHERE key = 'sunflower'
          AND NOT EXISTS (
              SELECT 1 FROM plants
              WHERE plants.plant_type_id = plant_types.id
          )
        """
    )

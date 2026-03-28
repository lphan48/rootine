"""rework plant progression and seed types

Revision ID: b4d92c01e2f1
Revises: 3a88c44c58fd
Create Date: 2026-03-27 12:00:00.000000

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b4d92c01e2f1'
down_revision: Union[str, Sequence[str], None] = '3a88c44c58fd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _upsert_type(conn, *, key: str, name: str, sprout_xp: int, small_xp: int, mature_xp: int, unlock_xp: int, unlock_requires_key: str | None):
    type_id = conn.execute(
        sa.text("SELECT id FROM plant_types WHERE key = :key"),
        {"key": key},
    ).scalar()

    if type_id is None:
        type_id = str(uuid.uuid4())
        conn.execute(
            sa.text(
                """
                INSERT INTO plant_types (
                    id,
                    key,
                    name,
                    sprout_threshold_xp,
                    small_plant_threshold_xp,
                    growth_target_xp,
                    unlock_account_xp,
                    unlock_requires_plant_key
                )
                VALUES (
                    :id,
                    :key,
                    :name,
                    :sprout_threshold_xp,
                    :small_plant_threshold_xp,
                    :growth_target_xp,
                    :unlock_account_xp,
                    :unlock_requires_plant_key
                )
                """
            ),
            {
                "id": type_id,
                "key": key,
                "name": name,
                "sprout_threshold_xp": sprout_xp,
                "small_plant_threshold_xp": small_xp,
                "growth_target_xp": mature_xp,
                "unlock_account_xp": unlock_xp,
                "unlock_requires_plant_key": unlock_requires_key,
            },
        )
    else:
        conn.execute(
            sa.text(
                """
                UPDATE plant_types
                SET name = :name,
                    sprout_threshold_xp = :sprout_threshold_xp,
                    small_plant_threshold_xp = :small_plant_threshold_xp,
                    growth_target_xp = :growth_target_xp,
                    unlock_account_xp = :unlock_account_xp,
                    unlock_requires_plant_key = :unlock_requires_plant_key
                WHERE key = :key
                """
            ),
            {
                "key": key,
                "name": name,
                "sprout_threshold_xp": sprout_xp,
                "small_plant_threshold_xp": small_xp,
                "growth_target_xp": mature_xp,
                "unlock_account_xp": unlock_xp,
                "unlock_requires_plant_key": unlock_requires_key,
            },
        )

    for stage in ("seed", "sprout", "small_plant", "mature_plant"):
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
                "plant_type_id": str(type_id),
                "stage": stage,
                "image_path": f"/static/plants/{key}/{stage}.svg",
            },
        )


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('plant_types', sa.Column('sprout_threshold_xp', sa.Integer(), nullable=True))
    op.add_column('plant_types', sa.Column('small_plant_threshold_xp', sa.Integer(), nullable=True))
    op.add_column('plant_types', sa.Column('unlock_requires_plant_key', sa.String(), nullable=True))

    op.execute("UPDATE plant_types SET sprout_threshold_xp = 100 WHERE sprout_threshold_xp IS NULL")
    op.execute("UPDATE plant_types SET small_plant_threshold_xp = 250 WHERE small_plant_threshold_xp IS NULL")

    op.alter_column('plant_types', 'sprout_threshold_xp', nullable=False)
    op.alter_column('plant_types', 'small_plant_threshold_xp', nullable=False)

    conn = op.get_bind()

    # 50 XP per completed focus session.
    # Sunflower increments: +2, +3, +4 sessions -> 100, 250, 450
    _upsert_type(
        conn,
        key='sunflower',
        name='Sunflower',
        sprout_xp=100,
        small_xp=250,
        mature_xp=450,
        unlock_xp=0,
        unlock_requires_key=None,
    )

    # Tomato seed unlock: sunflower must be mature.
    # Tomato increments: +3, +4, +5 sessions -> 150, 350, 600
    _upsert_type(
        conn,
        key='tomato',
        name='Tomato Plant',
        sprout_xp=150,
        small_xp=350,
        mature_xp=600,
        unlock_xp=0,
        unlock_requires_key='sunflower',
    )

    # Cactus seed unlock: tomato must be mature.
    # Cactus increments: +1, +3, +6 sessions -> 50, 200, 500
    _upsert_type(
        conn,
        key='cactus',
        name='Cactus',
        sprout_xp=50,
        small_xp=200,
        mature_xp=500,
        unlock_xp=0,
        unlock_requires_key='tomato',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DELETE FROM plant_stage_assets WHERE plant_type_id IN (SELECT id FROM plant_types WHERE key IN ('tomato', 'cactus'))")
    op.execute("DELETE FROM plant_types WHERE key IN ('tomato', 'cactus')")

    op.execute("UPDATE plant_types SET unlock_requires_plant_key = NULL WHERE key = 'sunflower'")
    op.execute("UPDATE plant_types SET sprout_threshold_xp = 100 WHERE key = 'sunflower'")
    op.execute("UPDATE plant_types SET small_plant_threshold_xp = 250 WHERE key = 'sunflower'")
    op.execute("UPDATE plant_types SET growth_target_xp = 500 WHERE key = 'sunflower'")

    op.drop_column('plant_types', 'unlock_requires_plant_key')
    op.drop_column('plant_types', 'small_plant_threshold_xp')
    op.drop_column('plant_types', 'sprout_threshold_xp')

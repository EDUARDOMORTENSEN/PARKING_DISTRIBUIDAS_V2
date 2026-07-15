"""cambia id_vehiculo (uuid) a placa (string) en tickets

Revision ID: 003_id_vehiculo_a_placa
Revises: 002_add_categorias_tarifa
Create Date: 2026-07-06

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "003_id_vehiculo_a_placa"
down_revision = "002_add_categorias_tarifa"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tickets", sa.Column("placa", sa.String(length=15), nullable=True))

    # Backfill: si ya tienes tickets de prueba, no hay forma de recuperar
    # la placa real desde el id_vehiculo viejo (son sistemas distintos),
    # así que se marca con un valor de relleno identificable.
    op.execute("UPDATE tickets SET placa = 'SIN-PLACA' WHERE placa IS NULL")

    op.alter_column("tickets", "placa", nullable=False)
    op.create_index("ix_tickets_placa", "tickets", ["placa"])
    op.drop_column("tickets", "id_vehiculo")


def downgrade() -> None:
    op.add_column(
        "tickets",
        sa.Column("id_vehiculo", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.drop_index("ix_tickets_placa", table_name="tickets")
    op.drop_column("tickets", "placa")

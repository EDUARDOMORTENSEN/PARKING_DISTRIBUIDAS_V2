"""create tickets table

Revision ID: 001
Revises:
Create Date: 2026-07-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    estado_ticket_enum = postgresql.ENUM(
        "activo", "pagado", "anulado", name="estado_ticket_enum"
    )

    op.create_table(
        "tickets",
        sa.Column("id_ticket", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("id_espacio", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("id_usuario", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("id_vehiculo", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("id_empleado", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("codigo_ticket", sa.String(20), nullable=False),
        sa.Column(
            "fecha_hora_ingreso",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("fecha_hora_salida", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "estado_ticket",
            estado_ticket_enum,
            nullable=False,
            server_default="activo",
        ),
        sa.Column("valor_recaudado", sa.Numeric(10, 2), nullable=True),
    )
    op.create_index(
        "ix_tickets_codigo_ticket", "tickets", ["codigo_ticket"], unique=True
    )


def downgrade() -> None:
    op.drop_index("ix_tickets_codigo_ticket", table_name="tickets")
    op.drop_table("tickets")
    postgresql.ENUM(name="estado_ticket_enum").drop(op.get_bind())
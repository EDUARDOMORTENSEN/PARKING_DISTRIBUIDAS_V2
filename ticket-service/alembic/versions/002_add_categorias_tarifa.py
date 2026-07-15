"""agrega categorias de tarifa a tickets

Revision ID: 002_add_categorias_tarifa
Revises: 001
Create Date: 2026-07-05

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "002_add_categorias_tarifa"
down_revision = "001"
branch_labels = None
depends_on = None

# create_type=False porque las creamos a mano en upgrade() con checkfirst=True,
# así evitamos que Alembic intente un CREATE TYPE duplicado al hacer add_column.
categoria_vehiculo_enum = postgresql.ENUM(
    "MOTO", "AUTO_CAMIONETA", name="categoria_vehiculo_enum", create_type=False
)
categoria_zona_enum = postgresql.ENUM(
    "VIP", "ESTANDAR", name="categoria_zona_enum", create_type=False
)


def upgrade() -> None:
    bind = op.get_bind()
    categoria_vehiculo_enum.create(bind, checkfirst=True)
    categoria_zona_enum.create(bind, checkfirst=True)

    # 1. Agregar las columnas como nullable primero (por si ya hay tickets)
    op.add_column(
        "tickets",
        sa.Column("categoria_vehiculo", categoria_vehiculo_enum, nullable=True),
    )
    op.add_column(
        "tickets",
        sa.Column("categoria_zona", categoria_zona_enum, nullable=True),
    )
    op.add_column(
        "tickets",
        sa.Column("tarifa_hora_aplicada", sa.Numeric(10, 2), nullable=True),
    )

    # 2. Backfill de tickets existentes.
    op.execute(
        """
        UPDATE tickets
        SET categoria_vehiculo = 'AUTO_CAMIONETA',
            categoria_zona = 'ESTANDAR',
            tarifa_hora_aplicada = 1.25
        WHERE categoria_vehiculo IS NULL
        """
    )

    # 3. Ahora sí, poner NOT NULL
    op.alter_column("tickets", "categoria_vehiculo", nullable=False)
    op.alter_column("tickets", "categoria_zona", nullable=False)
    op.alter_column("tickets", "tarifa_hora_aplicada", nullable=False)


def downgrade() -> None:
    op.drop_column("tickets", "tarifa_hora_aplicada")
    op.drop_column("tickets", "categoria_zona")
    op.drop_column("tickets", "categoria_vehiculo")

    categoria_zona_enum.drop(op.get_bind(), checkfirst=True)
    categoria_vehiculo_enum.drop(op.get_bind(), checkfirst=True)

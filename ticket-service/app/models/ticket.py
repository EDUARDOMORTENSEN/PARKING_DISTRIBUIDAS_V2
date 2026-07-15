from decimal import Decimal
from app.utils.enums import CategoriaZona
from app.utils.enums import CategoriaVehiculo
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SqlEnum, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.utils.enums import EstadoTicket


class Ticket(Base):
    __tablename__ = "tickets"

    id_ticket: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Referencias a otros microservicios (sin FK, se validan por HTTP)
    id_espacio: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    id_usuario: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    placa: Mapped[str] = mapped_column(String(15), nullable=False, index=True)
    id_empleado: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)

    codigo_ticket: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )

    fecha_hora_ingreso: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    fecha_hora_salida: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    estado_ticket: Mapped[EstadoTicket] = mapped_column(
        SqlEnum(
            EstadoTicket,
            name="estado_ticket_enum",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        default=EstadoTicket.ACTIVO,
        nullable=False,
    )

    valor_recaudado: Mapped[float | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )

    # datos de tarifs aplicados (para auditoría / reporting)
    categoria_vehiculo: Mapped[CategoriaVehiculo] = mapped_column(
        SqlEnum(CategoriaVehiculo, name="categoria_vehiculo_enum"), nullable=False
    )
    categoria_zona: Mapped[CategoriaZona] = mapped_column(
        SqlEnum(CategoriaZona, name="categoria_zona_enum"), nullable=False
    )
    tarifa_hora_aplicada: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    def __repr__(self) -> str:
        return f"<Ticket {self.codigo_ticket} - {self.estado_ticket}>"
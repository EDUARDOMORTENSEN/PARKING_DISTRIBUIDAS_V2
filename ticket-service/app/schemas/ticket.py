import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.utils.enums import CategoriaVehiculo, CategoriaZona, EstadoTicket


class TicketBase(BaseModel):
    id_espacio: uuid.UUID
    id_usuario: uuid.UUID
    placa: str = Field(..., min_length=1, max_length=15)


class TicketCreate(TicketBase):
    """Body para POST /tickets. id_empleado NO va aquí:
    se obtiene del header X-User-Id inyectado por Kong."""
    pass


class TicketRegistrarSalida(BaseModel):
    fecha_hora_salida: datetime | None = None


class TicketAnular(BaseModel):
    motivo: str | None = Field(default=None, max_length=255)


class TicketResponse(TicketBase):
    model_config = ConfigDict(from_attributes=True)

    id_ticket: uuid.UUID
    id_empleado: uuid.UUID
    codigo_ticket: str
    fecha_hora_ingreso: datetime
    fecha_hora_salida: datetime | None
    estado_ticket: EstadoTicket
    valor_recaudado: float | None
    categoria_vehiculo: CategoriaVehiculo
    categoria_zona: CategoriaZona
    tarifa_hora_aplicada: float


class TicketListResponse(BaseModel):
    total: int
    tickets: list[TicketResponse]
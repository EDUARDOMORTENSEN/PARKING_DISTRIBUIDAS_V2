from app.api.v1.endpoints import tickets
import uuid
from datetime import datetime, timezone

from app.core.config import settings
from app.models.ticket import Ticket
from app.repositories.ticket_repository import TicketRepository
from app.schemas.ticket import TicketAnular, TicketCreate, TicketRegistrarSalida
from app.utils.enums import EstadoTicket
from decimal import Decimal
from app.utils.exceptions import (
    EspacioNoDisponibleException,
    EspacioOcupadoException,
    EstadoInvalidoException,
    TicketNoEncontradoException,
    VehiculoNoEncontradoException,
)
from app.utils.rabbitmq_publisher import rabbitmq_publisher


class TicketService:
    def __init__(
        self,
        ticket_repository: TicketRepository,
        zonas_client,
        vehiculos_client,
        token: str | None = None,
    ):
        self.ticket_repository = ticket_repository
        self.zonas_client = zonas_client
        self.vehiculos_client = vehiculos_client
        self.token = token

    async def create_ticket(
        self, data: TicketCreate, id_empleado: uuid.UUID
    ) -> Ticket:
        espacio = await self.zonas_client.obtener_espacio(data.id_espacio, self.token)
        if espacio is None or espacio.get("estado") != "DISPONIBLE":
            raise EspacioNoDisponibleException(
                f"El espacio {data.id_espacio} no está disponible"
            )

        categoria_zona = await self.zonas_client.obtener_categoria_zona(
            espacio["idZona"], self.token
        )

        categoria_vehiculo = await self.vehiculos_client.obtener_categoria_vehiculo(
            data.placa, self.token
        )

        ticket_activo = await self.ticket_repository.get_activo_by_espacio(
            data.id_espacio
        )
        if ticket_activo:
            raise EspacioOcupadoException(
                f"El espacio {data.id_espacio} ya tiene un ticket activo"
            )

        tarifa_hora = settings.TARIFAS[(categoria_vehiculo, categoria_zona)]

        nuevo_ticket = Ticket(
            id_espacio=data.id_espacio,
            id_usuario=data.id_usuario,
            placa=data.placa,
            id_empleado=id_empleado,
            codigo_ticket=self._generar_codigo_ticket(),
            estado_ticket=EstadoTicket.ACTIVO,
            categoria_vehiculo=categoria_vehiculo,
            categoria_zona=categoria_zona,
            tarifa_hora_aplicada=tarifa_hora,
        )
        ticket_creado = await self.ticket_repository.create(nuevo_ticket)
        # Emitir evento a RabbitMQ (Outbox Pattern)
        await rabbitmq_publisher.publish_ticket_event(
            "created", 
            {"id_espacio": str(data.id_espacio), "estado": "OCUPADO"}
        )
        return ticket_creado

    async def registrar_salida(
        self, id_ticket: uuid.UUID, data: TicketRegistrarSalida
    ) -> Ticket:
        ticket = await self._get_ticket_o_falla(id_ticket)

        if ticket.estado_ticket != EstadoTicket.ACTIVO:
            raise EstadoInvalidoException(
                f"El ticket {ticket.codigo_ticket} no está activo, "
                f"estado actual: {ticket.estado_ticket}"
            )

        ticket.fecha_hora_salida = data.fecha_hora_salida or datetime.now(
            timezone.utc
        )
        ticket.valor_recaudado = self._calcular_valor_recaudado(
            ticket.fecha_hora_ingreso,
            ticket.fecha_hora_salida,
            ticket.tarifa_hora_aplicada,
        )
        ticket.estado_ticket = EstadoTicket.PAGADO

        ticket_actualizado = await self.ticket_repository.update(ticket)
        # Emitir evento a RabbitMQ para liberar espacio
        await rabbitmq_publisher.publish_ticket_event(
            "salida_registrada", 
            {"id_espacio": str(ticket.id_espacio), "estado": "DISPONIBLE"}
        )
        return ticket_actualizado

    async def anular_ticket(
        self, id_ticket: uuid.UUID, data: TicketAnular
    ) -> Ticket:
        ticket = await self._get_ticket_o_falla(id_ticket)

        if ticket.estado_ticket != EstadoTicket.ACTIVO:
            raise EstadoInvalidoException(
                f"Solo se pueden anular tickets activos. "
                f"Estado actual: {ticket.estado_ticket}"
            )

        ticket.estado_ticket = EstadoTicket.ANULADO
        ticket_actualizado = await self.ticket_repository.update(ticket)
        # Emitir evento a RabbitMQ para liberar espacio
        await rabbitmq_publisher.publish_ticket_event(
            "anulado", 
            {"id_espacio": str(ticket.id_espacio), "estado": "DISPONIBLE"}
        )
        return ticket_actualizado

    async def get_ticket(self, id_ticket: uuid.UUID) -> Ticket:
        return await self._get_ticket_o_falla(id_ticket)

    # ---------- helpers privados ----------

    async def _get_ticket_o_falla(self, id_ticket: uuid.UUID) -> Ticket:
        ticket = await self.ticket_repository.get_by_id(id_ticket)
        if not ticket:
            raise TicketNoEncontradoException(
                f"No existe un ticket con id {id_ticket}"
            )
        return ticket

    @staticmethod
    def _generar_codigo_ticket() -> str:
        fecha = datetime.now(timezone.utc).strftime("%Y%m%d")
        sufijo = uuid.uuid4().hex[:6].upper()
        return f"TCK-{fecha}-{sufijo}"

    @staticmethod
    def _calcular_valor_recaudado(
        ingreso: datetime, salida: datetime, tarifa_hora: Decimal
    ) -> Decimal:
        horas = Decimal(str((salida - ingreso).total_seconds() / 3600))
        horas_minimas = Decimal(str(settings.HORAS_MINIMAS_COBRO))
        horas = max(horas, horas_minimas)
        return (horas * tarifa_hora).quantize(Decimal("0.01"))
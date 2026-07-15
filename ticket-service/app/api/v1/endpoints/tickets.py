import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_empleado_id, get_ticket_service, RequirePermissions
from app.schemas.ticket import (
    TicketAnular,
    TicketCreate,
    TicketRegistrarSalida,
    TicketResponse,
)
from app.services.ticket_service import TicketService
from app.utils.exceptions import (
    EspacioNoDisponibleException,
    EspacioOcupadoException,
    EstadoInvalidoException,
    ServicioExternoException,
    TicketNoEncontradoException,
    VehiculoNoEncontradoException,
)

from fastapi import FastAPI, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
router = APIRouter(prefix="/tickets", tags=["Tickets"], dependencies=[Depends(security)])


@router.post(
    "/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED
)
async def crear_ticket(
    data: TicketCreate,
    service: Annotated[TicketService, Depends(get_ticket_service)],
    id_empleado: Annotated[uuid.UUID, Depends(get_current_empleado_id)],
    _ = Depends(RequirePermissions("TICKETS_CREATE"))
):
    try:
        ticket = await service.create_ticket(data, id_empleado)
        return TicketResponse.model_validate(ticket)
    except (EspacioNoDisponibleException, EspacioOcupadoException) as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(exc))
    except VehiculoNoEncontradoException as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ServicioExternoException as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=str(exc))


@router.get("/{id_ticket}", response_model=TicketResponse)
async def obtener_ticket(
    id_ticket: uuid.UUID,
    service: Annotated[TicketService, Depends(get_ticket_service)],
    _ = Depends(RequirePermissions("TICKETS_READ"))
):
    try:
        ticket = await service.get_ticket(id_ticket)
        return TicketResponse.model_validate(ticket)
    except TicketNoEncontradoException as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.patch("/{id_ticket}/salida", response_model=TicketResponse)
async def registrar_salida(
    id_ticket: uuid.UUID,
    data: TicketRegistrarSalida,
    service: Annotated[TicketService, Depends(get_ticket_service)],
    _ = Depends(RequirePermissions("TICKETS_UPDATE"))
):
    try:
        ticket = await service.registrar_salida(id_ticket, data)
        return TicketResponse.model_validate(ticket)
    except TicketNoEncontradoException as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))
    except EstadoInvalidoException as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(exc))


@router.patch("/{id_ticket}/anular", response_model=TicketResponse)
async def anular_ticket(
    id_ticket: uuid.UUID,
    data: TicketAnular,
    service: Annotated[TicketService, Depends(get_ticket_service)],
    _ = Depends(RequirePermissions("TICKETS_UPDATE"))
):
    try:
        ticket = await service.anular_ticket(id_ticket, data)
        return TicketResponse.model_validate(ticket)
    except TicketNoEncontradoException as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))
    except EstadoInvalidoException as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(exc))
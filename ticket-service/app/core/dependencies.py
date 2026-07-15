from functools import lru_cache
import uuid
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.vehiculos_client import VehiculosClient
from app.clients.zonas_client import ZonasClient
from app.db.session import get_db
from app.repositories.ticket_repository import TicketRepository
from app.services.ticket_service import TicketService


async def get_current_empleado_id(
    x_user_id: Annotated[str | None, Header()] = None,
) -> uuid.UUID:
    """Kong ya validó el JWT contra gestion-usuarios y, si es válido,
    inyecta este header antes de llegar aquí. Si no viene, algo está
    mal configurado en el gateway (o llamaron al servicio sin pasar por Kong)."""
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se encontró X-User-Id. La petición debe pasar por Kong.",
        )
    try:
        return uuid.UUID(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-User-Id inválido",
        )


class RequirePermissions:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, x_user_permissions: Annotated[str | None, Header()] = None):
        if not x_user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No se encontraron permisos en la solicitud",
            )
        
        permissions = [p.strip() for p in x_user_permissions.split(",")]
        if self.required_permission not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permiso requerido: {self.required_permission}",
            )


def get_ticket_repository(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TicketRepository:
    return TicketRepository(db)

@lru_cache
def get_zonas_client() -> ZonasClient:
    return ZonasClient()

@lru_cache
def get_vehiculos_client() -> VehiculosClient:
    return VehiculosClient()


def get_ticket_service(
    ticket_repository: Annotated[TicketRepository, Depends(get_ticket_repository)],
    zonas_client: Annotated[ZonasClient, Depends(get_zonas_client)],
    vehiculos_client: Annotated[VehiculosClient, Depends(get_vehiculos_client)],
    token: Annotated[str | None, Header(alias="Authorization")] = None,
) -> TicketService:
    return TicketService(
        ticket_repository=ticket_repository,
        zonas_client=zonas_client,
        vehiculos_client=vehiculos_client,
        token=token,
    )
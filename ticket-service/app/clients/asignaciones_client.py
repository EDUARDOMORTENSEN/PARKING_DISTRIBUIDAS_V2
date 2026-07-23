import uuid
import httpx
import logging

from app.clients.base_client import BaseHttpClient
from app.core.config import settings
from app.utils.exceptions import ServicioExternoException

logger = logging.getLogger(__name__)

class AsignacionesClient(BaseHttpClient):
    def __init__(self):
        super().__init__(base_url=settings.ASIGNACIONES_URL, timeout=settings.HTTP_CLIENT_TIMEOUT)

    async def obtener_asignacion_activa(self, vehicle_id: str, token: str | None = None) -> dict | None:
        """
        Consulta al assignment-service la asignación activa para el vehículo especificado.
        El endpoint espera UUID del vehículo.
        """
        response = await self.get(f"/api/asignaciones/vehiculo/{vehicle_id}/activo", token)
        if response.status_code == 404:
            return None
            
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.error(f"Error al consultar asignaciones para vehicle_id {vehicle_id}: {exc}")
            raise ServicioExternoException(f"Error HTTP {response.status_code} al consultar asignación: {exc}")
            
        return response.json()

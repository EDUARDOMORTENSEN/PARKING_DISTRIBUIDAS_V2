import logging
import uuid
from datetime import datetime, timedelta, timezone

from app.clients.base_client import BaseHttpClient
from app.core.config import settings
from app.utils.enums import CategoriaZona
from app.utils.exceptions import ServicioExternoException
from app.utils.tarifas import mapear_categoria_zona

logger = logging.getLogger(__name__)


class ZonasClient(BaseHttpClient):
    def __init__(self):
        super().__init__(base_url=settings.ZONAS_URL, timeout=settings.HTTP_CLIENT_TIMEOUT)
        self._zonas_cache: list[dict] | None = None
        self._zonas_cache_expira: datetime | None = None
        self._ZONAS_CACHE_TTL = timedelta(minutes=5)

    async def obtener_espacios(self, token: str | None = None) -> list[dict]:
        response = await self.get("/api/v1/espacios/", token)
        response.raise_for_status()
        return response.json()

    async def obtener_espacio(self, id_espacio: uuid.UUID, token: str | None = None) -> dict | None:
        try:
            response = await self.get(f"/api/v1/espacios/{id_espacio}", token)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
        except Exception as exc:
            logger.error(f"Error al obtener espacio {id_espacio}: {exc}")
            return None

    async def actualizar_estado_espacio(self, id_espacio: uuid.UUID, estado: str, token: str | None = None) -> None:
        """Actualiza sincrónicamente el estado de un espacio en ModuloZonas.
        Lanza ServicioExternoException si la operación falla."""
        response = await self.post(f"/api/v1/espacios/{id_espacio}", json_data=estado, token=token)
        if response.status_code not in (200, 201, 204):
            raise ServicioExternoException(
                f"Zonas respondió {response.status_code} al actualizar espacio {id_espacio} a {estado}"
            )

    async def verificar_espacio_disponible(self, id_espacio: uuid.UUID, token: str | None = None) -> bool:
        espacio = await self.obtener_espacio(id_espacio, token)
        if espacio is None:
            return False
        return espacio.get("estado") == "DISPONIBLE"

    async def obtener_zonas(self, token: str | None = None) -> list[dict]:
        ahora = datetime.now(timezone.utc)
        if self._zonas_cache is not None and self._zonas_cache_expira > ahora:
            return self._zonas_cache

        response = await self.get("/api/v1/zonas/", token)
        response.raise_for_status()

        self._zonas_cache = response.json()
        self._zonas_cache_expira = ahora + self._ZONAS_CACHE_TTL
        return self._zonas_cache

    async def obtener_categoria_zona(self, id_zona: uuid.UUID | str, token: str | None = None) -> CategoriaZona:
        zonas = await self.obtener_zonas(token)
        zona = next((z for z in zonas if z["id"] == str(id_zona)), None)
        if zona is None:
            raise ServicioExternoException(
                f"No se encontró la zona {id_zona} en ModuloZonas"
            )
        return mapear_categoria_zona(zona["tipo"])
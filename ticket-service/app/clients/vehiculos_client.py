import uuid
import httpx

from app.clients.base_client import BaseHttpClient
from app.core.config import settings
from app.utils.enums import CategoriaVehiculo
from app.utils.exceptions import VehiculoNoEncontradoException
from app.utils.tarifas import mapear_categoria_vehiculo


class VehiculosClient(BaseHttpClient):
    def __init__(self):
        super().__init__(base_url=settings.VEHICULOS_URL)

    async def obtener_vehiculo(self, placa: str, token: str | None = None) -> dict | None:
        """GatewayController expone GET /vehiculos/:placa — por PLACA,
        no por id_vehiculo (confirmado: la descripción del endpoint es
        'preflight para tickets')."""
        response = await self.get(f"/api/vehiculos/placa/{placa}", token)
        if response.status_code == 404:
            return None
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            from app.utils.exceptions import ServicioExternoException
            raise ServicioExternoException(f"Error HTTP {response.status_code} al consultar vehículo: {exc}")
        data = response.json()
        return data

    async def verificar_vehiculo(self, placa: str, token: str | None = None) -> bool:
        vehiculo = await self.obtener_vehiculo(placa, token)
        return vehiculo is not None

    async def obtener_categoria_vehiculo(self, placa: str, token: str | None = None) -> CategoriaVehiculo:
        vehiculo = await self.obtener_vehiculo(placa, token)
        if vehiculo is None:
            raise VehiculoNoEncontradoException(
                f"El vehículo con placa {placa} no existe o no está registrado"
            )
        
        tipo = vehiculo.get("tipo")
        if not tipo:
            if "numeroPuertas" in vehiculo and vehiculo["numeroPuertas"] is not None:
                tipo = "AUTO"
            elif "tipoMoto" in vehiculo and vehiculo["tipoMoto"] is not None:
                tipo = "MOTO"
            elif "capacidadCarga" in vehiculo and vehiculo["capacidadCarga"] is not None:
                tipo = "CAMIONETA"
            else:
                tipo = "AUTO" # Default fallback
                
        return mapear_categoria_vehiculo(tipo)
    
    async def obtener_vehiculo_por_id(self, id_vehiculo: uuid.UUID) -> dict | None:
        """DEPRECATED tras el cambio a placa — se deja documentado
        pero ya no se usa en el flujo de tickets."""
        raise NotImplementedError("Usa obtener_vehiculo(placa) en su lugar")
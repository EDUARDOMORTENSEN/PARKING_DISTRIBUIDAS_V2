from app.utils.enums import (
    CategoriaVehiculo, CategoriaZona, TipoVehiculoExterno, TipoZonaExterno,
)
from app.utils.exceptions import ServicioExternoException


def mapear_categoria_vehiculo(tipo_externo: str) -> CategoriaVehiculo:
    tipo_normalizado = tipo_externo.strip().lower()

    if tipo_normalizado == TipoVehiculoExterno.MOTOCICLETA.value.lower():
        return CategoriaVehiculo.MOTO
    if tipo_normalizado in (
        TipoVehiculoExterno.AUTO.value.lower(),
        TipoVehiculoExterno.CAMIONETA.value.lower(),
    ):
        return CategoriaVehiculo.AUTO_CAMIONETA

    raise ServicioExternoException(
        f"Tipo de vehículo no reconocido para tarifas: {tipo_externo}"
    )


def mapear_categoria_zona(tipo_externo: str) -> CategoriaZona:
    tipo_normalizado = tipo_externo.strip().lower()

    if tipo_normalizado == TipoZonaExterno.VIP.value.lower():
        return CategoriaZona.VIP
    return CategoriaZona.ESTANDAR
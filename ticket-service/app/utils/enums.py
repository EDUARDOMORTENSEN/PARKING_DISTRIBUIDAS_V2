from enum import Enum


class EstadoTicket(str, Enum):
    ACTIVO = "activo"
    PAGADO = "pagado"
    ANULADO = "anulado"

class TipoVehiculoExterno(str, Enum):
    """Tal cual lo expone el servicio de Vehículos (columna discriminadora `tipo`)."""
    AUTO = "Auto"
    CAMIONETA = "Camioneta"
    MOTOCICLETA = "Motocicleta"

class TipoZonaExterno(str, Enum):
    """Tal cual lo expone ModuloZonas (enum TipoZona)."""
    VIP = "VIP"
    REGULAR = "REGULAR"
    INTERNA = "INTERNA"
    EXTERNA = "EXTERNA"
    PREFERENCIAL = "PREFERENCIAL"

class CategoriaVehiculo(str, Enum):
    MOTO = "MOTO"
    AUTO_CAMIONETA = "AUTO_CAMIONETA"

class CategoriaZona(str, Enum):
    VIP = "VIP"
    ESTANDAR = "ESTANDAR"  # agrupa REGULAR, INTERNA, EXTERNA, PREFERENCIAL
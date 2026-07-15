import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

// Mapeo entre la clasificación de vehículo de este servicio y el
// TipoEspacio (MOTO, AUTO, BUSETA) que maneja ModuloZonas.
// 'Camioneta' se asocia a 'AUTO' por ahora: si el negocio decide que
// las camionetas necesitan su propio tipo de espacio, hay que agregar
// ese valor en el enum TipoEspacio de ModuloZonas.
const TIPO_VEHICULO_A_TIPO_ESPACIO: Record<string, string> = {
  auto: 'AUTO',
  camioneta: 'AUTO',
  motocicleta: 'MOTO',
};

export interface ResultadoDisponibilidad {
  hayCupo: boolean;
  espaciosDisponibles?: number;
}

@Injectable()
export class ZonasClientService {
  private readonly logger = new Logger(ZonasClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Debe apuntar al servicio Spring Boot de ModuloZonas, ej:
    // http://localhost:8080
    this.baseUrl = this.configService.get<string>('ZONAS_SERVICE_URL') ?? 'http://localhost:8080';
  }

  /**
   * Consulta si existe al menos un espacio DISPONIBLE para el tipo de
   * vehículo indicado.
   *
   * NOTA DE INTEGRACIÓN: los endpoints actuales de EspacioControlador en
   * ModuloZonas (GET /api/v1/espacios/estado, /zona-estado) reciben el
   * filtro como @RequestBody en un método GET, lo cual no es un patrón
   * REST estándar y la mayoría de clientes HTTP (incluido este) no lo
   * soportan de forma confiable. Se requiere coordinar con el equipo de
   * ModuloZonas para exponer un endpoint con query params, por ejemplo:
   *   GET /api/v1/espacios/disponibilidad?tipo=AUTO
   * Mientras eso no exista, este método queda implementado contra ese
   * contrato esperado (no contra el código actual de ModuloZonas).
   */
  async consultarDisponibilidad(tipoVehiculo: string): Promise<ResultadoDisponibilidad> {
    const tipoEspacio = TIPO_VEHICULO_A_TIPO_ESPACIO[tipoVehiculo.toLowerCase()];

    if (!tipoEspacio) {
      this.logger.warn(`Tipo de vehículo sin mapeo a TipoEspacio: ${tipoVehiculo}`);
      return { hayCupo: true }; // No se puede validar, no se bloquea el flujo
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/espacios/disponibilidad`, {
          params: { tipo: tipoEspacio },
          timeout: 3000,
        }),
      );

      const espaciosDisponibles = response.data?.espaciosDisponibles ?? 0;
      return { hayCupo: espaciosDisponibles > 0, espaciosDisponibles };
    } catch (error) {
      this.logger.error(`No se pudo consultar disponibilidad en ModuloZonas: ${error}`);
      throw new ServiceUnavailableException('No se pudo validar la disponibilidad de espacio en este momento');
    }
  }
}

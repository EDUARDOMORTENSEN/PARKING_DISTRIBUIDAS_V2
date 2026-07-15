import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * Datos de vehículo que el assignment-service necesita para RF3
 * (consulta de flota con tipo y clasificacion).
 */
export interface VehiculoResumen {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  anio: number;
  tipo: string;           // 'Auto' | 'Motocicleta' | 'Camioneta'
  clasificacion: string;  // 'Electrico' | 'Hibrido' | 'Gasolina' | 'Diesel'
  activo: boolean;
}

/**
 * Cliente HTTP para el microservicio de vehículos.
 * Comunicación directa servicio-a-servicio (sin pasar por Kong).
 */
@Injectable()
export class VehiculosClientService {
  private readonly logger = new Logger(VehiculosClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('VEHICULOS_SERVICE_URL') ??
      'http://localhost:3000';
  }

  /**
   * Obtiene los datos completos de un vehículo por su ID.
   * Lanza NotFoundException si no existe.
   */
  async obtenerVehiculo(vehicleId: string, token?: string): Promise<VehiculoResumen> {
    try {
      const headers = token ? { Authorization: token } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${vehicleId}`, {
          timeout: 3000,
          headers,
        }),
      );
      const data = response.data;
      return {
        id: data.id,
        placa: data.placa,
        marca: data.marca,
        modelo: data.modelo,
        color: data.color,
        anio: data.anio,
        tipo: data.tipo ?? 'Desconocido',
        clasificacion: data.clasificacion,
        activo: data.activo,
      };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new NotFoundException(
          `Vehículo con ID ${vehicleId} no encontrado en el servicio de vehículos`,
        );
      }
      this.logger.error(
        `Error al obtener vehículo ${vehicleId}: ${error?.message} - status: ${error?.response?.status}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo obtener el vehículo en este momento',
      );
    }
  }

  /**
   * Verifica que exista un vehículo con ese id en el servicio de vehículos.
   * Devuelve false si no existe (404). No lanza excepción por indisponibilidad
   * del servicio — en ese caso también devuelve false y loguea el error.
   */
  async existeVehiculo(vehicleId: string, token?: string): Promise<boolean> {
    try {
      const headers = token ? { Authorization: token } : {};
      await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${vehicleId}`, {
          timeout: 3000,
          headers,
        }),
      );
      return true;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return false;
      }
      this.logger.error(
        `No se pudo validar el vehículo ${vehicleId}: ${error?.message} - status: ${error?.response?.status}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo validar el vehículo en este momento',
      );
    }
  }
}

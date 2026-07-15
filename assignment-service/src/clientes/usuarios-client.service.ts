import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * Cliente HTTP para el microservicio gestion-usuarios.
 * Comunicación directa servicio-a-servicio (sin pasar por Kong),
 * siguiendo el mismo patrón que PersonasClientService en el servicio de vehículos.
 */
@Injectable()
export class UsuariosClientService {
  private readonly logger = new Logger(UsuariosClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('GESTION_USUARIOS_URL') ??
      'http://localhost:3001';
  }

  /**
   * Verifica que exista un usuario activo con ese id en gestion-usuarios.
   * Devuelve false si no existe (404).
   * Lanza ServiceUnavailableException si el servicio no responde.
   */
  async existeUsuario(userId: string, token?: string): Promise<boolean> {
    try {
      const headers = token ? { Authorization: token } : {};
      await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/${userId}`, {
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
        `No se pudo validar el usuario ${userId} en gestion-usuarios: ${error?.message}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo validar el usuario en este momento',
      );
    }
  }

  /**
   * Obtiene los datos completos de un usuario por su ID.
   * Lanza NotFoundException si no existe.
   */
  async obtenerUsuario(userId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/${userId}`, {
          timeout: 3000,
        }),
      );
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new NotFoundException(
          `Usuario con ID ${userId} no encontrado en gestion-usuarios`,
        );
      }
      this.logger.error(
        `Error al obtener usuario ${userId}: ${error?.message}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo obtener el usuario en este momento',
      );
    }
  }
}

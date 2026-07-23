import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

// Llamada directa servicio-a-servicio (no pasa por Kong), igual que
// ZonasClientService. Apunta al puerto real de gestion-usuarios.
@Injectable()
export class PersonasClientService {
  private readonly logger = new Logger(PersonasClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('GESTION_USUARIOS_URL') ?? 'http://localhost:3001';
  }

  /**
   * Verifica que exista una persona con ese id en gestion-usuarios.
   * Devuelve false si no existe (404), y lanza ServiceUnavailableException
   * si el servicio no responde (no se puede confundir "no existe" con
   * "no se pudo verificar": son dos casos distintos para quien llama).
   */
  async existePersona(idPersona: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/personas/exists/${idPersona}`, { timeout: 3000 }),
      );
      return response.data?.exists === true;
    } catch (error: any) {
      this.logger.error(`No se pudo validar la persona ${idPersona} en gestion-usuarios: ${error}`);
      throw new ServiceUnavailableException('No se pudo validar el propietario en este momento');
    }
  }
}

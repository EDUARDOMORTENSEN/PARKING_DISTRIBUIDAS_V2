import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EventPublisher } from './event-publisher';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly eventPublisher: EventPublisher) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    
    // Only intercept mutating methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const accion = this.mapMethodToAction(req.method);
        // We assume token payload is in req.user due to JwtAuthGuard
        const user: any = req.user;
        const usuario = user?.username || 'system';
        const rol = Array.isArray(user?.roles) ? user.roles[0] : (user?.roles || 'system');

        const ip = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
        let ipStr = Array.isArray(ip) ? ip[0] : ip;
        // Clean up IPv6 mapped IPv4 like ::ffff:127.0.0.1
        if (ipStr.includes('::ffff:')) {
          ipStr = ipStr.split('::ffff:')[1];
        }
        if (ipStr === '::1') {
          ipStr = '127.0.0.1'; // Ensure valid IPv4 for the DTO
        }
        // Basic fallback just in case
        if (!ipStr.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
            ipStr = '127.0.0.1';
        }

        const mac = (req.headers['x-mac-address'] as string) || '00:00:00:00:00:00';

        this.eventPublisher.publish({
          servicio: 'ms-asignaciones',
          accion,
          entidad: 'ASIGNACION',
          usuario,
          rol,
          ip: ipStr,
          mac,
          datos: {
            path: req.path,
            method: req.method,
            body: req.body,
          },
        });
      }),
    );
  }

  private mapMethodToAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'SELECT';
    }
  }
}

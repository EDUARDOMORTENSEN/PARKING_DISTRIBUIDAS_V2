import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const permissionsHeader = request.headers['x-user-permissions'];
    if (!permissionsHeader) {
      throw new ForbiddenException('El token no contiene permisos');
    }

    const userPermissions = permissionsHeader.split(',').map((p: string) => p.trim());
    const hasPermission = requiredPermissions.some((permission) => userPermissions.includes(permission));
    if (!hasPermission) {
       throw new ForbiddenException(`Faltan permisos. Requeridos: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}

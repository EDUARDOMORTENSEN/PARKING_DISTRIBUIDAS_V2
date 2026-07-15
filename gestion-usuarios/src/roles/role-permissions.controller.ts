import { Controller, Get, Post, Delete, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RolePermissionsService } from './role-permissions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@ApiTags('Role-Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Post(':roleId/permissions/:permissionId')
  @RequirePermissions('ROLES_UPDATE')
  @ApiOperation({ summary: 'Asignar permiso a rol', description: 'Asigna un permiso específico a un rol' })
  @ApiParam({ name: 'roleId', description: 'UUID del rol' })
  @ApiParam({ name: 'permissionId', description: 'UUID del permiso' })
  @ApiResponse({ status: 201, description: 'Permiso asignado exitosamente' })
  assignPermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    return this.rolePermissionsService.assignPermission(roleId, permissionId);
  }

  @Delete(':roleId/permissions/:permissionId')
  @RequirePermissions('ROLES_UPDATE')
  @ApiOperation({ summary: 'Remover permiso de rol', description: 'Remueve un permiso específico de un rol' })
  @ApiParam({ name: 'roleId', description: 'UUID del rol' })
  @ApiParam({ name: 'permissionId', description: 'UUID del permiso' })
  @ApiResponse({ status: 200, description: 'Permiso removido exitosamente' })
  removePermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    return this.rolePermissionsService.removePermission(roleId, permissionId);
  }

  @Get(':roleId/permissions')
  @RequirePermissions('ROLES_READ')
  @ApiOperation({ summary: 'Listar permisos de un rol', description: 'Obtiene todos los permisos asignados a un rol' })
  @ApiParam({ name: 'roleId', description: 'UUID del rol' })
  findByRole(@Param('roleId', ParseUUIDPipe) roleId: string) {
    return this.rolePermissionsService.findByRole(roleId);
  }
}

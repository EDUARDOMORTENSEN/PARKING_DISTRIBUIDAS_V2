import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RoleusersService } from './roleusers.service';
import { CreateRoleuserDto } from './dto/create-roleuser.dto';
import { UpdateRoleuserDto } from './dto/update-roleuser.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@ApiTags('Role-Users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@Controller('roleusers')
export class RoleusersController {
  constructor(private readonly roleusersService: RoleusersService) {}

  // POST /roleusers  { id_user, id_role, active? }
  @Post()
  @RequirePermissions('ROLEUSERS_CREATE')
  @ApiOperation({ summary: 'Asignar rol a usuario', description: 'Crea una nueva asignación de rol a un usuario' })
  @ApiResponse({ status: 201, description: 'Rol asignado al usuario exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'La asignación ya existe' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  create(@Body() createRoleuserDto: CreateRoleuserDto) {
    return this.roleusersService.create(createRoleuserDto);
  }

  // GET /roleusers
  @Get()
  @RequirePermissions('ROLEUSERS_READ')
  @ApiOperation({ summary: 'Listar asignaciones rol-usuario', description: 'Obtiene todas las asignaciones de roles a usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones obtenida exitosamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findAll() {
    return this.roleusersService.findAll();
  }

  // GET /roleusers/user/:id_user  — todas las asignaciones de un usuario
  @Get('user/:id_user')
  @RequirePermissions('ROLEUSERS_READ')
  @ApiOperation({ summary: 'Obtener roles de un usuario', description: 'Lista todas las asignaciones de rol de un usuario específico' })
  @ApiParam({ name: 'id_user', description: 'UUID del usuario', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Asignaciones del usuario obtenidas' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findByUser(@Param('id_user', ParseUUIDPipe) id_user: string) {
    return this.roleusersService.findByUser(id_user);
  }

  @Get('role/:role_name')
  @RequirePermissions('ROLEUSERS_READ')
  @ApiOperation({ summary: 'Obtener usuarios por rol', description: 'Lista todos los usuarios que tienen asignado un rol específico' })
  @ApiParam({ name: 'role_name', description: 'Nombre del rol', example: 'ADMIN' })
  @ApiResponse({ status: 200, description: 'Usuarios con el rol obtenidos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findByRole(@Param('role_name') role_name: string) {
    return this.roleusersService.findByRoleName(role_name);
  }

  // GET /roleusers/:id_user/:id_role  — una asignación específica
  @Get(':id_user/:id_role')
  @RequirePermissions('ROLEUSERS_READ')
  @ApiOperation({ summary: 'Obtener asignación específica', description: 'Busca una asignación rol-usuario por los IDs de usuario y rol' })
  @ApiParam({ name: 'id_user', description: 'UUID del usuario', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiParam({ name: 'id_role', description: 'UUID del rol', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Asignación encontrada' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findOne(
    @Param('id_user', ParseUUIDPipe) id_user: string,
    @Param('id_role', ParseUUIDPipe) id_role: string,
  ) {
    return this.roleusersService.findOne(id_user, id_role);
  }

  // PATCH /roleusers/:id_user/:id_role  { active: boolean }
  @Patch('/activate/:id_user/:id_role')
  @RequirePermissions('ROLEUSERS_UPDATE')
  @ApiOperation({ summary: 'Activar asignación rol-usuario', description: 'Activa una asignación de rol a usuario previamente desactivada' })
  @ApiParam({ name: 'id_user', description: 'UUID del usuario', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiParam({ name: 'id_role', description: 'UUID del rol', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Asignación activada exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  activate(
    @Param('id_user', ParseUUIDPipe) id_user: string,
    @Param('id_role', ParseUUIDPipe) id_role: string
  ) {
    return this.roleusersService.activate(id_user, id_role);
  }

  @Patch('/deactivate/:id_user/:id_role')
  @RequirePermissions('ROLEUSERS_DELETE')
  @ApiOperation({ summary: 'Desactivar asignación rol-usuario', description: 'Desactiva una asignación de rol a usuario (borrado lógico)' })
  @ApiParam({ name: 'id_user', description: 'UUID del usuario', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiParam({ name: 'id_role', description: 'UUID del rol', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Asignación desactivada exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  deactivate(
    @Param('id_user', ParseUUIDPipe) id_user: string,
    @Param('id_role', ParseUUIDPipe) id_role: string,
  ) {
    return this.roleusersService.deactivate(id_user, id_role);
  }

  // DELETE /roleusers/:id_user/:id_role
  @Delete(':id_user/:id_role')
  @RequirePermissions('ROLEUSERS_DELETE')
  @ApiOperation({ summary: 'Eliminar asignación rol-usuario', description: 'Elimina una asignación de rol a usuario de forma permanente' })
  @ApiParam({ name: 'id_user', description: 'UUID del usuario', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiParam({ name: 'id_role', description: 'UUID del rol', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Asignación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  remove(
    @Param('id_user', ParseUUIDPipe) id_user: string,
    @Param('id_role', ParseUUIDPipe) id_role: string,
  ) {
    return this.roleusersService.remove(id_user, id_role);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions('ROLES_CREATE')
  @ApiOperation({ summary: 'Crear rol', description: 'Registra un nuevo rol en el sistema.' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos o rol no pertenece al enum' })
  @ApiResponse({ status: 409, description: 'Ya existe un rol con ese nombre' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions('ROLES_READ')
  @ApiOperation({ summary: 'Listar roles', description: 'Obtiene la lista de todos los roles del sistema' })
  @ApiResponse({ status: 200, description: 'Lista de roles obtenida exitosamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('available')
  @RequirePermissions('ROLES_READ')
  @ApiOperation({ summary: 'Listar roles disponibles', description: 'Devuelve los nombres de todos los roles' })
  @ApiResponse({ status: 200, description: 'Lista de nombres de roles disponibles' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  getAvailableRoles() {
    return this.rolesService.getAvailableRoles();
  }

  @Get(':id')
  @RequirePermissions('ROLES_READ')
  @ApiOperation({ summary: 'Obtener rol por ID', description: 'Busca un rol por su identificador UUID' })
  @ApiParam({ name: 'id', description: 'UUID del rol', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Rol encontrado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Get('/name/:name')
  @RequirePermissions('ROLES_READ')
  @ApiOperation({ summary: 'Obtener rol por nombre', description: 'Busca un rol por su nombre' })
  @ApiParam({ name: 'name', description: 'Nombre del rol', example: 'ADMIN' })
  @ApiResponse({ status: 200, description: 'Rol encontrado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findByName(@Param('name') name: string){
    return this.rolesService.findByName(name);
  }

  @Patch('/activate/:id')
  @RequirePermissions('ROLES_UPDATE')
  @ApiOperation({ summary: 'Activar rol', description: 'Activa un rol previamente desactivado' })
  @ApiParam({ name: 'id', description: 'UUID del rol a activar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Rol activado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  activate(@Param('id') id: string) {
    return this.rolesService.activate(id);
  }

  @Patch('/deactivate/:id')
  @RequirePermissions('ROLES_DELETE')
  @ApiOperation({ summary: 'Desactivar rol', description: 'Desactiva un rol (borrado lógico)' })
  @ApiParam({ name: 'id', description: 'UUID del rol a desactivar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Rol desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  deactivate(@Param('id') id: string) {
    return this.rolesService.deactivate(id);
  }

  @Patch(':id')
  @RequirePermissions('ROLES_UPDATE')
  @ApiOperation({ summary: 'Actualizar rol', description: 'Actualiza los datos de un rol existente' })
  @ApiParam({ name: 'id', description: 'UUID del rol a actualizar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions('ROLES_DELETE')
  @ApiOperation({ summary: 'Eliminar rol', description: 'Elimina un rol del sistema de forma permanente' })
  @ApiParam({ name: 'id', description: 'UUID del rol a eliminar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Rol eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}

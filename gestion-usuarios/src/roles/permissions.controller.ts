import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions('ROLES_CREATE')
  @ApiOperation({ summary: 'Crear permiso', description: 'Crea un nuevo permiso en el sistema' })
  @ApiResponse({ status: 201, description: 'Permiso creado' })
  @ApiResponse({ status: 409, description: 'El permiso ya existe' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  @RequirePermissions('ROLES_READ')
  @ApiOperation({ summary: 'Listar permisos', description: 'Obtiene todos los permisos' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('ROLES_READ')
  @ApiOperation({ summary: 'Obtener permiso por ID' })
  @ApiParam({ name: 'id', description: 'UUID del permiso' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('ROLES_UPDATE')
  @ApiOperation({ summary: 'Actualizar permiso', description: 'Modifica nombre o descripción de un permiso' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(id, dto);
  }

  @Patch(':id/activate')
  @RequirePermissions('ROLES_UPDATE')
  @ApiOperation({ summary: 'Activar permiso' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.activate(id);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('ROLES_DELETE')
  @ApiOperation({ summary: 'Desactivar permiso (soft delete)' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.deactivate(id);
  }
}

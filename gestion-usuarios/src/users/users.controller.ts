import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @Get()
  @RequirePermissions('USUARIOS_READ')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar usuarios', description: 'Obtiene la lista de todos los usuarios registrados' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findAll(@Req() req: any) {
    if (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('ROOT')) {
      throw new ForbiddenException('No cuenta con los privilegios para listar todos los usuarios');
    }
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('USUARIOS_READ')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario por ID', description: 'Busca un usuario por su identificador UUID' })
  @ApiParam({ name: 'id', description: 'UUID del usuario', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findOne(@Param('id') id: string, @Req() req: any) {
    if (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('ROOT') && req.user.userId !== id) {
      throw new ForbiddenException('Solo puede ver sus propios datos');
    }
    return this.usersService.findOne(id);
  }

  @Get('username/:username')
  @RequirePermissions('USUARIOS_READ')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario por username', description: 'Busca un usuario por su nombre de usuario' })
  @ApiParam({ name: 'username', description: 'Nombre de usuario', example: 'juan.perez' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findByUsername(@Param('username') username: string, @Req() req: any) {
    if (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('ROOT') && req.user.username !== username) {
      throw new ForbiddenException('Solo puede ver sus propios datos');
    }
    return this.usersService.findByUsername(username);
  }

  @Patch(':id')
  @RequirePermissions('USUARIOS_UPDATE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar usuario', description: 'Actualiza los datos de un usuario existente' })
  @ApiParam({ name: 'id', description: 'UUID del usuario a actualizar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    if (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('ROOT') && req.user.userId !== id) {
      throw new ForbiddenException('Solo puede actualizar sus propios datos');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('/activate/:id')
  @RequirePermissions('USUARIOS_UPDATE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar usuario', description: 'Activa un usuario previamente desactivado' })
  @ApiParam({ name: 'id', description: 'UUID del usuario a activar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Usuario activado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Patch('/deactivate/:id')
  @RequirePermissions('USUARIOS_DELETE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar usuario', description: 'Desactiva un usuario (borrado lógico)' })
  @ApiParam({ name: 'id', description: 'UUID del usuario a desactivar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}

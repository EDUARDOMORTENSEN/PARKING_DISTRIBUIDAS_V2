import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Personas')
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear persona', description: 'Registra una nueva persona en el sistema' })
  @ApiResponse({ status: 201, description: 'Persona creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe una persona con ese DNI o email' })
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('USUARIOS_READ')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar personas', description: 'Obtiene la lista de todas las personas registradas' })
  @ApiResponse({ status: 200, description: 'Lista de personas obtenida exitosamente' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findAll() {
    return this.personasService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('USUARIOS_READ')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener persona por ID', description: 'Busca una persona por su identificador UUID' })
  @ApiParam({ name: 'id', description: 'UUID de la persona', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Persona encontrada' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  @Get('exists/:id')
  @ApiOperation({ summary: 'Verificar si persona existe', description: 'Endpoint ligero y público para validación entre microservicios' })
  @ApiParam({ name: 'id', description: 'UUID de la persona', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Devuelve si existe o no' })
  async checkExists(@Param('id') id: string) {
    try {
      await this.personasService.findOne(id);
      return { exists: true };
    } catch {
      return { exists: false };
    }
  }

  @Get('dni/:dni')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('USUARIOS_READ')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener persona por DNI', description: 'Busca una persona por su cédula ecuatoriana' })
  @ApiParam({ name: 'dni', description: 'Cédula ecuatoriana de 10 dígitos', example: '1712345678' })
  @ApiResponse({ status: 200, description: 'Persona encontrada' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  findByDni(@Param('dni') dni: string) {
    return this.personasService.findByDni(dni);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('USUARIOS_UPDATE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar persona', description: 'Actualiza los datos de una persona existente' })
  @ApiParam({ name: 'id', description: 'UUID de la persona a actualizar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Persona actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personasService.update(id, updatePersonaDto);
  }

  @Patch('/activate/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('USUARIOS_UPDATE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar persona', description: 'Activa una persona previamente desactivada' })
  @ApiParam({ name: 'id', description: 'UUID de la persona a activar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Persona activada exitosamente' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  activate(@Param('id') id: string) {
    return this.personasService.activate(id);
  }

  @Patch('/deactivate/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('USUARIOS_DELETE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar persona', description: 'Desactiva una persona (borrado lógico)' })
  @ApiParam({ name: 'id', description: 'UUID de la persona a desactivar', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @ApiResponse({ status: 200, description: 'Persona desactivada exitosamente' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  @ApiUnauthorizedResponse({ description: 'No autorizado. Token JWT inválido o ausente' })
  deactivate(@Param('id') id: string) {
    return this.personasService.deactivate(id);
  }
}

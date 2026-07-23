import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AsignacionVehiculo } from './entities/asignacion-vehiculo.entity';

@ApiTags('Asignaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  // ──────────────────────────────────────────────────────────────────────
  // RF1: Crear asignación
  // ──────────────────────────────────────────────────────────────────────

  @Post()
  @RequirePermissions('ASIGNACIONES_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear asignación de vehículo a propietario',
    description:
      'Asocia un vehículo a un propietario. Valida existencia en gestion-usuarios y vehiculos-service. ' +
      'Un vehículo solo puede tener una asignación activa a la vez.',
  })
  @ApiResponse({
    status: 201,
    description: 'Asignación creada exitosamente.',
    type: AsignacionVehiculo,
  })
  @ApiConflictResponse({
    description: 'La asignación ya existe o el vehículo ya tiene un propietario activo.',
  })
  @ApiNotFoundResponse({
    description: 'El usuario o el vehículo no existe.',
  })
  create(@Body() createAsignacionDto: CreateAsignacionDto, @Req() request: Request) {
    const token = request.headers['authorization'] as string;
    return this.asignacionesService.create(createAsignacionDto, token);
  }

  // ──────────────────────────────────────────────────────────────────────
  // RF3: Consulta de flota por propietario
  // ──────────────────────────────────────────────────────────────────────

  @Get('propietario/:userId')
  @RequirePermissions('ASIGNACIONES_READ')
  @ApiOperation({
    summary: 'Consultar flota de vehículos de un propietario (RF3)',
    description:
      'Retorna la lista de vehículos activamente asignados a un propietario, ' +
      'enriquecida con tipo (moto, automóvil, etc.) y clasificación (eléctrico, híbrido, combustión) ' +
      'obtenidos del microservicio de vehículos.',
  })
  @ApiParam({
    name: 'userId',
    description: 'UUID del propietario en gestion-usuarios',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vehículos del propietario con detalle.',
  })
  findFlotaPorPropietario(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() request: Request,
  ) {
    const token = request.headers['authorization'] as string;
    return this.asignacionesService.findFlotaPorPropietario(userId, token);
  }

  @Get('vehiculo/:vehicleId/activo')
  @RequirePermissions('ASIGNACIONES_READ')
  @ApiOperation({
    summary: 'Consultar asignación activa por vehículo',
    description: 'Retorna la asignación activa para un vehículo específico. Utilizado por ticket-service para inferir el propietario.',
  })
  @ApiParam({
    name: 'vehicleId',
    description: 'UUID del vehículo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación activa encontrada.',
    type: AsignacionVehiculo,
  })
  @ApiNotFoundResponse({ description: 'No existe asignación activa para el vehículo.' })
  findActivaPorVehiculo(@Param('vehicleId', ParseUUIDPipe) vehicleId: string) {
    return this.asignacionesService.findActivaPorVehiculo(vehicleId);
  }

  // ──────────────────────────────────────────────────────────────────────
  // Consultas generales
  // ──────────────────────────────────────────────────────────────────────

  @Get()
  @RequirePermissions('ASIGNACIONES_READ')
  @ApiOperation({
    summary: 'Listar todas las asignaciones',
    description: 'Retorna todas las asignaciones (activas e inactivas).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de asignaciones retornada exitosamente.',
    type: [AsignacionVehiculo],
  })
  findAll() {
    return this.asignacionesService.findAll();
  }

  @Get(':userId/:vehicleId')
  @RequirePermissions('ASIGNACIONES_READ')
  @ApiOperation({ summary: 'Consultar una asignación específica por clave compuesta' })
  @ApiParam({
    name: 'userId',
    description: 'UUID del propietario',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiParam({
    name: 'vehicleId',
    description: 'UUID del vehículo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación encontrada.',
    type: AsignacionVehiculo,
  })
  @ApiNotFoundResponse({ description: 'Asignación no encontrada.' })
  findOne(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return this.asignacionesService.findOne(userId, vehicleId);
  }

  // ──────────────────────────────────────────────────────────────────────
  // Modificación y baja lógica
  // ──────────────────────────────────────────────────────────────────────

  @Patch(':userId/:vehicleId')
  @RequirePermissions('ASIGNACIONES_UPDATE')
  @ApiOperation({
    summary: 'Modificar una asignación',
    description:
      'Actualiza el estado (activa/inactiva) o las notas de una asignación. ' +
      'La clave compuesta (userId, vehicleId) no puede modificarse.',
  })
  @ApiParam({ name: 'userId', description: 'UUID del propietario' })
  @ApiParam({ name: 'vehicleId', description: 'UUID del vehículo' })
  @ApiResponse({
    status: 200,
    description: 'Asignación modificada exitosamente.',
    type: AsignacionVehiculo,
  })
  @ApiNotFoundResponse({ description: 'Asignación no encontrada.' })
  update(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() updateAsignacionDto: UpdateAsignacionDto,
  ) {
    return this.asignacionesService.update(userId, vehicleId, updateAsignacionDto);
  }

  @Delete(':userId/:vehicleId')
  @RequirePermissions('ASIGNACIONES_DELETE')
  @ApiOperation({
    summary: 'Desactivar una asignación (baja lógica)',
    description:
      'Marca la asignación como inactiva. No elimina el registro físicamente ' +
      'para preservar el historial de auditoría.',
  })
  @ApiParam({ name: 'userId', description: 'UUID del propietario' })
  @ApiParam({ name: 'vehicleId', description: 'UUID del vehículo' })
  @ApiResponse({ status: 200, description: 'Asignación desactivada exitosamente.' })
  @ApiNotFoundResponse({ description: 'Asignación no encontrada.' })
  @ApiConflictResponse({ description: 'La asignación ya estaba inactiva.' })
  remove(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return this.asignacionesService.remove(userId, vehicleId);
  }
}

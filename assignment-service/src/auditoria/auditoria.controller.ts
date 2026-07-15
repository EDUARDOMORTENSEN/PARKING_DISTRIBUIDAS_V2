import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaAsignacion } from './entities/auditoria-asignacion.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@ApiTags('Auditoría')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @RequirePermissions('ASIGNACIONES_READ')
  @ApiOperation({
    summary: 'Listar todos los eventos de auditoría',
    description:
      'Retorna el historial completo de eventos de trazabilidad, ordenados por fecha descendente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos de auditoría.',
    type: [AuditoriaAsignacion],
  })
  findAll() {
    return this.auditoriaService.findAll();
  }

  @Get(':userId/:vehicleId')
  @RequirePermissions('ASIGNACIONES_READ')
  @ApiOperation({
    summary: 'Historial de auditoría por clave compuesta',
    description:
      'Retorna todos los eventos de trazabilidad para una combinación específica de propietario + vehículo.',
  })
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
    description: 'Historial de auditoría de la clave compuesta indicada.',
    type: [AuditoriaAsignacion],
  })
  @ApiNotFoundResponse({ description: 'No se encontraron registros.' })
  findByClaveCompuesta(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return this.auditoriaService.findByClaveCompuesta(userId, vehicleId);
  }
}

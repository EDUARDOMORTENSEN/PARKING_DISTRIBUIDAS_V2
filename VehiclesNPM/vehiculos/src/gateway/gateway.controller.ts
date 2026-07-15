import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiProperty } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';
import { IngresoDto } from './dto/ingreso.dto';
import { SalidaDto } from './dto/salida.dto';
import { RegistroEIngresoDto } from './dto/registro-e-ingreso.dto';

// Clase auxiliar solo para que Swagger muestre el ejemplo de respuesta
// de consultarVehiculo sin necesidad de una entidad completa.
class VehiculoEstadoResponse {
  @ApiProperty({ example: true }) registrado!: boolean;
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', required: false }) id?: string;
  @ApiProperty({ example: 'ABC-1234', required: false }) placa?: string;
  @ApiProperty({ example: 'auto', required: false }) tipo?: string;
  @ApiProperty({ example: 'Gasolina', required: false }) clasificacion?: string;
  @ApiProperty({ example: 'fuera', enum: ['fuera', 'dentro'], required: false }) estado?: string;
  @ApiProperty({ example: true, required: false }) activo?: boolean;
}

class IngresoResponse {
  @ApiProperty({ example: true }) autorizado!: boolean;
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' }) vehiculoId!: string;
  @ApiProperty({ example: 'ABC-1234' }) placa!: string;
  @ApiProperty({ example: 'auto' }) tipo!: string;
  @ApiProperty({ example: 'Gasolina' }) clasificacion!: string;
  @ApiProperty({ example: '2026-06-21T15:04:00.000Z' }) fechaIngreso!: Date;
}

class SalidaResponse {
  @ApiProperty({ example: true }) autorizado!: boolean;
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' }) vehiculoId!: string;
  @ApiProperty({ example: 'ABC-1234' }) placa!: string;
  @ApiProperty({ example: '2026-06-21T15:04:00.000Z' }) fechaIngreso!: Date;
  @ApiProperty({ example: '2026-06-21T17:30:00.000Z' }) fechaSalida!: Date;
}

@ApiTags('gateway')
@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('vehiculos/:placa')
  @ApiOperation({
    summary: 'Consultar estado de un vehículo por placa',
    description:
      'Preflight que usa el sistema de tickets antes de registrar un ingreso. ' +
      'Devuelve si el vehículo existe, en qué estado está (dentro/fuera) y si está activo. ' +
      'Responde 200 con { registrado: false } si la placa no existe — no lanza 404.',
  })
  @ApiParam({ name: 'placa', example: 'ABC-1234', description: 'Placa del vehículo' })
  @ApiResponse({ status: 200, description: 'Consulta exitosa', type: VehiculoEstadoResponse })
  consultarVehiculo(@Param('placa') placa: string) {
    return this.gatewayService.consultarVehiculo(placa);
  }

  @Post('ingresos')
  @ApiOperation({
    summary: 'Autorizar ingreso de un vehículo ya registrado',
    description:
      'Valida que el vehículo exista, esté activo, no tenga ya un ingreso abierto ' +
      'y que haya cupo en ModuloZonas. Si todo pasa, marca el vehículo como DENTRO ' +
      'y devuelve los datos para que el sistema de tickets emita el ticket de entrada.',
  })
  @ApiBody({ type: IngresoDto })
  @ApiResponse({ status: 200, description: 'Ingreso autorizado', type: IngresoResponse })
  @ApiResponse({ status: 403, description: 'Vehículo bloqueado administrativamente' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya tiene un ingreso activo o no hay cupo disponible' })
  @ApiResponse({ status: 503, description: 'ModuloZonas no responde (modo estricto)' })
  autorizarIngreso(@Body() dto: IngresoDto) {
    return this.gatewayService.autorizarIngreso(dto);
  }

  @Post('ingresos/walk-in')
  @ApiOperation({
    summary: 'Registrar vehículo nuevo y autorizar ingreso en un solo paso',
    description:
      'Flujo de garita: el vehículo no está en el sistema. ' +
      'Crea el registro con los datos capturados y, si pasan todas las validaciones, ' +
      'autoriza el ingreso. Si la validación de cupo falla después de crear el registro, ' +
      'la creación se revierte (no quedan registros huérfanos).',
  })
  @ApiBody({ type: RegistroEIngresoDto })
  @ApiResponse({ status: 200, description: 'Vehículo registrado e ingreso autorizado', type: IngresoResponse })
  @ApiResponse({ status: 400, description: 'Datos del vehículo inválidos' })
  @ApiResponse({ status: 409, description: 'La placa ya existe (use el flujo de ingreso normal) o sin cupo' })
  @ApiResponse({ status: 503, description: 'ModuloZonas no responde (modo estricto)' })
  registrarEIngresar(@Body() dto: RegistroEIngresoDto) {
    return this.gatewayService.registrarEIngresar(dto);
  }

  @Post('salidas')
  @ApiOperation({
    summary: 'Autorizar salida de un vehículo',
    description:
      'Valida que el vehículo exista y tenga un ingreso activo (estado DENTRO). ' +
      'Marca el vehículo como FUERA y devuelve las fechas de ingreso y salida ' +
      'para que el sistema de tickets calcule el tiempo y el cobro.',
  })
  @ApiBody({ type: SalidaDto })
  @ApiResponse({ status: 200, description: 'Salida autorizada', type: SalidaResponse })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  @ApiResponse({ status: 409, description: 'El vehículo no tiene un ingreso activo' })
  autorizarSalida(@Body() dto: SalidaDto) {
    return this.gatewayService.autorizarSalida(dto);
  }
}


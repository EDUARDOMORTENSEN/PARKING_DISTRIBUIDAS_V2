import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AsignacionVehiculo } from './entities/asignacion-vehiculo.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import {
  AsignacionCreatedEvent,
  AsignacionDeletedEvent,
  AsignacionUpdatedEvent,
} from './events/asignacion.events';
import { UsuariosClientService } from '../clientes/usuarios-client.service';
import { VehiculosClientService } from '../clientes/vehiculos-client.service';

/**
 * RF1, RF2, RF3 — Servicio principal de asignaciones.
 *
 * Responsabilidades:
 * - CRUD de asignaciones con clave compuesta (userId, vehicleId)
 * - Validación de existencia de usuario y vehículo via HTTP
 * - Emisión de eventos de dominio para el sistema de auditoría
 * - Agregación de datos de vehículos para la consulta de flota (RF3)
 */
@Injectable()
export class AsignacionesService {
  private readonly logger = new Logger(AsignacionesService.name);

  constructor(
    @InjectRepository(AsignacionVehiculo)
    private readonly asignacionRepo: Repository<AsignacionVehiculo>,
    private readonly usuariosClient: UsuariosClientService,
    private readonly vehiculosClient: VehiculosClientService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * RF1 — Crea una nueva asignación usuario ↔ vehículo.
   *
   * Reglas de negocio:
   * 1. El usuario debe existir en gestion-usuarios.
   * 2. El vehículo debe existir en vehiculos-service.
   * 3. El vehículo solo puede tener una asignación ACTIVA a la vez.
   * 4. Un usuario SÍ puede tener múltiples vehículos.
   */
  async create(dto: CreateAsignacionDto, token?: string): Promise<AsignacionVehiculo> {
    // 1. Validar usuario
    const usuarioExiste = await this.usuariosClient.existeUsuario(dto.userId, token);
    if (!usuarioExiste) {
      throw new NotFoundException(
        `El usuario con ID ${dto.userId} no existe en gestion-usuarios`,
      );
    }

    // 2. Validar vehículo
    const vehiculoExiste = await this.vehiculosClient.existeVehiculo(
      dto.vehicleId,
      token,
    );
    if (!vehiculoExiste) {
      throw new NotFoundException(
        `El vehículo con ID ${dto.vehicleId} no existe en vehiculos-service`,
      );
    }

    // 3. Verificar que la clave compuesta no exista ya (activa o no)
    const existente = await this.asignacionRepo.findOne({
      where: { userId: dto.userId, vehicleId: dto.vehicleId },
    });
    if (existente) {
      if (existente.activa) {
        throw new ConflictException(
          `Ya existe una asignación activa para el usuario ${dto.userId} y el vehículo ${dto.vehicleId}`,
        );
      }
      // Si existe pero inactiva, reactivar en vez de duplicar
      throw new ConflictException(
        `Existe una asignación inactiva para esta combinación. Use PATCH para reactivarla.`,
      );
    }

    // 4. Verificar que el vehículo no tenga otro propietario activo
    const asignacionActivaVehiculo = await this.asignacionRepo.findOne({
      where: { vehicleId: dto.vehicleId, activa: true },
    });
    if (asignacionActivaVehiculo) {
      throw new ConflictException(
        `El vehículo ${dto.vehicleId} ya está asignado activamente al usuario ${asignacionActivaVehiculo.userId}`,
      );
    }

    // 5. Persistir la nueva asignación
    const nuevaAsignacion = this.asignacionRepo.create({
      userId: dto.userId,
      vehicleId: dto.vehicleId,
      notas: dto.notas ?? null,
      activa: true,
    });
    const asignacionGuardada = await this.asignacionRepo.save(nuevaAsignacion);

    // 6. Emitir evento de dominio (auditoría desacoplada)
    this.eventEmitter.emit(
      'asignacion.created',
      new AsignacionCreatedEvent(asignacionGuardada),
    );

    this.logger.log(
      `Asignación creada: user=${dto.userId} vehicle=${dto.vehicleId}`,
    );
    return asignacionGuardada;
  }

  /**
   * Retorna todas las asignaciones (activas e inactivas).
   */
  async findAll(): Promise<AsignacionVehiculo[]> {
    return this.asignacionRepo.find();
  }

  /**
   * Retorna una asignación específica por clave compuesta.
   */
  async findOne(userId: string, vehicleId: string): Promise<AsignacionVehiculo> {
    const asignacion = await this.asignacionRepo.findOne({
      where: { userId, vehicleId },
    });
    if (!asignacion) {
      throw new NotFoundException(
        `No existe asignación para user=${userId} y vehicle=${vehicleId}`,
      );
    }
    return asignacion;
  }

  /**
   * Retorna la asignación activa para un vehículo específico.
   * Utilizado para inferir el propietario en el ticket-service.
   */
  async findActivaPorVehiculo(vehicleId: string): Promise<AsignacionVehiculo> {
    const asignacion = await this.asignacionRepo.findOne({
      where: { vehicleId, activa: true },
    });
    if (!asignacion) {
      throw new NotFoundException(
        `No existe una asignación activa para el vehículo ${vehicleId}`,
      );
    }
    return asignacion;
  }

  /**
   * RF3 — Retorna la flota de vehículos de un propietario,
   * enriquecida con tipo y clasificación del servicio de vehículos.
   */
  async findFlotaPorPropietario(userId: string, token?: string): Promise<any[]> {
    const asignaciones = await this.asignacionRepo.find({
      where: { userId, activa: true },
    });

    if (asignaciones.length === 0) {
      return [];
    }

    // Enriquecer con datos de cada vehículo (RF3: tipo + clasificacion)
    const flotaConDetalle = await Promise.allSettled(
      asignaciones.map(async (asig) => {
        try {
          const vehiculoDetalle = await this.vehiculosClient.obtenerVehiculo(
            asig.vehicleId,
            token,
          );
          return {
            userId: asig.userId,
            vehicleId: asig.vehicleId,
            fechaAsignacion: asig.fechaAsignacion,
            notas: asig.notas,
            vehiculo: {
              id: vehiculoDetalle.id,
              placa: vehiculoDetalle.placa,
              marca: vehiculoDetalle.marca,
              modelo: vehiculoDetalle.modelo,
              color: vehiculoDetalle.color,
              anio: vehiculoDetalle.anio,
              tipo: vehiculoDetalle.tipo,
              clasificacion: vehiculoDetalle.clasificacion,
              activo: vehiculoDetalle.activo,
            },
          };
        } catch (error) {
          // Si no se puede obtener el detalle de un vehículo, devolver info parcial
          this.logger.warn(
            `No se pudo obtener detalles del vehículo ${asig.vehicleId}: ${error?.message}`,
          );
          return {
            userId: asig.userId,
            vehicleId: asig.vehicleId,
            fechaAsignacion: asig.fechaAsignacion,
            notas: asig.notas,
            vehiculo: null,
            advertencia: 'No se pudieron obtener los detalles del vehículo',
          };
        }
      }),
    );

    return flotaConDetalle.map((result) =>
      result.status === 'fulfilled' ? result.value : null,
    ).filter(Boolean);
  }

  /**
   * Modifica una asignación existente (notas, estado activo).
   * La clave compuesta (userId, vehicleId) es inmutable.
   */
  async update(
    userId: string,
    vehicleId: string,
    dto: UpdateAsignacionDto,
  ): Promise<AsignacionVehiculo> {
    const asignacionAnterior = await this.findOne(userId, vehicleId);

    // Clonar estado anterior para el evento de auditoría
    const estadoAnterior = { ...asignacionAnterior };

    // Si se está reactivando, verificar que no haya otro propietario activo
    if (dto.activa === true && !asignacionAnterior.activa) {
      const asignacionActivaVehiculo = await this.asignacionRepo.findOne({
        where: { vehicleId, activa: true },
      });
      if (asignacionActivaVehiculo) {
        throw new ConflictException(
          `El vehículo ${vehicleId} ya tiene un propietario activo: ${asignacionActivaVehiculo.userId}`,
        );
      }
    }

    Object.assign(asignacionAnterior, dto);
    const asignacionActualizada = await this.asignacionRepo.save(asignacionAnterior);

    // Emitir evento de dominio
    this.eventEmitter.emit(
      'asignacion.updated',
      new AsignacionUpdatedEvent(estadoAnterior as AsignacionVehiculo, asignacionActualizada),
    );

    this.logger.log(`Asignación modificada: user=${userId} vehicle=${vehicleId}`);
    return asignacionActualizada;
  }

  /**
   * Baja lógica de una asignación (activa = false).
   * No se elimina físicamente para preservar el historial de auditoría.
   */
  async remove(userId: string, vehicleId: string): Promise<{ message: string }> {
    const asignacion = await this.findOne(userId, vehicleId);

    if (!asignacion.activa) {
      throw new ConflictException('La asignación ya está inactiva');
    }

    asignacion.activa = false;
    const asignacionEliminada = await this.asignacionRepo.save(asignacion);

    // Emitir evento de dominio
    this.eventEmitter.emit(
      'asignacion.deleted',
      new AsignacionDeletedEvent(asignacionEliminada),
    );

    this.logger.log(`Asignación desactivada: user=${userId} vehicle=${vehicleId}`);
    return {
      message: `Asignación entre usuario ${userId} y vehículo ${vehicleId} desactivada correctamente`,
    };
  }
}

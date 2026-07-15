import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { AsignacionesService } from '../../src/asignaciones/asignaciones.service';
import { AsignacionVehiculo } from '../../src/asignaciones/entities/asignacion-vehiculo.entity';
import { UsuariosClientService } from '../../src/clientes/usuarios-client.service';
import { VehiculosClientService } from '../../src/clientes/vehiculos-client.service';
import {
  AsignacionCreatedEvent,
  AsignacionDeletedEvent,
  AsignacionUpdatedEvent,
} from '../../src/asignaciones/events/asignacion.events';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockUsuariosClient = {
  existeUsuario: jest.fn(),
  obtenerUsuario: jest.fn(),
};

const mockVehiculosClient = {
  existeVehiculo: jest.fn(),
  obtenerVehiculo: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildAsignacion = (overrides = {}): AsignacionVehiculo => ({
  userId: 'user-uuid-1',
  vehicleId: 'vehicle-uuid-1',
  activa: true,
  notas: null,
  fechaAsignacion: new Date('2026-01-01T00:00:00Z'),
  fechaActualizacion: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('AsignacionesService', () => {
  let service: AsignacionesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsignacionesService,
        { provide: getRepositoryToken(AsignacionVehiculo), useValue: mockRepo },
        { provide: UsuariosClientService, useValue: mockUsuariosClient },
        { provide: VehiculosClientService, useValue: mockVehiculosClient },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<AsignacionesService>(AsignacionesService);
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create()', () => {
    const dto = { userId: 'user-uuid-1', vehicleId: 'vehicle-uuid-1', notas: 'Test' };

    it('debería crear una asignación válida y emitir evento CREATED', async () => {
      mockUsuariosClient.existeUsuario.mockResolvedValue(true);
      mockVehiculosClient.existeVehiculo.mockResolvedValue(true);
      mockRepo.findOne
        .mockResolvedValueOnce(null)  // sin asignación existente por PK
        .mockResolvedValueOnce(null); // sin asignación activa del vehículo
      const asignacion = buildAsignacion();
      mockRepo.create.mockReturnValue(asignacion);
      mockRepo.save.mockResolvedValue(asignacion);

      const result = await service.create(dto);

      expect(result).toEqual(asignacion);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'asignacion.created',
        expect.any(AsignacionCreatedEvent),
      );
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      mockUsuariosClient.existeUsuario.mockResolvedValue(false);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar NotFoundException si el vehículo no existe', async () => {
      mockUsuariosClient.existeUsuario.mockResolvedValue(true);
      mockVehiculosClient.existeVehiculo.mockResolvedValue(false);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ConflictException si la asignación ya existe activa', async () => {
      mockUsuariosClient.existeUsuario.mockResolvedValue(true);
      mockVehiculosClient.existeVehiculo.mockResolvedValue(true);
      mockRepo.findOne.mockResolvedValueOnce(buildAsignacion()); // ya existe activa

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('debería lanzar ConflictException si el vehículo ya tiene otro propietario activo', async () => {
      mockUsuariosClient.existeUsuario.mockResolvedValue(true);
      mockVehiculosClient.existeVehiculo.mockResolvedValue(true);
      mockRepo.findOne
        .mockResolvedValueOnce(null) // sin asignación por PK
        .mockResolvedValueOnce(buildAsignacion({ userId: 'otro-usuario' })); // otro dueño activo

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('debería retornar la asignación si existe', async () => {
      const asignacion = buildAsignacion();
      mockRepo.findOne.mockResolvedValue(asignacion);

      const result = await service.findOne('user-uuid-1', 'vehicle-uuid-1');
      expect(result).toEqual(asignacion);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('user-uuid-1', 'vehicle-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('debería modificar la asignación y emitir evento UPDATED', async () => {
      const asignacion = buildAsignacion();
      const asignacionActualizada = buildAsignacion({ notas: 'Actualizado' });

      mockRepo.findOne.mockResolvedValue(asignacion);
      mockRepo.save.mockResolvedValue(asignacionActualizada);

      const result = await service.update('user-uuid-1', 'vehicle-uuid-1', {
        notas: 'Actualizado',
      });

      expect(result).toEqual(asignacionActualizada);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'asignacion.updated',
        expect.any(AsignacionUpdatedEvent),
      );
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('debería desactivar la asignación y emitir evento DELETED', async () => {
      const asignacion = buildAsignacion();
      mockRepo.findOne.mockResolvedValue(asignacion);
      mockRepo.save.mockResolvedValue({ ...asignacion, activa: false });

      const result = await service.remove('user-uuid-1', 'vehicle-uuid-1');

      expect(result.message).toContain('desactivada correctamente');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'asignacion.deleted',
        expect.any(AsignacionDeletedEvent),
      );
    });

    it('debería lanzar ConflictException si ya estaba inactiva', async () => {
      mockRepo.findOne.mockResolvedValue(buildAsignacion({ activa: false }));

      await expect(
        service.remove('user-uuid-1', 'vehicle-uuid-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('debería retornar todas las asignaciones', async () => {
      const lista = [buildAsignacion(), buildAsignacion({ vehicleId: 'vehicle-uuid-2' })];
      mockRepo.find.mockResolvedValue(lista);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaListener } from '../../src/auditoria/listeners/auditoria.listener';
import { AuditoriaService } from '../../src/auditoria/auditoria.service';
import { TipoAccion } from '../../src/auditoria/entities/auditoria-asignacion.entity';
import {
  AsignacionCreatedEvent,
  AsignacionDeletedEvent,
  AsignacionUpdatedEvent,
} from '../../src/asignaciones/events/asignacion.events';
import { AsignacionVehiculo } from '../../src/asignaciones/entities/asignacion-vehiculo.entity';

// ─── Mock ─────────────────────────────────────────────────────────────────────

const mockAuditoriaService = {
  registrar: jest.fn().mockResolvedValue({ id: 'auditoria-uuid' }),
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

describe('AuditoriaListener', () => {
  let listener: AuditoriaListener;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaListener,
        { provide: AuditoriaService, useValue: mockAuditoriaService },
      ],
    }).compile();

    listener = module.get<AuditoriaListener>(AuditoriaListener);
  });

  // ── handleAsignacionCreated ──────────────────────────────────────────────────

  describe('handleAsignacionCreated()', () => {
    it('debería registrar auditoría de CREACION con payloadAnterior null', async () => {
      const asignacion = buildAsignacion();
      const event = new AsignacionCreatedEvent(asignacion);

      await listener.handleAsignacionCreated(event);

      expect(mockAuditoriaService.registrar).toHaveBeenCalledWith(
        'user-uuid-1',
        'vehicle-uuid-1',
        TipoAccion.CREACION,
        null,                          // payloadAnterior debe ser null en CREACION
        expect.objectContaining({      // payloadNuevo con datos de la asignación
          userId: 'user-uuid-1',
          vehicleId: 'vehicle-uuid-1',
          activa: true,
        }),
      );
    });

    it('no debería propagar excepciones de auditoría al flujo principal', async () => {
      mockAuditoriaService.registrar.mockRejectedValueOnce(new Error('DB error'));
      const event = new AsignacionCreatedEvent(buildAsignacion());

      // No debe lanzar — errores de auditoría son silenciados
      await expect(listener.handleAsignacionCreated(event)).resolves.not.toThrow();
    });
  });

  // ── handleAsignacionUpdated ──────────────────────────────────────────────────

  describe('handleAsignacionUpdated()', () => {
    it('debería registrar auditoría de MODIFICACION con ambos payloads', async () => {
      const anterior = buildAsignacion({ notas: 'Antes' });
      const nueva = buildAsignacion({ notas: 'Después' });
      const event = new AsignacionUpdatedEvent(anterior, nueva);

      await listener.handleAsignacionUpdated(event);

      expect(mockAuditoriaService.registrar).toHaveBeenCalledWith(
        'user-uuid-1',
        'vehicle-uuid-1',
        TipoAccion.MODIFICACION,
        expect.objectContaining({ notas: 'Antes' }),
        expect.objectContaining({ notas: 'Después' }),
      );
    });

    it('no debería propagar excepciones de auditoría al flujo principal', async () => {
      mockAuditoriaService.registrar.mockRejectedValueOnce(new Error('DB error'));
      const event = new AsignacionUpdatedEvent(buildAsignacion(), buildAsignacion());

      await expect(listener.handleAsignacionUpdated(event)).resolves.not.toThrow();
    });
  });

  // ── handleAsignacionDeleted ──────────────────────────────────────────────────

  describe('handleAsignacionDeleted()', () => {
    it('debería registrar auditoría de ELIMINACION con payloadNuevo null', async () => {
      const asignacion = buildAsignacion();
      const event = new AsignacionDeletedEvent(asignacion);

      await listener.handleAsignacionDeleted(event);

      expect(mockAuditoriaService.registrar).toHaveBeenCalledWith(
        'user-uuid-1',
        'vehicle-uuid-1',
        TipoAccion.ELIMINACION,
        expect.objectContaining({    // payloadAnterior con datos previos
          userId: 'user-uuid-1',
          vehicleId: 'vehicle-uuid-1',
          activa: true,
        }),
        null,                        // payloadNuevo debe ser null en ELIMINACION
      );
    });

    it('no debería propagar excepciones de auditoría al flujo principal', async () => {
      mockAuditoriaService.registrar.mockRejectedValueOnce(new Error('DB error'));
      const event = new AsignacionDeletedEvent(buildAsignacion());

      await expect(listener.handleAsignacionDeleted(event)).resolves.not.toThrow();
    });
  });
});

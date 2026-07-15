/**
 * Clave compuesta para AsignacionVehiculo.
 * TypeORM requiere esta clase para operaciones findOne({ where: id })
 * cuando se trabaja con @PrimaryColumn múltiples.
 */
export class AsignacionVehiculoId {
  userId: string;
  vehicleId: string;

  constructor(userId: string, vehicleId: string) {
    this.userId = userId;
    this.vehicleId = vehicleId;
  }
}

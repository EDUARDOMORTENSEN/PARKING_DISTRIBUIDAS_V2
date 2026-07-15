import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionVehiculo } from './entities/asignacion-vehiculo.entity';
import { ClientesModule } from '../clientes/clientes.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsignacionVehiculo]),
    ClientesModule,
    AuthModule,
  ],
  controllers: [AsignacionesController],
  providers: [AsignacionesService],
  exports: [AsignacionesService],
})
export class AsignacionesModule {}

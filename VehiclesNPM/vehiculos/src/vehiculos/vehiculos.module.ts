import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiculo } from './entities/vehiculo.entity';
import { Auto } from './entities/auto.entity';
import { Motocicleta } from './entities/motocicleta.entity';
import { Camioneta } from './entities/camioneta.entity';
import { PersonasClientService } from './personas-client.service';
import { AuthModule } from 'src/auth/auth.module';
import { EventPublisher } from './event-publisher';
import { AuditInterceptor } from './audit.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Auto, Motocicleta, Camioneta]), HttpModule, AuthModule],
  controllers: [VehiculosController],
  providers: [
    VehiculosService, 
    PersonasClientService, 
    EventPublisher,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    }
  ],
  exports: [VehiculosService],
})
export class VehiculosModule {}
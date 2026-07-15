import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ZonasClientService } from './zonas-client.service';
import { VehiculosModule } from '../vehiculos/vehiculos.module';

@Module({
  imports: [HttpModule, VehiculosModule],
  controllers: [GatewayController],
  providers: [GatewayService, ZonasClientService],
})
export class GatewayModule {}

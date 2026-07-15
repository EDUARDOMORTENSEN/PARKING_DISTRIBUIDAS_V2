import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UsuariosClientService } from './usuarios-client.service';
import { VehiculosClientService } from './vehiculos-client.service';

@Module({
  imports: [HttpModule],
  providers: [UsuariosClientService, VehiculosClientService],
  exports: [UsuariosClientService, VehiculosClientService],
})
export class ClientesModule {}

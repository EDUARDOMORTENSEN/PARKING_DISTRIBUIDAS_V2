import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoAuditoria } from './entities/evento-auditoria.entity';
import { AuditConsumer } from './audit.consumer';

@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditConsumer],
  imports: [TypeOrmModule.forFeature([EventoAuditoria])],
})
export class AuditModule {}

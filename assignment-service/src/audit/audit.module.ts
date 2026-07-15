import { Global, Module } from '@nestjs/common';
import { EventPublisher } from './event-publisher';
import { AuditInterceptor } from './audit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module({
  providers: [
    EventPublisher,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [EventPublisher],
})
export class AuditModule {}

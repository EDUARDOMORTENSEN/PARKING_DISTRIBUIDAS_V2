import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Verifica que el servicio esté activo' })
  @ApiResponse({ status: 200, description: 'Servicio activo' })
  getHello(): string {
    return this.appService.getHello();
  }
}

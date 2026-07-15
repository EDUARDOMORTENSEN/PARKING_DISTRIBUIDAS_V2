import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditEventDto } from './dto/create-audit-event.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventoAuditoria } from './entities/evento-auditoria.entity';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new audit event' })
  @ApiResponse({ status: 201, description: 'Audit event created successfully', type: EventoAuditoria   })
  create(@Body() createAuditEventDto: CreateAuditEventDto) {
    return this.auditService.create(createAuditEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all audit events' })
  @ApiResponse({ status: 200, description: 'Audit events retrieved successfully', type: [EventoAuditoria] })
  findAll() {
    return this.auditService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific audit event' })
  @ApiResponse({ status: 200, description: 'Audit event retrieved successfully', type: EventoAuditoria })
  findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuditDto: UpdateAuditDto) {
  //   return this.auditService.update(+id, updateAuditDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.auditService.remove(+id);
  // }
}

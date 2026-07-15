import { OmitType, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['id_person'] as const)) {
  //No permite cambiar el ID ni el activo
  @ApiPropertyOptional({
    description: 'Fecha y hora del último inicio de sesión del usuario',
    example: '2026-06-20T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'last_login debe ser una fecha válida' })
  last_login?: string;
}
import {
  IsString,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleuserDto {
  @ApiProperty({
    description: 'UUID v4 del usuario al que se asigna el rol',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID('4', { message: 'id_user debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El id de usuario es obligatorio' })
  id_user!: string;

  @ApiProperty({
    description: 'Nombre del rol a asignar',
    example: 'ADMIN',
  })
  @IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
  role_name!: string;
}
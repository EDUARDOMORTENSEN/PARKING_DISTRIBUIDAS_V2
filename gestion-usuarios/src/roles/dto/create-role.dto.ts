import {
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SanitizeHtml } from '../../common/transformers/sanitize.transformer';

export class CreateRoleDto {

  @ApiPropertyOptional({
    description: 'Descripción del rol',
    example: 'Rol con permisos de administración del sistema',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La descripción no puede tener más de 255 caracteres' })
  @SanitizeHtml()
  description?: string;

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'ADMIN',
  })
  @IsString({ message: 'El nombre del rol debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
  name!: string;
}
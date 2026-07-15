import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Nombre del permiso (generalmente en MAYÚSCULAS_CON_GUIONES_BAJOS)',
    example: 'USUARIOS_READ',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Descripción detallada de lo que permite hacer el permiso',
    example: 'Permite leer la información de los usuarios',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}

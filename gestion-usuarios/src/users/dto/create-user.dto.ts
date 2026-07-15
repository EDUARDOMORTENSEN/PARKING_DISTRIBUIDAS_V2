import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TrimOnlyLower } from '../../common/transformers/sanitize.transformer';

export class CreateUserDto {

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres, al menos una letra y un número)',
    example: 'Passw0rd123',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede superar los 72 caracteres' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'La contraseña debe contener al menos una letra y un número',
  })
  password!: string;

  @ApiProperty({
    description: 'Nombre de usuario único (solo letras minúsculas, números, puntos, guiones y guiones bajos)',
    example: 'juan.perez',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre de usuario no puede tener más de 50 caracteres' })
  @Matches(/^[a-z0-9._-]+$/, {
    message: 'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos',
  })
  @TrimOnlyLower()
  username!: string;

  @ApiProperty({
    description: 'UUID v4 de la persona asociada al usuario',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID('4', { message: 'id_person debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El id de persona es obligatorio' })
  id_person!: string;
}
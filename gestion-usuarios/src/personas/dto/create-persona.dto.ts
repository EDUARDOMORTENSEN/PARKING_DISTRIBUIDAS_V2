import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEcuadorianDni } from '../../common/validators/is-ecuadorian-dni.validator';
import { TrimAndCollapse, NormalizeEmail, TrimOnly, SanitizeHtml } from '../../common/transformers/sanitize.transformer';

export class CreatePersonaDto {

  @ApiPropertyOptional({
    description: 'Dirección domiciliaria de la persona',
    example: 'Av. 10 de Agosto N34-56 y Naciones Unidas',
  })
  @IsOptional()
  @IsString()
  @TrimOnly()
  @SanitizeHtml()
  address?: string;

  @ApiProperty({
    description: 'Cédula ecuatoriana de 10 dígitos',
    example: '1712345678',
    minLength: 10,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  @MaxLength(10, { message: 'La cédula ecuatoriana debe tener 10 dígitos' })
  @MinLength(10, { message: 'La cédula ecuatoriana debe tener 10 dígitos' })
  @IsEcuadorianDni()
  @TrimOnly()
  dni!: string;

  @ApiProperty({
    description: 'Correo electrónico de la persona',
    example: 'juan.perez@example.com',
    maxLength: 50,
  })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @MaxLength(50, { message: 'El email no puede tener más de 50 caracteres' })
  @NormalizeEmail()
  email!: string;

  @ApiProperty({
    description: 'Primer nombre de la persona',
    example: 'Juan',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty({ message: 'El primer nombre es obligatorio' })
  @MinLength(2, { message: 'El primer nombre debe tener al menos 2 caracteres' })
  @MaxLength(30, { message: 'El primer nombre no puede tener más de 30 caracteres' })
  @Matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El primer nombre solo puede contener letras y espacios',
  })
  @TrimAndCollapse()
  @Matches(/\S/, { message: 'El nombre no puede estar vacío o ser solo espacios' })
  firstName!: string;

  @ApiProperty({
    description: 'Apellido de la persona',
    example: 'Pérez',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(30, { message: 'El apellido no puede tener más de 30 caracteres' })
  @Matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El apellido solo puede contener letras y espacios',
  })
  @TrimAndCollapse()
  @Matches(/\S/, { message: 'El apellido no puede estar vacío o ser solo espacios' })
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Segundo nombre de la persona (opcional)',
    example: 'Carlos',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: 'El segundo nombre no puede tener más de 30 caracteres' })
  @Matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El segundo nombre solo puede contener letras y espacios',
  })
  @Matches(/\S/, { message: 'El segundo nombre no puede estar vacío o ser solo espacios' })
  @TrimAndCollapse()
  middleName?: string;

  @ApiProperty({
    description: 'Nacionalidad de la persona',
    example: 'Ecuatoriana',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty({ message: 'La nacionalidad es obligatoria' })
  @MaxLength(30, { message: 'La nacionalidad no puede tener más de 30 caracteres' })
  @MinLength(3, { message: 'La nacionalidad no puede tener menos de 3 caracteres' })
  @Matches(/^[A-Za-záéíóúÁÉÍÓÚäëïöü\s]+$/, { message: 'La nacionalidad solo puede contener espacios y letras' })
  @TrimAndCollapse()
  nationality!: string;

  @ApiProperty({
    description: 'Número de teléfono de la persona',
    example: '+593991234567',
    minLength: 5,
    maxLength: 17,
  })
  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MaxLength(17, { message: 'El teléfono no puede tener más de 17 dígitos' })
  @MinLength(5, { message: 'El número de teléfono no puede tener menos de 5 dígitos' })
  @Matches(/^\+?[0-9]+$/, { message: 'El teléfono solo puede contener números, espacios, + y -' })
  @TrimOnly()
  phone!: string;
}
import {
  IsIP,
  IsMACAddress,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditEventDto {
  @ApiProperty({
    description: 'El servicio que generó el log de auditoría',
    example: 'vehiculos',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(50)
  @Matches(/^(ms-[a-zA-Z]+)$/, {
    message: 'El servicio debe comenzar con "ms-" seguido de letras.',
  })
  servicio!: string; //ms-users , ms-auth, ms-products, etc.

  
  @ApiProperty({
    description: 'La acción realizada en el servicio',
    example: 'CREATE',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(10)
  @Matches(/^(CREATE|UPDATE|DELETE|LOGIN|LOGOUT|SELECT)$/, {
    message:
      'La acción debe ser una de las siguientes: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, SELECT.',
  })
  accion!: string; //CREATE - UPDATE - DELETE - LOGIN - LOGOUT - SELECT

  @ApiProperty({
    description: 'La entidad afectada por la acción',
    example: 'vehiculo',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(15)
  @Matches(/^[A-Z-]+$/, {
    message: 'El campo solo debe contener letras mayúsculas y guiones medios.',
  })
  entidad!: string;

  @ApiProperty(
    {
      description: 'El ID de la entidad afectada por la acción',
      example: '123e4567-e89b-12d3-a456-426614174000',
      required: false,
    }
  )
  @IsString()
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la entidad debe ser un UUID válido.' })
  entidadId?: string;

  @ApiProperty({
    description: 'El rol del usuario que realizó la acción',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(25)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'El rol solo puede contener letras, números, puntos, guiones bajos y guiones medios.',
  })
  rol!: string;//Obligatorio para el usuario que realiza la acción, opcional para el resto de los casos.

  @ApiProperty({
    description: 'Datos adicionales relacionados con la acción',
    example: { campo1: 'valor1', campo2: 'valor2' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  datos?: Record<string, any>;


  @ApiProperty({
    description: 'El nombre de usuario que realizó la acción',
    example: 'mpareja',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3) //ejemplo: "john.doe"
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'El nombre de usuario solo puede contener letras, números, puntos, guiones bajos y guiones medios.',
  })
  usuario!: string;//Obligatorio para el usuario que realiza la acción, opcional para el resto de los casos.

  @ApiProperty({
    description: 'La dirección IP pública del usuario que realizó la acción',
    example: '12.168.100.1',
  })
  @IsIP('4', { message: 'La dirección IP debe ser una dirección IPv4 válida.' })
  @IsNotEmpty()
  ip!: string; //Obligatorio para el usuario que realiza la acción, opcional para el resto de los casos.

  @ApiProperty({
    description: 'La dirección MAC del usuario que realizó la acción',
    example: '00:11:22:33:44:55',
  })
  @IsMACAddress({
    message: 'La dirección MAC debe ser una dirección MAC válida.',
  })
  @IsOptional()
  mac?: string; //obligatorio para el usuario que realiza la acción, opcional para el resto de los casos.
}
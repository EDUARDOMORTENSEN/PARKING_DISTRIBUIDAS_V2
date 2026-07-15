import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleuserDto {
  @ApiProperty({
    description: 'Estado activo/inactivo de la asignación rol-usuario',
    example: true,
  })
  @IsNotEmpty({ message: 'El campo active es obligatorio para actualizar' })
  @IsBoolean({ message: 'active debe ser un valor booleano' })
  active!: boolean;
}

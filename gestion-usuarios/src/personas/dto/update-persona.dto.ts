import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePersonaDto } from './create-persona.dto';

export class UpdatePersonaDto extends PartialType(OmitType(CreatePersonaDto, ['dni'] as const)) {
  //Excluye el campo de DNI y ahora permite cambiar el activo
}

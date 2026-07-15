import { ChildEntity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

@ChildEntity('Auto')
export class Auto extends Vehiculo{
    @Column()
    capacidadMaletero! : number;

    @Column()
    numeroPuertas! : number;

    obtenerTipo(): string {
        return "auto";
    }
}
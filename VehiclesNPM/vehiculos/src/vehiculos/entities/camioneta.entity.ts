import { ChildEntity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

@ChildEntity('Camioneta')
export class Camioneta extends Vehiculo{
    @Column()
    capacidadCarga! : number;

    @Column()
    cabina! : string;

    obtenerTipo(): string {
        return "camioneta";
    }
}
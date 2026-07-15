import { ChildEntity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

export enum TipoMoto{
    DEPORTIVA='Deportiva',
    SCOOTER='Scooter',
    MOTOCROSS='Motocross'
    //TRICIMOTO='Tricimoto'
}

@ChildEntity('Motocicleta')
export class Motocicleta extends Vehiculo{
    @Column({type : 'enum', enum : TipoMoto})
    tipoMoto! : TipoMoto; 


    obtenerTipo(): string {
        return "motocicleta";
    }
}
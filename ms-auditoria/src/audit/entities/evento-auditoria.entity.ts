import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({name: 'evento_auditoria'})
export class EventoAuditoria {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({
        description: 'El servicio que generó el log de auditoría',
        example: 'vehiculos'
    })
    @Column({type: 'varchar', length: 20})
    servicio!: string;

    @ApiProperty({
        description: 'La acción realizada en el servicio',
        example: 'CREATE'
    })
    @Column({type: 'varchar', length: 15})//CRUD
    accion!: string;

    @ApiProperty({
        description: 'El tipo de entidad afectada por la acción',
        example: 'vehiculo'
    })
    @Column({type: 'varchar', length: 100})
    entidad!: string;

    @ApiProperty({
        description: 'El nombre de usuario que realizó la acción',
        example: 'mpareja'
    })
    @Column({ name: 'username', type : 'varchar', length: 100})
    usuario!: string;

    @ApiProperty({
        description: 'La fecha y hora del evento de auditoría',
        example: '2023-01-01T00:00:00.000Z'
    })
    @Column({type: 'timestamp', precision: 6})
    timestamp!: Date;

    @ApiProperty({
        description: 'El rol del usuario que realizó la acción',
        example: 'admin'
    })
    @Column({type: 'varchar', length: 100})
    rol!: string;

    @ApiProperty({
        description: 'El ID de la entidad afectada por la acción',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @Column({type: 'varchar', length: 100, nullable: true})
    entidadId?: string;

    @ApiProperty({
        description: 'La dirección IP pública del usuario que realizó la acción',
        example: '12.168.100.1'
    })
    @Column({type: 'varchar', length: 15})
    ip!: string; //IP pública del usuario que realiza la acción

    @ApiProperty({
        description: 'La dirección MAC del usuario que realizó la acción',
        example: '00:11:22:33:44:55'
    })
    @Column({type: 'varchar', length: 17})
    mac!: string; //Dirección MAC del usuario que realiza la acción

    @ApiProperty({
        description: 'Datos adicionales relacionados con la acción',
        example: { "campo1": "valor1", "campo2": "valor2" }
    })
    @Column({type: 'jsonb', nullable: true})
    datos?: any;
}

import { User } from "../../users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";

@Entity('persona')
export class Persona {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
 
  @Column({ default: true })
  activo!: boolean;
 
  @Column({ type: 'text', nullable: true })
  address!: string;
 
  @CreateDateColumn()
  created_at!: Date;
 
  @Column({ unique: true })
  dni!: string;
 
  @Column({ unique: true })
  email!: string;
 
  @Column()
  first_name!: string;
 
  @Column()
  last_name!: string;
 
  @Column({ nullable: true })
  middle_name!: string;
 
  @Column()
  nationality!: string;
 
  @Column({ unique: true })
  phone!: string;
 
  @UpdateDateColumn()
  updated_at!: Date;
 
  @OneToOne(() => User, (user) => user.persona)
  user!: User;
}

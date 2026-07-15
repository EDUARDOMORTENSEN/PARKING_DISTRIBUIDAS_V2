import { Persona } from "../../personas/entities/persona.entity";
import { UserRole } from "../../roleusers/entities/roleuser.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
 
  @Column({ default: true })
  active!: boolean;
 
  @CreateDateColumn()
  created_at!: Date;
 
  @Column({ type: 'timestamp', nullable: true })
  last_login!: Date;
 
  @Column()
  password_hash!: string;
 
  @UpdateDateColumn()
  updated_at!: Date;
 
  @Column({ unique: true })
  username!: string;
 
  @Column({ type: 'uuid' })
  id_person!: string;
 
  @OneToOne(() => Persona, (persona) => persona.user)
  @JoinColumn({ name: 'id_person' })
  persona!: Persona;
 
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles!: UserRole[];
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "./permission.entity";

@Entity('role_permission')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
 
  @Column()
  id_role!: string;

  @Column()
  id_permission!: string;
 
  @Column({ default: true })
  active!: boolean;
 
  @CreateDateColumn()
  created_at!: Date;
 
  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Role, (role) => role.rolePermissions)
  @JoinColumn({ name: 'id_role' })
  role!: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
  @JoinColumn({ name: 'id_permission' })
  permission!: Permission;
}

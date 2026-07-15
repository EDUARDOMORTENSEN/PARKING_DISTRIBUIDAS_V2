import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { RolePermission } from "./role-permission.entity";

@Entity('permission')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
 
  @Column({ unique: true })
  name!: string;
 
  @Column({ default: true })
  active!: boolean;
 
  @CreateDateColumn()
  created_at!: Date;
 
  @Column({ type: 'text', nullable: true })
  description!: string;
 
  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions!: RolePermission[];
}

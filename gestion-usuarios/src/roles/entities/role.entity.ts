import { UserRole } from "../../roleusers/entities/roleuser.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { RolePermission } from "./role-permission.entity";

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
 
  @Column({ default: true })
  active!: boolean;
 
  @CreateDateColumn()
  created_at!: Date;
 
  @Column({ type: 'text', nullable: true })
  description!: string;
 
  @Column({
    type: 'varchar',
    unique: true,
  })
  name!: string;
 
  @UpdateDateColumn()
  updated_at!: Date;
 
  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles!: UserRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions!: RolePermission[];
}
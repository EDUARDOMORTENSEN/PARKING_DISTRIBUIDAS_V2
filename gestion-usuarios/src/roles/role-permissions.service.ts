import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
  ) {}

  async assignPermission(roleId: string, permissionId: string): Promise<RolePermission> {
    const role = await this.rolesService.findOne(roleId);
    if (!role.active) throw new ConflictException(`El rol "${role.name}" está inactivo`);
    
    const permission = await this.permissionsService.findOne(permissionId);
    if (!permission.active) throw new ConflictException(`El permiso "${permission.name}" está inactivo`);

    const existing = await this.rolePermissionRepository.findOne({
      where: { id_role: roleId, id_permission: permissionId },
    });

    if (existing) {
      if (existing.active) {
        throw new ConflictException('El rol ya tiene asignado este permiso');
      }
      existing.active = true;
      return this.rolePermissionRepository.save(existing);
    }

    const rp = this.rolePermissionRepository.create({
      id_role: roleId,
      id_permission: permissionId,
    });
    return this.rolePermissionRepository.save(rp);
  }

  async removePermission(roleId: string, permissionId: string): Promise<{ message: string }> {
    const existing = await this.rolePermissionRepository.findOne({
      where: { id_role: roleId, id_permission: permissionId },
    });
    if (!existing) {
      throw new NotFoundException('El rol no tiene asignado este permiso');
    }
    await this.rolePermissionRepository.remove(existing);
    return { message: 'Permiso removido del rol exitosamente' };
  }

  async findByRole(roleId: string): Promise<RolePermission[]> {
    const role = await this.rolesService.findOne(roleId);
    return this.rolePermissionRepository.find({
      where: { id_role: roleId, active: true },
      relations: { permission: true },
    });
  }
}

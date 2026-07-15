import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`El permiso con nombre "${dto.name}" ya existe`);
    }
    const permission = this.permissionRepository.create(dto);
    return this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado`);
    }
    return permission;
  }

  async findByName(name: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { name } });
    if (!permission) {
      throw new NotFoundException(`Permiso con nombre "${name}" no encontrado`);
    }
    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);
    if (dto.name && dto.name !== permission.name) {
      const existing = await this.permissionRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new ConflictException(`El permiso con nombre "${dto.name}" ya existe`);
      }
    }
    Object.assign(permission, dto);
    return this.permissionRepository.save(permission);
  }

  async activate(id: string): Promise<Permission> {
    const permission = await this.findOne(id);
    permission.active = true;
    return this.permissionRepository.save(permission);
  }

  async deactivate(id: string): Promise<Permission> {
    const permission = await this.findOne(id);
    permission.active = false;
    return this.permissionRepository.save(permission);
  }
}

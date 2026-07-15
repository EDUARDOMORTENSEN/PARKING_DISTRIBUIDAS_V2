import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';

import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { RolePermissionsService } from './role-permissions.service';
import { RolePermissionsController } from './role-permissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  controllers: [RolesController, PermissionsController, RolePermissionsController],
  providers: [RolesService, PermissionsService, RolePermissionsService],
  exports: [RolesService, PermissionsService, RolePermissionsService, TypeOrmModule],
})
export class RolesModule {}

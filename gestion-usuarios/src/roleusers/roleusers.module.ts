import { Module } from '@nestjs/common';
import { RoleusersService } from './roleusers.service';
import { RoleusersController } from './roleusers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/roleuser.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UsersService } from 'src/users/users.service';
import { RolesService } from 'src/roles/roles.service';
import { UserRoleDomainListener } from './roleusers.listeners';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User, Role])],
  controllers: [RoleusersController],
  providers: [RoleusersService, UsersService, RolesService, UserRoleDomainListener],
  exports: [RoleusersService],
})
export class RoleusersModule {}

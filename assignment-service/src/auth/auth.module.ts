import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [HttpModule, JwtModule, PassportModule],
  providers: [JwtStrategy, JwtAuthGuard, PermissionsGuard],
  exports: [JwtStrategy, JwtAuthGuard, PermissionsGuard, JwtModule, PassportModule],
})
export class AuthModule {}

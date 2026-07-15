import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt.guard';
import { PermissionsGuard } from './guards/permissions.guard';


@Module({
    providers: [JwtStrategy, JwtAuthGuard, PermissionsGuard],
    exports: [JwtStrategy, JwtAuthGuard, PermissionsGuard, JwtModule, PassportModule],
    imports: [HttpModule, JwtModule, PassportModule],
})
export class AuthModule {}


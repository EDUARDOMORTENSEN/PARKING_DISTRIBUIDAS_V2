import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

import { importSPKI, exportJWK } from 'jose';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);

    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    const { password_hash, ...result } = user;
    return result;
  }

  async login(user: any, ip?: string) {
    const roles = user.userRoles
      .filter((ur: any) => ur.active === true)
      .map((ur: any) => ur.role.name);

    // Extract unique active permissions
    const permissionsSet = new Set<string>();
    user.userRoles
      .filter((ur: any) => ur.active === true)
      .forEach((ur: any) => {
        if (ur.role.rolePermissions) {
          ur.role.rolePermissions
            .filter((rp: any) => rp.active === true && rp.permission.active === true)
            .forEach((rp: any) => {
              permissionsSet.add(rp.permission.name);
            });
        }
      });
    const permissions = Array.from(permissionsSet);

    const payload = {
      sub: user.id,
      username: user.username,
      audience: ["zonas-service", "usuarios-service", "vehiculos-service", "tickets-service"],
      roles,
      permissions,
      ip: ip ?? 'desconocida',
    };

    const access_token = this.jwtService.sign(payload, { keyid: 'main-key-2026' });
    const refresh_token = this.jwtService.sign(payload, { keyid: 'main-key-2026', expiresIn: '30d' });

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshTokens(refreshToken: string, ip?: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOneByUsername(decoded.username);
      
      if (!user || !user.active) {
        throw new UnauthorizedException('Usuario inactivo o no encontrado');
      }

      return this.login(user, ip);
    } catch (e) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }



  async returnPublicKey() {
    const publicKeyBase64 = this.configService.get('JWT_PUBLIC_KEY');
  const pem = Buffer.from(publicKeyBase64, 'base64').toString('utf-8');

  const keyObject = await importSPKI(pem, 'RS256');
  const jwk = await exportJWK(keyObject);

  return {
    keys: [
      {
        ...jwk,
        use: 'sig',
        alg: 'RS256',
        kid: 'main-key-2026', // identificador único de esta clave
      },
    ],
  };
  }
}
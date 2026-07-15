import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT estándar de NestJS/Passport.
 * Aplica la estrategia 'jwt' (JwtStrategy) a cualquier endpoint decorado.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

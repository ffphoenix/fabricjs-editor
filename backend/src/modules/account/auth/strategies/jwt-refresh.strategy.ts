import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { AuthService } from '../auth.service';
import { RefreshTokenPayloadInterface } from '../interfaces/refresh-token-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const secretConfig = configService.get<string>('JWT_REFRESH_TOKEN_SECRET', 'your-refresh-secret-key');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretConfig,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: TokenPayload): RefreshTokenPayloadInterface {
    const refreshToken = req?.get('authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return {
      ...payload,
      refreshToken,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { OAuth2Client } from 'google-auth-library';
import { TokenPayload } from './interfaces/token-payload.interface';
import { type StringValue } from 'ms';

type GoogleProfile = {
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  googleId?: string;
  sub?: string;
  given_name?: string;
  family_name?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async findOrCreateUser(profile: GoogleProfile): Promise<User> {
    // Try find by googleId first if present, then by email
    let user: User | null = null;
    if (profile.googleId) {
      user = await this.usersService.findByGoogleId(profile.googleId);
    }
    if (!user) {
      user = await this.usersService.findByEmail(profile.email);
    }

    if (!user) {
      // Create a new user if one doesn't exist
      user = await this.usersService.create({
        email: profile.email,
        firstName: profile.firstName || profile.given_name || null,
        lastName: profile.lastName || profile.family_name || null,
        password: null, // No password for OAuth users
        provider: 'google',
        googleId: profile.googleId || profile.sub || null,
        pictureUrl: profile.picture || null,
        isActive: true,
        role: 'user',
      });
    } else {
      // Update existing user with latest profile info
      user = await this.usersService.update(user.id, {
        firstName: user.firstName || profile.firstName || profile.given_name || null,
        lastName: user.lastName || profile.lastName || profile.family_name || null,
        provider: 'google',
        googleId: user.googleId || profile.googleId || profile.sub || null,
        pictureUrl: profile.picture || user.pictureUrl || null,
      });
    }

    return user;
  }

  generateAccessToken(user: User): string {
    const payload: TokenPayload = { userId: user.id, email: user.email };
    return this.jwtService.sign<TokenPayload>(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'your-secret-key'),
      expiresIn: this.configService.get<StringValue>('JWT_EXPIRES_IN', '60s'),
    });
  }

  private createRefreshToken(user: User): string {
    const payload: TokenPayload = { userId: user.id, email: user.email };
    return this.jwtService.sign<TokenPayload>(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET', 'your-refresh-secret-key'),
      expiresIn: this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
  }

  async issueTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.createRefreshToken(user);
    await this.usersService.update(user.id, { refreshToken: refreshToken });
    return { accessToken, refreshToken };
  }

  async rotateTokens(userId: number): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      return null;
    }
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.createRefreshToken(user);
    await this.usersService.update(user.id, { refreshToken: refreshToken });
    return { accessToken, refreshToken };
  }

  async isUserRefreshTokenValid(incomingToken: string, userId: number): Promise<boolean> {
    if (!incomingToken || !userId) return false;
    const user = await this.usersService.findOne(userId);

    return user?.refreshToken && user.refreshToken === incomingToken;
  }

  async validateGoogleToken(token: string): Promise<GoogleProfile> {
    const client = new OAuth2Client(this.configService.get<string>('AUTH_GOOGLE_CLIENT_ID'));
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: this.configService.get<string>('AUTH_GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return null;
    }

    return {
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      picture: payload.picture,
      googleId: payload.sub,
      sub: payload.sub,
    };
  }

  async logout(userId: number): Promise<void> {
    const user = await this.usersService.findOne(userId);
    if (!user) return;
    await this.usersService.update(user.id, { refreshToken: '' });
  }
}

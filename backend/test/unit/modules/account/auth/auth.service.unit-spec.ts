import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../../../src/modules/account/auth/auth.service';
import { UsersService } from '../../../../../src/modules/account/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../../../../../src/modules/account/users/user.entity';

// Mock OAuth2Client
jest.mock('google-auth-library');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUsersService = {
    findByGoogleId: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('findOrCreateUser', () => {
    const profile = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      googleId: 'google-123',
      picture: 'pic-url',
    };

    it('should return existing user by googleId', async () => {
      const existingUser = { id: 1, ...profile } as unknown as User;
      mockUsersService.findByGoogleId.mockResolvedValue(existingUser);
      mockUsersService.update.mockResolvedValue(existingUser);

      const result = await authService.findOrCreateUser(profile);

      expect(mockUsersService.findByGoogleId).toHaveBeenCalledWith(profile.googleId);
      expect(mockUsersService.update).toHaveBeenCalled();
      expect(result).toEqual(existingUser);
    });

    it('should return existing user by email if googleId not found', async () => {
      mockUsersService.findByGoogleId.mockResolvedValue(null);
      const existingUser = { id: 1, email: profile.email } as unknown as User;
      mockUsersService.findByEmail.mockResolvedValue(existingUser);
      mockUsersService.update.mockResolvedValue(existingUser);

      const result = await authService.findOrCreateUser(profile);

      expect(mockUsersService.findByGoogleId).toHaveBeenCalledWith(profile.googleId);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(profile.email);
      expect(mockUsersService.update).toHaveBeenCalled();
      expect(result).toEqual(existingUser);
    });

    it('should create new user if not found', async () => {
      mockUsersService.findByGoogleId.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(null);
      const newUser = { id: 1, ...profile } as unknown as User;
      mockUsersService.create.mockResolvedValue(newUser);

      const result = await authService.findOrCreateUser(profile);

      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: profile.email,
          googleId: profile.googleId,
        }),
      );
      expect(result).toEqual(newUser);
    });
  });

  describe('validateGoogleToken', () => {
    it('should return profile on valid token', async () => {
      const token = 'valid-token';
      const payload = {
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
        picture: 'pic-url',
        sub: 'google-123',
      };

      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => payload,
      });

      (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken,
      }));

      mockConfigService.get.mockReturnValue('client-id');

      const result = await authService.validateGoogleToken(token);

      expect(result).toEqual({
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
        googleId: payload.sub,
        sub: payload.sub,
      });
    });

    it('should return null on invalid token', async () => {
      const token = 'invalid-token';
      // Simulate successful verification but with no payload returned
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => undefined,
      });
      (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({
        verifyIdToken: mockVerifyIdToken,
      }));

      mockConfigService.get.mockReturnValue('client-id');

      const result = await authService.validateGoogleToken(token);

      expect(result).toBeNull();
    });
  });

  describe('issueTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const user = { id: 1, email: 'test@example.com' } as unknown as User;
      mockJwtService.sign.mockReturnValue('token');
      mockUsersService.update.mockResolvedValue(user);

      const result = await authService.issueTokens(user);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockUsersService.update).toHaveBeenCalledWith(user.id, expect.objectContaining({ refreshToken: 'token' }));
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
    });
  });

  describe('rotateTokens', () => {
    it('should return null if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      const result = await authService.rotateTokens(1);
      expect(result).toBeNull();
    });

    it('should rotate tokens if user found', async () => {
      const user = { id: 1, email: 'test@example.com' } as unknown as User;
      mockUsersService.findOne.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('token');
      mockUsersService.update.mockResolvedValue(user);

      const result = await authService.rotateTokens(1);
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
    });
  });

  describe('isUserRefreshTokenValid', () => {
    it('should return false if token is missing', async () => {
      const result = await authService.isUserRefreshTokenValid(null, 1);
      expect(result).toBeFalsy();
    });

    it('should return true if token matches', async () => {
      const user = { id: 1, refreshToken: 'valid-token' } as unknown as User;
      mockUsersService.findOne.mockResolvedValue(user);
      const result = await authService.isUserRefreshTokenValid('valid-token', 1);
      expect(result).toBeTruthy();
    });

    it('should return false if token does not match', async () => {
      const user = { id: 1, refreshToken: 'valid-token' } as unknown as User;
      mockUsersService.findOne.mockResolvedValue(user);
      const result = await authService.isUserRefreshTokenValid('invalid-token', 1);
      expect(result).toBeFalsy();
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      const user = { id: 1 } as unknown as User;
      mockUsersService.findOne.mockResolvedValue(user);
      await authService.logout(1);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, { refreshToken: '' });
    });

    it('should do nothing if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      await authService.logout(1);
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
  });
});

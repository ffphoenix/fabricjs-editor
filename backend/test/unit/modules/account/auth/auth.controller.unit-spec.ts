import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../../../src/modules/account/auth/auth.controller';
import { AuthService } from '../../../../../src/modules/account/auth/auth.service';
import { GoogleLoginDto } from '../../../../../src/modules/account/auth/dto/google-login.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../../../../src/modules/account/users/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateGoogleToken: jest.fn(),
    findOrCreateUser: jest.fn(),
    issueTokens: jest.fn(),
    isUserRefreshTokenValid: jest.fn(),
    rotateTokens: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleLogin', () => {
    const dto: GoogleLoginDto = {
      credentialResponse: {
        credential: 'valid-token',
      },
    };

    it('should throw BAD_REQUEST if no token', async () => {
      const invalidDto: GoogleLoginDto = { credentialResponse: { credential: '' } };
      await expect(controller.googleLogin(invalidDto)).rejects.toThrow(HttpException);
    });

    it('should throw UNAUTHORIZED if invalid token', async () => {
      mockAuthService.validateGoogleToken.mockResolvedValue(null);
      await expect(controller.googleLogin(dto)).rejects.toThrow(new HttpException('Invalid Google token', HttpStatus.UNAUTHORIZED));
    });

    it('should login successfuly', async () => {
      const profile = { email: 'test@test.com' };
      const user = { id: 1 } as User;
      const tokens = { accessToken: 'at', refreshToken: 'rt' };

      mockAuthService.validateGoogleToken.mockResolvedValue(profile);
      mockAuthService.findOrCreateUser.mockResolvedValue(user);
      mockAuthService.issueTokens.mockResolvedValue(tokens);

      const result = await controller.googleLogin(dto);

      expect(mockAuthService.validateGoogleToken).toHaveBeenCalledWith('valid-token');
      expect(mockAuthService.findOrCreateUser).toHaveBeenCalledWith(profile);
      expect(mockAuthService.issueTokens).toHaveBeenCalledWith(user);
      expect(result).toEqual(tokens);
    });
  });

  describe('refresh', () => {
    const request = {
      user: { userId: 1, refreshToken: 'rt' },
    } as unknown as Request;

    it('should return rotated tokens if valid', async () => {
      const tokens = { accessToken: 'at', refreshToken: 'rt' };
      mockAuthService.isUserRefreshTokenValid.mockResolvedValue(true);
      mockAuthService.rotateTokens.mockResolvedValue(tokens);

      const result = await controller.refresh(request);

      expect(mockAuthService.isUserRefreshTokenValid).toHaveBeenCalledWith('rt', 1);
      expect(mockAuthService.rotateTokens).toHaveBeenCalledWith(1);
      expect(result).toEqual(tokens);
    });

    it('should throw UNAUTHORIZED if invalid refresh token', async () => {
      mockAuthService.isUserRefreshTokenValid.mockResolvedValue(false);
      await expect(controller.refresh(request)).rejects.toThrow(new HttpException('Invalid refresh token2', HttpStatus.UNAUTHORIZED));
    });

    it('should throw UNAUTHORIZED if rotation fails', async () => {
      mockAuthService.isUserRefreshTokenValid.mockResolvedValue(true);
      mockAuthService.rotateTokens.mockResolvedValue(null);
      await expect(controller.refresh(request)).rejects.toThrow(new HttpException('Invalid refresh token1', HttpStatus.UNAUTHORIZED));
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const request = { user: { userId: 1 } } as unknown as Request;
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(request);

      expect(mockAuthService.logout).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true });
    });
  });
});

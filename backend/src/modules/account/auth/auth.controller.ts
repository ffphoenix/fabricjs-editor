import { Controller, Post, Body, HttpStatus, HttpException, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ErrorResponse } from '../../../common/interfaces/errorResponse.interface';
import { GoogleLoginDto } from './dto/google-login.dto';
import { Request } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { User } from '../users/user.entity';
import { JwtTokensResponse } from './interfaces/jwt-tokens-response.interface';
import { RefreshTokenPayloadInterface } from './interfaces/refresh-token-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google/login')
  @ApiOperation({ summary: 'Login with Google' })
  @ApiBody({ type: GoogleLoginDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful', type: JwtTokensResponse })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request', type: ErrorResponse })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized', type: ErrorResponse })
  async googleLogin(@Body() body: GoogleLoginDto) {
    try {
      const idToken = body.credentialResponse?.credential;

      if (!idToken) {
        throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
      }

      const profile = await this.authService.validateGoogleToken(idToken);
      if (!profile) {
        throw new HttpException('Invalid Google token', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.authService.findOrCreateUser(profile);

      return this.authService.issueTokens(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Authentication failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('refresh')
  @Public()
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token refreshed', type: JwtTokensResponse })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid refresh token', type: ErrorResponse })
  async refresh(@Req() request: Request) {
    const payload = request.user as RefreshTokenPayloadInterface;
    if (await this.authService.isUserRefreshTokenValid(payload.refreshToken, payload.userId)) {
      const rotatedTokens = await this.authService.rotateTokens(payload.userId);
      if (!rotatedTokens) {
        throw new HttpException('Invalid refresh token1', HttpStatus.UNAUTHORIZED);
      }
      return rotatedTokens;
    }
    throw new HttpException('Invalid refresh token2', HttpStatus.UNAUTHORIZED);
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Logout (clear refresh token)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logged out' })
  async logout(@Req() request: Request) {
    const user = request.user as RefreshTokenPayloadInterface;
    await this.authService.logout(user.userId);
    return { success: true };
  }
}

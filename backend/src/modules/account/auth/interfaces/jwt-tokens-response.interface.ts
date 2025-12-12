import { ApiProperty } from '@nestjs/swagger';

export class JwtTokensResponse {
  @ApiProperty({ description: 'access token' })
  accessToken: string;
  @ApiProperty({ description: 'refresh token' })
  refreshToken: string;
}

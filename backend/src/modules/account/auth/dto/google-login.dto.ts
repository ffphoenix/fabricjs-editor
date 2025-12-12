import { ApiProperty } from '@nestjs/swagger';

export class CredentialResponseDto {
  @ApiProperty({
    description: 'Google ID token (JWT) returned by Google One Tap / OAuth',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  credential!: string;
}

export class GoogleLoginDto {
  @ApiProperty({ type: () => CredentialResponseDto })
  credentialResponse!: CredentialResponseDto;
}

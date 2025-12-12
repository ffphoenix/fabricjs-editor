export interface RefreshTokenPayloadInterface {
  userId: number;
  email?: string;
  refreshToken: string;
}

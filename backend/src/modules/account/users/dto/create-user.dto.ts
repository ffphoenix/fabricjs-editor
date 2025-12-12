import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider, UserRole } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email!: string;

  @ApiProperty({ example: 'password123', description: 'User password', required: false })
  password?: string;

  @ApiProperty({ example: 'John', description: 'User first name', required: false })
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'User last name', required: false })
  lastName?: string;

  @ApiProperty({ enum: ['admin', 'user'], default: 'user', required: false })
  role?: UserRole;

  @ApiProperty({ enum: ['local', 'google'], default: 'local', required: false })
  provider?: AuthProvider;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  pictureUrl?: string;

  @ApiProperty({ example: '1234567890', description: 'Google account ID', required: false })
  googleId?: string;
}

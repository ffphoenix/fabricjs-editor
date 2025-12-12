import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({ description: 'error status code' })
  statusCode: number;

  @ApiProperty({ description: 'error message' })
  message: string;
}

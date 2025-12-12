import { ApiProperty } from '@nestjs/swagger';

class FieldError {
  @ApiProperty({ description: 'Form field name' })
  field: string;

  @ApiProperty({ description: 'Form field error message' })
  message: string;
}

export class CRUDErrorBadRequestResponse {
  @ApiProperty({ description: 'error status code' })
  statusCode: number;

  @ApiProperty({ description: 'error message' })
  message: string;

  @ApiProperty({ description: 'Error messages by fields', type: FieldError, isArray: true })
  errors: FieldError[];

  @ApiProperty({ description: 'timestamp' })
  timestamp: Date;
}

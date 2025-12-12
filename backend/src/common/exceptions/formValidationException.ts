import { HttpException, HttpStatus } from '@nestjs/common';

export class FormValidationException extends HttpException {
  errors: { field: string; message: string }[];

  constructor(errors: { field: string; message: string }[]) {
    super('Request validation failed', HttpStatus.BAD_REQUEST);
    this.errors = errors;
  }
}

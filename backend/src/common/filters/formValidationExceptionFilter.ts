import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { FormValidationException } from '../exceptions/formValidationException';

@Catch(FormValidationException)
export class FormValidationExceptionFilter implements ExceptionFilter {
  catch(exception: FormValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
      errors: exception.errors,
    });
  }
}

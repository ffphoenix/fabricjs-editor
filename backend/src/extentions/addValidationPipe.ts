import { INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';
import { FormValidationException } from '../common/exceptions/formValidationException';
import { FormValidationExceptionFilter } from '../common/filters/formValidationExceptionFilter';

export default (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints)[0],
        }));
        return new FormValidationException(formattedErrors);
      },
    }),
  );
  app.useGlobalFilters(new FormValidationExceptionFilter());
};

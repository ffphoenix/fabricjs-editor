import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { INestApplication } from '@nestjs/common';

export default (app: INestApplication) => {
  const config = new DocumentBuilder().setTitle('API Documentation').setVersion('1.0').addTag('Api').build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);
  writeFileSync('./openapi-schema.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('openapi', app, document, { useGlobalPrefix: true, raw: ['json'] });
};

import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import getEnvVariable from '../utils/getEnvVariable';

const config = {
  type: 'postgres',
  host: getEnvVariable('POSTGRES_HOST'),
  port: Number(getEnvVariable('POSTGRES_PORT', '5432')),
  username: getEnvVariable('POSTGRES_USER'),
  password: getEnvVariable('POSTGRES_PASSWORD'),
  database: getEnvVariable('POSTGRES_DATABASE'),
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  autoLoadEntities: true,
  synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);

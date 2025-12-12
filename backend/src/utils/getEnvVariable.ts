import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });
export default (key: string, defaultValue?: string): string => {
  if (process.env[key] === undefined) {
    if (defaultValue) return defaultValue;
    throw new Error(`Missing environment variable - "${key}"`);
  }

  return process.env[key];
};

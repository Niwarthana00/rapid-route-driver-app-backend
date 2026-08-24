import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5433', 10),
  DB_NAME: process.env.DB_NAME || 'bus_enterprise',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'dev_password_only',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://postgres:dev_password_only@localhost:5433/bus_enterprise',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_rapid_route_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

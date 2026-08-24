import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { env } from './env';

export const pool = new Pool(
  env.DATABASE_URL
    ? { connectionString: env.DATABASE_URL }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const initDatabase = async () => {
  try {
    const client = await pool.connect();
    try {
      console.log('📦 PostgreSQL Connected. Verifying database schemas...');
      const schemaSql = fs.readFileSync(
        path.resolve(process.cwd(), 'database', '01_schema.sql'),
        'utf8'
      );
      await client.query(schemaSql);

      const seedSql = fs.readFileSync(
        path.resolve(process.cwd(), 'database', '02_seed.sql'),
        'utf8'
      );
      await client.query(seedSql);

      console.log('✅ Database schema and initial seed data verified successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('⚠️ Database auto-migration/seed skipped or warning:', (err as Error).message);
  }
};

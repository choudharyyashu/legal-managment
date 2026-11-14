import dotenv from 'dotenv';
import { z } from 'zod';

// Attempt to load .env safely (handles cases where .env may be missing or an empty directory)
try {
  dotenv.config();
} catch {
  // Gracefully fallback to process.env and default configuration
}

// Zod schema defining all environment configurations with validation
const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173,https://legal-managment.netlify.app'),
  DATABASE_URL: z.string().default('mysql://root:@localhost:3306/legal-db'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('legal-db'),
  JWT_ACCESS_SECRET: z.string().min(16).default('dev_jwt_access_secret_32_characters_minimum'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev_jwt_refresh_secret_32_characters_minimum'),
  JWT_ACCESS_EXPIRES_IN: z.string().optional(),
  JWT_ACCESS_EXPIRY: z.string().optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().optional(),
  JWT_REFRESH_EXPIRY: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Environment configuration validation errors:', parsedEnv.error.format());
  throw new Error('Invalid environment configuration');
}

export const config = {
  port: parsedEnv.data.PORT,
  nodeEnv: parsedEnv.data.NODE_ENV,
  clientOrigin: parsedEnv.data.CLIENT_ORIGIN,
  allowedOrigins: parsedEnv.data.CLIENT_ORIGIN.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean),
  databaseUrl: parsedEnv.data.DATABASE_URL,
  dbHost: parsedEnv.data.DB_HOST,
  dbPort: parsedEnv.data.DB_PORT,
  dbUser: parsedEnv.data.DB_USER,
  dbPassword: parsedEnv.data.DB_PASSWORD,
  dbName: parsedEnv.data.DB_NAME,
  jwtAccessSecret: parsedEnv.data.JWT_ACCESS_SECRET,
  jwtRefreshSecret: parsedEnv.data.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: parsedEnv.data.JWT_ACCESS_EXPIRES_IN || parsedEnv.data.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiresIn: parsedEnv.data.JWT_REFRESH_EXPIRES_IN || parsedEnv.data.JWT_REFRESH_EXPIRY || '7d',
  logLevel: parsedEnv.data.LOG_LEVEL,
};

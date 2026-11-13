import dotenv from 'dotenv';
import path from 'path';

// Load .env from current directory or backend root
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/legal-db',
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: parseInt(process.env.DB_PORT || '3306', 10),
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'legal-db',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_32_characters_minimum',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_32_characters_minimum',
};


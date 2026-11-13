import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import { config } from './env.js';

// Prisma singleton
export const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

/**
 * Direct check of MySQL connection using mysql2
 */
export async function testDirectMySqlConnection(): Promise<{
  connected: boolean;
  version?: string;
  database?: string;
  error?: string;
}> {
  try {
    const connection = await mysql.createConnection({
      host: config.dbHost,
      port: config.dbPort,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
    });

    const [rows] = await connection.query('SELECT VERSION() AS version, DATABASE() AS database_name;');
    await connection.end();

    const result = (rows as any[])[0];
    return {
      connected: true,
      version: result.version,
      database: result.database_name,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || String(err),
    };
  }
}

/**
 * Prisma database connection health test
 */
export async function testPrismaConnection(): Promise<{
  connected: boolean;
  database?: string;
  error?: string;
}> {
  try {
    const result = await prisma.$queryRaw<any[]>`SELECT 1 as is_alive, DATABASE() as db_name`;
    return {
      connected: true,
      database: result[0]?.db_name || config.dbName,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || String(err),
    };
  }
}


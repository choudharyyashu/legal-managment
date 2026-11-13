import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import { config } from './env.js';

// Sanitize helper to guarantee database passwords and connection strings are NEVER logged
export function sanitizeDbErrorMessage(message: string): string {
  if (!message) return 'Unknown database error';
  return message
    .replace(/:([^:@/]+)@/g, ':****@')
    .replace(/(password|pwd)=([^;&]+)/gi, '$1=****');
}

// -----------------------------------------------------------------------------
// REUSABLE PRISMA CLIENT SINGLETON
// Avoids instantiating multiple connection pools during development or hot-reloads
// -----------------------------------------------------------------------------
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
  });

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

// -----------------------------------------------------------------------------
// CONNECTION TESTING & HEALTH MONITORS
// -----------------------------------------------------------------------------

/**
 * Direct check of MySQL connection using mysql2
 * Safe against credential leaks
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
      version: result?.version,
      database: result?.database_name,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: sanitizeDbErrorMessage(err.message || String(err)),
    };
  }
}

/**
 * Prisma database connection health test
 * Runs a benign SELECT DATABASE() query
 */
export async function testPrismaConnection(): Promise<{
  connected: boolean;
  database?: string;
  error?: string;
}> {
  try {
    const result = await prisma.$queryRaw<Array<{ is_alive: number; db_name: string }>>`
      SELECT 1 as is_alive, DATABASE() as db_name
    `;
    return {
      connected: true,
      database: result[0]?.db_name || config.dbName,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: sanitizeDbErrorMessage(err.message || String(err)),
    };
  }
}

/**
 * Graceful database disconnection for application shutdown handlers
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (err: any) {
    // Ignore teardown errors during shutdown
  }
}

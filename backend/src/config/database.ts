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
// TCP KEEPALIVE FOR CLOUD PROXIES (Railway / Cloud MySQL)
// Pings DB every 20 seconds to prevent proxy idle socket drops
// -----------------------------------------------------------------------------
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: any) {
    if (err?.message?.includes('closed the connection') || err?.code === 'P2024') {
      try {
        await prisma.$disconnect();
        await prisma.$connect();
      } catch {}
    }
  }
}, 20000).unref();

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
 * Bounded retry mechanism with exponential backoff for database connection on startup
 */
export async function connectWithRetry(
  maxRetries: number = 5,
  initialDelayMs: number = 1000,
  maxDelayMs: number = 10000
): Promise<{ connected: boolean; attempts: number; error?: string }> {
  let attempt = 0;
  let lastError: string | undefined;

  while (attempt < maxRetries) {
    attempt++;
    const prismaResult = await testPrismaConnection();
    if (prismaResult.connected) {
      return { connected: true, attempts: attempt };
    }

    lastError = prismaResult.error;
    if (attempt < maxRetries) {
      const delay = Math.min(initialDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { connected: false, attempts: attempt, error: lastError };
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

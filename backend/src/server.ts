import { app } from './app.js';
import { config } from './config/env.js';
import {
  testDirectMySqlConnection,
  testPrismaConnection,
  connectWithRetry,
  disconnectDatabase,
} from './config/database.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  console.log('================================================================');
  console.log('HEUGLY & BLUDWORTH - Legal Practice Management API Server');
  console.log('================================================================');
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Port:        ${config.port}`);
  console.log(`DB Target:   ${config.dbName} on ${config.dbHost}:${config.dbPort}`);
  console.log('----------------------------------------------------------------');

  // Verify database connection safely on startup with bounded exponential backoff
  const retryResult = await connectWithRetry(5, 1000, 10000);
  const dbCheck = await testDirectMySqlConnection();

  if (retryResult.connected && dbCheck.connected) {
    logger.info(`Database Connection: SUCCESS (MySQL ${dbCheck.version || '8.4+'}) via Prisma & mysql2`, {
      version: dbCheck.version,
      database: config.dbName,
      attempts: retryResult.attempts,
    });
    console.log(`[DB SUCCESS] Connected to MySQL (${dbCheck.version || '8.4+'}) via Prisma & mysql2 on attempt ${retryResult.attempts}.`);
    console.log(`[DB SUCCESS] Active database: ${config.dbName}`);
  } else if (dbCheck.connected) {
    logger.info(`Direct MySQL Connection: SUCCESS (${dbCheck.version}) via mysql2`, {
      version: dbCheck.version,
    });
    console.log(`[DB SUCCESS] Connected to MySQL (${dbCheck.version}) via mysql2.`);
    console.warn(`[PRISMA NOTE] Prisma status: ${retryResult.error || 'Ready for schema sync'}`);
  } else {
    logger.warn(`Database Connection Warning: ${dbCheck.error || retryResult.error}`, {
      dbHost: config.dbHost,
      dbPort: config.dbPort,
      dbName: config.dbName,
    });
    console.warn(`[DB WARNING] Could not connect to MySQL database '${config.dbName}' after ${retryResult.attempts} attempts.`);
    console.warn(`Reason: ${dbCheck.error || retryResult.error}`);
    console.warn('Please verify that the XAMPP MySQL service is running on port 3306.');
  }

  const server = app.listen(config.port, () => {
    logger.info(`API Server listening on http://localhost:${config.port}`, {
      port: config.port,
      healthCheck: `http://localhost:${config.port}/api/v1/health`,
    });
    console.log('----------------------------------------------------------------');
    console.log(`API Server listening on: http://localhost:${config.port}`);
    console.log(`Health check endpoint:   http://localhost:${config.port}/api/v1/health`);
    console.log('================================================================');
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down HTTP server...`);
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      logger.info('HTTP server closed. Disconnecting database clients...');
      console.log('HTTP server closed.');
      await disconnectDatabase();
      logger.info('Prisma database connection pool closed cleanly.');
      console.log('Prisma database connection closed cleanly.');
      process.exit(0);
    });

    // Force shutdown after 10s if hanging
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout.');
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch(async (err) => {
  logger.error('Fatal bootstrap error:', { error: String(err), stack: err?.stack });
  console.error('Fatal bootstrap error:', err);
  await disconnectDatabase();
  process.exit(1);
});

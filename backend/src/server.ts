import { app } from './app.js';
import { config } from './config/env.js';
import { prisma, testDirectMySqlConnection } from './config/database.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  console.log('----------------------------------------------------------------');
  console.log('Starting HEUGLY & BLUDWORTH Backend Server...');
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Port:        ${config.port}`);
  console.log(`Database:    ${config.dbName} on ${config.dbHost}:${config.dbPort}`);
  console.log('----------------------------------------------------------------');

  // Verify MySQL connection on startup
  const dbCheck = await testDirectMySqlConnection();
  if (dbCheck.connected) {
    logger.info(`Database Connection: SUCCESS (MySQL ${dbCheck.version})`, {
      version: dbCheck.version,
      database: dbCheck.database,
    });
  } else {
    logger.warn(`Database Connection Warning: ${dbCheck.error}`, {
      dbHost: config.dbHost,
      dbPort: config.dbPort,
      dbName: config.dbName,
    });
    console.warn('Ensure local MySQL / XAMPP MySQL service is running on port 3306.');
  }

  const server = app.listen(config.port, () => {
    logger.info(`API Server successfully listening on http://localhost:${config.port}`, {
      port: config.port,
      healthCheck: `http://localhost:${config.port}/api/v1/health`,
    });
    console.log(`API Server listening on http://localhost:${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/api/v1/health`);
    console.log('----------------------------------------------------------------');
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down HTTP server...`);
    server.close(async () => {
      logger.info('HTTP server closed. Disconnecting database clients...');
      try {
        await prisma.$disconnect();
        logger.info('Database connection pool cleanly closed.');
      } catch (err) {
        logger.error('Error during database disconnect', { error: String(err) });
      }
      process.exit(0);
    });

    // Force close after 10 seconds if hanging
    setTimeout(() => {
      logger.error('Forced shutdown timeout reached. Terminating process.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error:', { error: String(err), stack: err?.stack });
  process.exit(1);
});

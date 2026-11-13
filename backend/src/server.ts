import { app } from './app.js';
import { config } from './config/env.js';
<<<<<<< HEAD
import { prisma, testDirectMySqlConnection } from './config/database.js';
import { logger } from './utils/logger.js';
=======
import { testDirectMySqlConnection, testPrismaConnection, disconnectDatabase } from './config/database.js';
>>>>>>> e3b81450b2dec70c5d713a18ad84c2e7d96639b3

async function bootstrap() {
  console.log('================================================================');
  console.log('HEUGLY & BLUDWORTH - Legal Practice Management API Server');
  console.log('================================================================');
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Port:        ${config.port}`);
  console.log(`DB Target:   ${config.dbName} on ${config.dbHost}:${config.dbPort}`);
  console.log('----------------------------------------------------------------');

  // Verify database connection safely on startup (passwords/urls never logged)
  const dbCheck = await testDirectMySqlConnection();
<<<<<<< HEAD
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
=======
  const prismaCheck = await testPrismaConnection();

  if (dbCheck.connected && prismaCheck.connected) {
    console.log(`[DB SUCCESS] Connected to MySQL (${dbCheck.version || '8.4+'}) via Prisma & mysql2.`);
    console.log(`[DB SUCCESS] Active database: ${prismaCheck.database}`);
  } else if (dbCheck.connected) {
    console.log(`[DB SUCCESS] Connected to MySQL (${dbCheck.version}) via mysql2.`);
    console.warn(`[PRISMA NOTE] Prisma query status: ${prismaCheck.error || 'Ready for schema sync'}`);
  } else {
    console.warn(`[DB WARNING] Could not connect to MySQL database '${config.dbName}'.`);
    console.warn(`Reason: ${dbCheck.error}`);
    console.warn('Please verify that the XAMPP MySQL service is running on port 3306.');
  }

  const server = app.listen(config.port, () => {
>>>>>>> e3b81450b2dec70c5d713a18ad84c2e7d96639b3
    console.log('----------------------------------------------------------------');
    console.log(`API Server listening on: http://localhost:${config.port}`);
    console.log(`Health check endpoint:   http://localhost:${config.port}/api/v1/health`);
    console.log('================================================================');
  });

  // Graceful shutdown handling
<<<<<<< HEAD
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
=======
  const gracefulShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDatabase();
      console.log('Prisma database connection closed cleanly.');
      process.exit(0);
    });

    // Force shutdown after 10s if hanging
    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch(async (err) => {
  console.error('Fatal bootstrap error:', err);
  await disconnectDatabase();
>>>>>>> e3b81450b2dec70c5d713a18ad84c2e7d96639b3
  process.exit(1);
});

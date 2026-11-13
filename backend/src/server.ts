import { app } from './app.js';
import { config } from './config/env.js';
import { testDirectMySqlConnection, testPrismaConnection, disconnectDatabase } from './config/database.js';

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
    console.log('----------------------------------------------------------------');
    console.log(`API Server listening on: http://localhost:${config.port}`);
    console.log(`Health check endpoint:   http://localhost:${config.port}/api/v1/health`);
    console.log('================================================================');
  });

  // Graceful shutdown handling
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
  process.exit(1);
});

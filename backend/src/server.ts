import { app } from './app.js';
import { config } from './config/env.js';
import { testDirectMySqlConnection } from './config/database.js';

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
    console.log(`Database Connection: SUCCESS (MySQL ${dbCheck.version})`);
  } else {
    console.warn(`Database Connection Warning: ${dbCheck.error}`);
    console.warn('Ensure XAMPP MySQL service is running on port 3306.');
  }

  app.listen(config.port, () => {
    console.log(`API Server listening on http://localhost:${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/api/v1/health`);
    console.log('----------------------------------------------------------------');
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});


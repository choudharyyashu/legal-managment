import { testDirectMySqlConnection, testPrismaConnection } from './config/database.js';
import { config } from './config/env.js';

async function runDatabaseCheck() {
  console.log('================================================================');
  console.log('HEUGLY & BLUDWORTH - Database Connection Diagnostic');
  console.log('================================================================');
  console.log(`Target Host:     ${config.dbHost}:${config.dbPort}`);
  console.log(`Target User:     ${config.dbUser}`);
  console.log(`Target Database: ${config.dbName}`);
  console.log(`Connection URL:  ${config.databaseUrl}`);
  console.log('----------------------------------------------------------------');

  console.log('1. Testing direct MySQL connection via mysql2...');
  const directResult = await testDirectMySqlConnection();
  if (directResult.connected) {
    console.log('   SUCCESS: Connected to MySQL server!');
    console.log(`   Engine Version:  ${directResult.version}`);
    console.log(`   Active Database: ${directResult.database}`);
  } else {
    console.error('   FAILED direct MySQL connection:', directResult.error);
  }

  console.log('----------------------------------------------------------------');
  console.log('2. Testing Prisma connection...');
  const prismaResult = await testPrismaConnection();
  if (prismaResult.connected) {
    console.log('   SUCCESS: Connected via Prisma ORM!');
    console.log(`   Connected Database: ${prismaResult.database}`);
  } else {
    console.log('   Prisma Note: (Run "npx prisma db push" or "prisma generate" first if client not generated yet)');
    console.log('   Error Details:', prismaResult.error);
  }

  console.log('================================================================');
  process.exit(directResult.connected ? 0 : 1);
}

runDatabaseCheck();


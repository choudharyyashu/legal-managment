/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Railway Live Production Database Read-Only Audit Script
 *
 * SAFETY RULES STRICTLY ENFORCED:
 * 1. Zero writes, inserts, updates, deletes, or migrations.
 * 2. Never print or log credentials, tokens, or plain DATABASE_URL.
 * 3. Read-only metadata queries (SHOW TABLES, table schemas, row counts via SELECT COUNT(*)).
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load backend/.env
const envPath = path.resolve('backend/.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const parsedEnv = dotenv.parse(envContent);

const rawDbUrl = parsedEnv.DATABASE_URL || '';

async function auditRailwayConnection() {
  console.log('=============================================================================');
  console.log('RAILWAY LIVE DATABASE READ-ONLY AUDIT');
  console.log('=============================================================================\n');

  console.log('--- 1. CONFIGURATION INSPECTION (REDACTED) ---');
  if (!rawDbUrl) {
    console.error('DATABASE_URL is missing in backend/.env');
    return;
  }

  let dbMeta: { protocol: string; host: string; port: string; database: string; userConfigured: boolean; passConfigured: boolean } | null = null;
  try {
    const url = new URL(rawDbUrl);
    dbMeta = {
      protocol: url.protocol,
      host: url.hostname,
      port: url.port,
      database: url.pathname.replace(/^\//, ''),
      userConfigured: Boolean(url.username),
      passConfigured: Boolean(url.password),
    };
    console.log('Database Protocol:   ', dbMeta.protocol);
    console.log('Database Host:       ', dbMeta.host);
    console.log('Database Port:       ', dbMeta.port);
    console.log('Database Target:     ', dbMeta.database);
    console.log('User Configured:     ', dbMeta.userConfigured ? 'YES (Present)' : 'NO');
    console.log('Password Configured: ', dbMeta.passConfigured ? 'YES (Redacted)' : 'NO');
    console.log('Is Railway Host:     ', dbMeta.host.includes('railway') ? 'YES' : 'NO');
  } catch (err: any) {
    console.error('Failed to parse DATABASE_URL URL:', err.message);
  }

  console.log('\n--- 2. READ-ONLY CONNECTIVITY CHECK ---');
  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection(rawDbUrl);
    console.log('Connection Result:    SUCCESS (Connected to live MySQL instance)');

    const [versionRows] = await connection.query('SELECT VERSION() as version, DATABASE() as current_db, @@hostname as db_hostname, NOW() as server_time');
    console.log('Database Version:    ', (versionRows as any)[0]?.version);
    console.log('Current Database:    ', (versionRows as any)[0]?.current_db);
    console.log('Server Timestamp:    ', (versionRows as any)[0]?.server_time);

    console.log('\n--- 3. LIVE DATABASE SCHEMA & TABLE INVENTORY ---');
    const [migrations] = await connection.query('SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY finished_at ASC');
    console.log('Applied Prisma Migrations in Live DB:');
    for (const m of (migrations as any[])) {
      console.log(` - ${m.migration_name} (Finished: ${m.finished_at})`);
    }

    const [tables] = await connection.query('SHOW TABLES');
    const tableKey = Object.keys((tables as any)[0] || {})[0];
    const tableNames: string[] = (tables as any[]).map(t => t[tableKey]);

    console.log(`Total Tables in Live Database: ${tableNames.length}`);
    console.log('Tables found:');
    for (const name of tableNames.sort()) {
      const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM \`${name}\``);
      const count = (countResult as any)[0]?.count;
      console.log(` - ${name.padEnd(35)} [Rows: ${count}]`);
    }

    console.log('\n--- 4. PRACTICE MODULE TABLE AUDIT AGAINST PRISMA SCHEMA ---');
    // Practice areas tables check
    const expectedModules = [
      { module: 'Personal Injury', expectedTables: ['pi_liens', 'pi_damages_records', 'pi_settlement_disbursements', 'pi_vendors', 'pi_vendor_assignments'] },
      { module: 'Communications', expectedTables: ['communications', 'unmatched_communications'] },
      { module: 'Litigation', expectedTables: ['litigation_cases', 'court_hearings', 'discovery_requests', 'pleadings_records', 'trial_notebook_items'] },
      { module: 'Bankruptcy', expectedTables: ['bankruptcy_cases', 'bankruptcy_creditors', 'bankruptcy_schedules'] },
      { module: 'Immigration', expectedTables: ['immigration_cases', 'uscis_receipts', 'immigration_parties'] },
      { module: 'Probate', expectedTables: ['probate_cases', 'probate_beneficiaries', 'probate_assets'] },
      { module: 'Family Law', expectedTables: ['family_law_cases', 'family_law_orders'] },
      { module: 'Criminal Defense', expectedTables: ['criminal_cases', 'criminal_charges'] },
      { module: 'Appeals', expectedTables: ['appeals_cases'] },
      { module: 'Evictions', expectedTables: ['evictions_cases'] },
    ];

    for (const group of expectedModules) {
      console.log(`\nPractice Area: ${group.module}`);
      for (const t of group.expectedTables) {
        const exists = tableNames.includes(t);
        console.log(`  Table [${t}]: ${exists ? 'EXISTS IN LIVE DB' : 'MISSING FROM LIVE DB (Migration Required)'}`);
      }
    }

  } catch (err: any) {
    console.error('Connectivity Check Failed:', err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

auditRailwayConnection().catch(err => {
  console.error('Fatal audit failure:', err.message);
});

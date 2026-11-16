/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Phase A & B: Live Railway Database Preflight & Deep Schema Baseline Inspection
 *
 * READ-ONLY ONLY:
 * - Queries information_schema
 * - Queries _prisma_migrations
 * - Queries SHOW TABLES, SHOW TRIGGERS
 * - Zero writes, inserts, updates, deletes, or migrations.
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const envPath = path.resolve('backend/.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const parsedEnv = dotenv.parse(envContent);
const rawDbUrl = parsedEnv.DATABASE_URL || '';

async function runPreflightInspection() {
  console.log('=============================================================================');
  console.log('PHASE A & B: RAILWAY LIVE DATABASE PREFLIGHT & BASELINE VERIFICATION');
  console.log('=============================================================================\n');

  const connection = await mysql.createConnection(rawDbUrl);

  try {
    // 1. Version & Current Database
    const [ver] = await connection.query('SELECT VERSION() as version, DATABASE() as current_db');
    console.log('1. Database Server Telemetry:');
    console.log(' - MySQL Version:   ', (ver as any)[0].version);
    console.log(' - Database Name:   ', (ver as any)[0].current_db);

    // 2. All Physical Tables
    const [tables] = await connection.query('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
    const tableKey = Object.keys((tables as any)[0] || {})[0];
    const physicalTables: string[] = (tables as any[]).map(t => t[tableKey]);
    console.log(`\n2. Physical Tables Count: ${physicalTables.length}`);

    // 3. Inspect _prisma_migrations
    console.log('\n3. _prisma_migrations Live Records:');
    const [migrations] = await connection.query(
      'SELECT id, migration_name, checksum, finished_at, migration_name, applied_steps_count, rolled_back_at FROM _prisma_migrations ORDER BY finished_at ASC'
    );
    for (const m of (migrations as any[])) {
      console.log(` - ID: ${m.id}`);
      console.log(`   Name: ${m.migration_name}`);
      console.log(`   Finished: ${m.finished_at}`);
      console.log(`   Applied Steps: ${m.applied_steps_count}`);
      console.log(`   Rolled Back: ${m.rolled_back_at}`);
    }

    // 4. Inspect Local Migrations Folders
    console.log('\n4. Local Migration Folders in backend/prisma/migrations/:');
    const migrationsDir = path.resolve('backend/prisma/migrations');
    const localMigrationFolders = fs.readdirSync(migrationsDir).filter(f => fs.statSync(path.join(migrationsDir, f)).isDirectory());
    for (const folder of localMigrationFolders) {
      const sqlPath = path.join(migrationsDir, folder, 'migration.sql');
      const hasSql = fs.existsSync(sqlPath);
      const sqlSize = hasSql ? fs.statSync(sqlPath).size : 0;
      console.log(` - Folder: ${folder} (migration.sql: ${hasSql ? `${sqlSize} bytes` : 'MISSING'})`);
    }

    // 5. Deep Inspection for 20261114164500_add_pi_core_data_model:
    // Verify each table, columns, indexes, foreign keys in live Railway
    const pi1645Tables = [
      'pi_incident_parties',
      'pi_medical_billing_summaries',
      'pi_medical_payment_records',
      'pi_vendors',
      'pi_vendor_assignments',
      'pi_demand_packages',
      'pi_liens',
      'pi_lien_negotiations',
      'pi_settlement_disbursements',
      'pi_settlement_disbursement_versions',
      'pi_settlement_executions',
      'pi_settlement_execution_lines',
      'pi_damages_records',
      'pi_diagnostic_studies',
      'pi_wage_loss_records',
    ];

    console.log('\n5. Detailed Table & Column Inspection for 20261114164500_add_pi_core_data_model:');
    for (const tbl of pi1645Tables) {
      const exists = physicalTables.includes(tbl);
      if (!exists) {
        console.log(` ❌ Table ${tbl} DOES NOT EXIST in live DB!`);
      } else {
        const [cols] = await connection.query(
          `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
          [tbl]
        );
        const [fks] = await connection.query(
          `SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
          [tbl]
        );
        console.log(` ✅ Table ${tbl.padEnd(36)} [Columns: ${(cols as any[]).length}, Foreign Keys: ${(fks as any[]).length}]`);
      }
    }

    // 6. Deep Inspection for 20261114164600_add_pi_triggers_and_constraints:
    console.log('\n6. Detailed Trigger & Constraint Inspection for 20261114164600_add_pi_triggers_and_constraints:');
    const [triggers] = await connection.query(
      `SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_TIMING FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = DATABASE()`
    );
    const triggerNames: string[] = (triggers as any[]).map(t => t.TRIGGER_NAME);
    console.log(`Live DB Triggers (${triggerNames.length}):`, triggerNames);

    const expectedTriggers = [
      'trg_prevent_subledger_negative_balance',
      'trg_prevent_trust_overdraft',
      'trg_prevent_immutable_settlement_update',
      'trg_prevent_immutable_settlement_delete',
      'trg_verify_settlement_matter_subledger',
    ];
    for (const trg of expectedTriggers) {
      console.log(` - Trigger [${trg}]: ${triggerNames.includes(trg) ? 'EXISTS IN LIVE DB' : 'MISSING IN LIVE DB'}`);
    }

    const [chk] = await connection.query(
      `SELECT CONSTRAINT_NAME, TABLE_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_TYPE = "CHECK"`
    );
    const chkNames: string[] = (chk as any[]).map(c => c.CONSTRAINT_NAME);
    console.log(`Live DB Check Constraints (${chkNames.length}):`, chkNames);
    console.log(` - Check [chk_trust_subledger_non_negative]: ${chkNames.includes('chk_trust_subledger_non_negative') ? 'EXISTS IN LIVE DB' : 'MISSING IN LIVE DB'}`);

  } finally {
    await connection.end();
  }
}

runPreflightInspection().catch(err => {
  console.error('Fatal preflight error:', err.message);
  process.exit(1);
});

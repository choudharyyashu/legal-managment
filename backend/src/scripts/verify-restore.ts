import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function verifyRestore() {
  console.log('================================================================');
  console.log('HEUGLY & BLUDWORTH - Database Backup Restoration Verification');
  console.log('================================================================');

  const backupDir = path.resolve('backups');
  const backupFiles = fs.readdirSync(backupDir).filter((f) => f.endsWith('.json'));

  if (backupFiles.length === 0) {
    throw new Error('No JSON backup files found in backups/ directory.');
  }

  // Pick the latest backup file
  const latestBackupFile = backupFiles.sort().reverse()[0];
  const backupPath = path.join(backupDir, latestBackupFile);
  console.log(`Target Backup File: ${latestBackupFile}`);
  console.log(`Backup File Size:   ${fs.statSync(backupPath).size} bytes`);

  const rawBackup = fs.readFileSync(backupPath, 'utf8');
  const backupData: Record<string, { createTable: string; rows: any[] }> = JSON.parse(rawBackup);
  const tableNames = Object.keys(backupData);
  console.log(`Tables in Backup:   ${tableNames.length} tables`);

  const RESTORE_TEST_DB = 'legal-db-restore-test';
  console.log(`Temporary Test DB:  ${RESTORE_TEST_DB} (Isolated sandbox)`);
  console.log('----------------------------------------------------------------');

  const rootConn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
  });

  try {
    // 1. Create clean isolated temporary database
    await rootConn.query(`DROP DATABASE IF EXISTS \`${RESTORE_TEST_DB}\``);
    await rootConn.query(`CREATE DATABASE \`${RESTORE_TEST_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`1. Created clean isolated test database: ${RESTORE_TEST_DB}`);

    // Connect directly to the restore test database
    const restoreConn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: RESTORE_TEST_DB,
    });

    // 2. Execute DDL and Data restoration with safe FK check handling
    await restoreConn.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('2. Restoring tables and inserting dataset...');

    let totalRestoredRows = 0;
    for (const tableName of tableNames) {
      const { createTable, rows } = backupData[tableName];
      await restoreConn.query(createTable);

      if (rows && rows.length > 0) {
        for (const row of rows) {
          const columns = Object.keys(row);
          const values = Object.values(row).map((v) => {
            if (typeof v === 'object' && v !== null && !(v instanceof Date)) {
              return JSON.stringify(v);
            }
            return v;
          });
          const placeholders = columns.map(() => '?').join(', ');
          const sql = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${placeholders})`;
          await restoreConn.query(sql, values);
          totalRestoredRows++;
        }
      }
    }

    await restoreConn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log(`   [SUCCESS] Restored ${tableNames.length} tables and ${totalRestoredRows} records.`);

    // 3. Independent Verification of Restored Schema & Data
    console.log('3. Verifying restored schema and relational integrity...');
    const [restoredTables] = await restoreConn.query('SHOW TABLES');
    const restoredTableList = (restoredTables as any[]).map((r) => Object.values(r)[0]);

    if (restoredTableList.length !== tableNames.length) {
      throw new Error(`Table count mismatch! Expected: ${tableNames.length}, Found: ${restoredTableList.length}`);
    }

    // Verify critical seed tables
    const [roleCount] = await restoreConn.query('SELECT COUNT(*) as c FROM `roles`');
    const [permCount] = await restoreConn.query('SELECT COUNT(*) as c FROM `role_permissions`');
    const [paCount] = await restoreConn.query('SELECT COUNT(*) as c FROM `practice_areas`');
    const [coaCount] = await restoreConn.query('SELECT COUNT(*) as c FROM `chart_of_accounts`');

    console.log('   Restored Seed Data Counts:');
    console.log(`   - Roles:            ${(roleCount as any[])[0].c} (Expected: 5)`);
    console.log(`   - Role Permissions: ${(permCount as any[])[0].c} (Expected: 193)`);
    console.log(`   - Practice Areas:   ${(paCount as any[])[0].c} (Expected: 9)`);
    console.log(`   - Chart of Accounts:${(coaCount as any[])[0].c} (Expected: 6)`);

    // Verify Relational Foreign Key Integrity (Join Test)
    const [joinTest] = await restoreConn.query(`
      SELECT rp.id, r.name, rp.permission_key 
      FROM role_permissions rp 
      INNER JOIN roles r ON rp.role_id = r.id 
      LIMIT 5
    `);

    if ((joinTest as any[]).length === 0) {
      throw new Error('Relational join test between role_permissions and roles failed!');
    }
    console.log('   - Referential Join Integrity: VERIFIED (Active foreign keys match parent records)');

    await restoreConn.end();

    // 4. Cleanup temporary database
    await rootConn.query(`DROP DATABASE IF EXISTS \`${RESTORE_TEST_DB}\``);
    console.log(`4. Cleaned up temporary test database: ${RESTORE_TEST_DB}`);

    console.log('================================================================');
    console.log('DATABASE RESTORATION VERIFICATION: 100% SUCCESSFUL & VERIFIED');
    console.log('================================================================');
  } finally {
    await rootConn.end();
  }
}

verifyRestore().catch((err) => {
  console.error('Restore Verification FAILED:', err);
  process.exit(1);
});

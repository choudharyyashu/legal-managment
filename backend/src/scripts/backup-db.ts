import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function backupDatabase() {
  console.log('Starting safe database backup for legal-db...');
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'legal-db',
  });

  const [tables] = await connection.query('SHOW TABLES');
  const backupData: Record<string, { createTable: string; rows: any[] }> = {};

  for (const row of tables as any[]) {
    const tableName = Object.values(row)[0] as string;
    const [createResult] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
    const createTableSql = (createResult as any[])[0]['Create Table'];
    
    const [tableRows] = await connection.query(`SELECT * FROM \`${tableName}\``);
    backupData[tableName] = {
      createTable: createTableSql,
      rows: tableRows as any[],
    };
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.resolve('backups', `legal-db-backup-${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log(`Database backup successfully saved to: ${backupPath}`);
  console.log(`Total backed-up tables: ${Object.keys(backupData).length}`);

  await connection.end();
}

backupDatabase().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});


/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Database Backup Utility
 *
 * Requirements:
 * - Strictly parses DATABASE_URL or DB_* environment variables.
 * - Redacts sensitive credentials in all log statements.
 * - Refuses to silently connect to cloud/remote databases without explicit confirmation.
 * - Generates a valid SQL schema + data dump.
 * - Verifies backup integrity against core legal practice tables.
 *
 * RESTORE PROCEDURE:
 * To safely restore a backup file to a target database:
 *   mysql -h <HOST> -P <PORT> -u <USER> -p <DATABASE> < backend/backups/<BACKUP_FILE>.sql
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  isCloud: boolean;
}

export const CORE_LEGAL_TABLES = [
  'matters',
  'clients',
  'users',
  'trust_sub_ledgers',
  'trust_transactions',
];

/**
 * Safely redacts credentials from any connection string or URL.
 */
export function redactCredentials(rawUrl?: string): string {
  if (!rawUrl) return '[EMPTY_URL]';
  return rawUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
}

/**
 * Parses and validates connection parameters from DATABASE_URL or environment variables.
 * Refuses to silently default to localhost.
 */
export function parseDatabaseConfig(connectionUrl?: string): DatabaseConfig {
  const urlString = connectionUrl || process.env.DATABASE_URL;

  if (urlString) {
    try {
      const parsed = new URL(urlString);
      const host = parsed.hostname;
      const port = parsed.port ? parseInt(parsed.port, 10) : 3306;
      const user = decodeURIComponent(parsed.username || 'root');
      const password = decodeURIComponent(parsed.password || '');
      const database = parsed.pathname.replace(/^\//, '');

      if (!host || !database) {
        throw new Error('DATABASE_URL is missing host or database name.');
      }

      const isCloud = host !== 'localhost' && host !== '127.0.0.1' && host !== '::1';

      return {
        host,
        port,
        user,
        password,
        database,
        isCloud,
      };
    } catch (err: any) {
      throw new Error(`Failed to parse DATABASE_URL: ${err.message}`);
    }
  }

  // Fallback to explicit DB_* variables
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    throw new Error(
      'Database configuration missing. Neither DATABASE_URL nor DB_HOST/DB_USER/DB_NAME are set. Refusing to default to localhost.'
    );
  }

  const isCloud = host !== 'localhost' && host !== '127.0.0.1' && host !== '::1';

  return {
    host,
    port,
    user,
    password,
    database,
    isCloud,
  };
}

/**
 * Validates whether remote/cloud backup is authorized.
 */
export function validateTargetHost(config: DatabaseConfig, allowCloud: boolean): void {
  if (config.isCloud && !allowCloud) {
    throw new Error(
      `ABORTED: Target '${config.host}:${config.port}/${config.database}' is a remote/cloud database. ` +
        `Cloud backups require explicit confirmation via --confirm-cloud or CONFIRM_CLOUD_BACKUP=true.`
    );
  }
}

/**
 * Verifies that a generated SQL dump file is non-empty and contains required core tables.
 */
export function verifyBackupIntegrity(
  filePath: string,
  requiredTables: string[] = CORE_LEGAL_TABLES
): { isValid: boolean; tableCount: number; missingTables: string[]; fileSizeBytes: number } {
  if (!fs.existsSync(filePath)) {
    return { isValid: false, tableCount: 0, missingTables: requiredTables, fileSizeBytes: 0 };
  }

  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    return { isValid: false, tableCount: 0, missingTables: requiredTables, fileSizeBytes: 0 };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const missingTables: string[] = [];

  for (const table of requiredTables) {
    const tablePattern = new RegExp(`CREATE TABLE (\`?${table}\`?|"${table}")`, 'i');
    if (!tablePattern.test(content)) {
      missingTables.push(table);
    }
  }

  const createMatches = content.match(/CREATE TABLE/gi);
  const tableCount = createMatches ? createMatches.length : 0;

  return {
    isValid: missingTables.length === 0 && tableCount > 0 && stat.size > 1024,
    tableCount,
    missingTables,
    fileSizeBytes: stat.size,
  };
}

/**
 * Generates genuine SQL schema and data export statements.
 */
export async function generateSqlDump(connection: mysql.Connection, databaseName: string): Promise<string> {
  const [tables] = await connection.query('SHOW TABLES');
  const tableList = (tables as any[]).map((row) => Object.values(row)[0] as string);

  let sqlOutput = `-- =============================================================================\n`;
  sqlOutput += `-- HEUGLY & BLUDWORTH Database Backup\n`;
  sqlOutput += `-- Database: ${databaseName}\n`;
  sqlOutput += `-- Timestamp: ${new Date().toISOString()}\n`;
  sqlOutput += `-- =============================================================================\n\n`;
  sqlOutput += `SET FOREIGN_KEY_CHECKS=0;\n`;
  sqlOutput += `SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";\n`;
  sqlOutput += `SET NAMES utf8mb4;\n\n`;

  for (const table of tableList) {
    const [createResult] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
    const createTableSql = (createResult as any[])[0]['Create Table'];

    sqlOutput += `-- -------------------------------------------------------------\n`;
    sqlOutput += `-- Table structure for table \`${table}\`\n`;
    sqlOutput += `-- -------------------------------------------------------------\n`;
    sqlOutput += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    sqlOutput += `${createTableSql};\n\n`;

    const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
    const rowList = rows as any[];

    if (rowList.length > 0) {
      sqlOutput += `-- Dumping data for table \`${table}\`\n`;
      sqlOutput += `LOCK TABLES \`${table}\` WRITE;\n`;

      const columns = Object.keys(rowList[0])
        .map((c) => `\`${c}\``)
        .join(', ');

      for (const row of rowList) {
        const values = Object.values(row)
          .map((v) => {
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'number' || typeof v === 'bigint') return v.toString();
            if (typeof v === 'boolean') return v ? '1' : '0';
            if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
            if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
            return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
          })
          .join(', ');

        sqlOutput += `INSERT INTO \`${table}\` (${columns}) VALUES (${values});\n`;
      }

      sqlOutput += `UNLOCK TABLES;\n\n`;
    }
  }

  sqlOutput += `SET FOREIGN_KEY_CHECKS=1;\n`;
  return sqlOutput;
}

/**
 * Main Backup Orchestrator
 */
export async function backupDatabase(options?: {
  dryRun?: boolean;
  confirmCloud?: boolean;
  targetUrl?: string;
  outputDir?: string;
}): Promise<string> {
  const allowCloud =
    options?.confirmCloud ||
    process.env.CONFIRM_CLOUD_BACKUP === 'true' ||
    process.argv.includes('--confirm-cloud');

  const config = parseDatabaseConfig(options?.targetUrl);

  console.log(`[Backup] Host: ${config.host}:${config.port}`);
  console.log(`[Backup] Database: ${config.database}`);
  console.log(`[Backup] Target Type: ${config.isCloud ? 'REMOTE / CLOUD' : 'LOCAL'}`);

  validateTargetHost(config, allowCloud);

  if (options?.dryRun) {
    console.log('[Backup] Dry run mode enabled. Configuration verified successfully.');
    return 'DRY_RUN_SUCCESS';
  }

  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });

  try {
    console.log(`[Backup] Connected to database '${config.database}'. Extracting schema and data...`);
    const sqlDump = await generateSqlDump(connection, config.database);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupsDir = options?.outputDir || path.resolve(process.cwd(), 'backups');

    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const backupFilePath = path.join(backupsDir, `backup-${config.database}-${timestamp}.sql`);
    fs.writeFileSync(backupFilePath, sqlDump, 'utf-8');

    const integrity = verifyBackupIntegrity(backupFilePath);
    if (!integrity.isValid) {
      throw new Error(
        `Backup verification failed: Missing required core tables [${integrity.missingTables.join(', ')}].`
      );
    }

    console.log(`[Backup] Backup successfully written to: ${backupFilePath}`);
    console.log(`[Backup] Verified tables: ${integrity.tableCount}, File size: ${integrity.fileSizeBytes} bytes`);
    return backupFilePath;
  } finally {
    await connection.end();
  }
}

// Execution CLI block
if (process.argv[1] && process.argv[1].endsWith('backup-db.ts')) {
  backupDatabase().catch((err) => {
    console.error('[Backup Error]:', err.message);
    process.exit(1);
  });
}

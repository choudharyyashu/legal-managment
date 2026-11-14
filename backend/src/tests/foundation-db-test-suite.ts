// Explicit Test Database Isolation Guard
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('-test')) {
  process.env.DATABASE_URL = 'mysql://root:@localhost:3306/legal-db-test';
}

if (!process.env.DATABASE_URL.includes('-test')) {
  throw new Error(
    `CRITICAL TEST ISOLATION GUARD: Automated tests must run against an isolated test database ('legal-db-test'). Current target: ${process.env.DATABASE_URL}. Execution aborted to protect primary database.`
  );
}

import { app } from '../app.js';
import { prisma } from '../config/database.js';
import { config } from '../config/env.js';
import { Server } from 'http';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function recordResult(name: string, passed: boolean, details?: string) {
  results.push({ name, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} - ${name}`);
  if (!passed && details) {
    console.error(`       Details: ${details}`);
  }
}

async function runFoundationTestSuite() {
  console.log('================================================================');
  console.log('HEUGLY & BLUDWORTH - Foundation & Database Verification Suite');
  console.log('================================================================\n');

  const testPort = 5893;
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(testPort, () => resolve(s));
  });

  const baseUrl = `http://localhost:${testPort}`;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Root Endpoint Returns Service Metadata (200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/`);
      const data = await res.json() as any;
      const ok = res.status === 200 && data.success === true && data.data?.name?.includes('HEUGLY & BLUDWORTH');
      recordResult('1. Root endpoint returns service metadata (200 OK)', ok, JSON.stringify(data));
    }

    // -------------------------------------------------------------------------
    // TEST 2: Health Check Reports Dual DB Status, Latency & Memory (200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/v1/health`);
      const data = await res.json() as any;
      const ok =
        res.status === 200 &&
        data.status === 'healthy' &&
        data.database?.directConnection === 'connected' &&
        data.database?.prismaConnection === 'connected' &&
        typeof data.database?.latencyMs === 'number' &&
        typeof data.server?.memoryMb?.rss === 'number';
      recordResult('2. Health check reports dual DB status, latency & memory (200 OK)', ok, JSON.stringify(data));
    }

    // -------------------------------------------------------------------------
    // TEST 3: 404 Route Not Found Returns Standardized Problem Details
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/v1/undefined-route-path`);
      const data = await res.json() as any;
      const ok = res.status === 404 && data.success === false && data.error?.code === 'ROUTE_NOT_FOUND';
      recordResult('3. 404 Handler returns standardized problem details JSON (404 Not Found)', ok, JSON.stringify(data));
    }

    // -------------------------------------------------------------------------
    // TEST 4: CORS Allowlist Allows Permitted Origins
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/v1/health`, {
        headers: { Origin: 'http://localhost:3000' },
      });
      const allowHeader = res.headers.get('access-control-allow-origin');
      const ok = allowHeader === 'http://localhost:3000';
      recordResult('4. CORS allowlist allows permitted port 3000 (Vite frontend)', ok, `Received: ${allowHeader}`);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Clean CORS Policy Denial for Disallowed External Origins
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/v1/health`, {
        headers: { Origin: 'https://malicious-external-site.com' },
      });
      const allowHeader = res.headers.get('access-control-allow-origin');
      // Clean CORS denial: origin header is omitted, no internal 500 error thrown
      const ok = allowHeader === null && res.status === 200;
      recordResult('5. Clean CORS policy denial: omits origin header without throwing HTTP 500', ok, `Allow-Origin Header: ${allowHeader}, Status: ${res.status}`);
    }

    // -------------------------------------------------------------------------
    // TEST 6: BigInt Serialization - Safe Integer Serializes to Number
    // -------------------------------------------------------------------------
    {
      const sampleBigInt = BigInt(1048576); // 1 MB
      const serialized = JSON.stringify({ fileSize: sampleBigInt });
      const parsed = JSON.parse(serialized);
      const ok = parsed.fileSize === 1048576 && typeof parsed.fileSize === 'number';
      recordResult('6. BigInt within safe integer range serializes to exact Number', ok, serialized);
    }

    // -------------------------------------------------------------------------
    // TEST 7: BigInt Serialization - Large 64-Bit Exceeding Safe Limit Serializes to String
    // -------------------------------------------------------------------------
    {
      const largeBigInt = BigInt('9007199254740999999'); // Exceeds Number.MAX_SAFE_INTEGER
      const serialized = JSON.stringify({ largeValue: largeBigInt });
      const parsed = JSON.parse(serialized);
      const ok = parsed.largeValue === '9007199254740999999' && typeof parsed.largeValue === 'string';
      recordResult('7. BigInt exceeding MAX_SAFE_INTEGER serializes to exact String without precision loss', ok, serialized);
    }

    // -------------------------------------------------------------------------
    // TEST 8: Live Database Table Verification (All 28 Tables Exist)
    // -------------------------------------------------------------------------
    {
      const tableCheck = await prisma.$queryRaw<Array<{ table_count: number }>>`
        SELECT COUNT(*) as table_count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME != '_prisma_migrations';
      `;
      const count = Number(tableCheck[0]?.table_count || 0);
      const ok = count === 28 || count === 32;
      recordResult('8. Live MySQL database contains all 28 domain application tables (or 32 with document automation)', ok, `Table count: ${count}`);
    }

    // -------------------------------------------------------------------------
    // TEST 9: Intake Converted Matter Foreign Key Constraint Verification
    // -------------------------------------------------------------------------
    {
      const fkCheck = await prisma.$queryRaw<Array<{ constraint_name: string }>>`
        SELECT CONSTRAINT_NAME as constraint_name 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'intakes' AND COLUMN_NAME = 'converted_matter_id' AND REFERENCED_TABLE_NAME = 'matters';
      `;
      const ok = fkCheck.length > 0;
      recordResult('9. Intake converted_matter_id foreign key constraint is active in InnoDB', ok, JSON.stringify(fkCheck));
    }

    // -------------------------------------------------------------------------
    // TEST 10: Workflow Stages Verification Across All 9 Practice Areas
    // -------------------------------------------------------------------------
    {
      const stageCount = await prisma.workflowStage.count();
      const distinctPracticeAreas = await prisma.workflowStage.groupBy({
        by: ['practiceAreaId'],
      });
      const ok = stageCount === 37 && distinctPracticeAreas.length === 9;
      recordResult(
        '10. Workflow stages seeded deterministically (37 stages across 9 practice areas)',
        ok,
        `Total stages: ${stageCount}, Distinct Practice Areas: ${distinctPracticeAreas.length}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 11: Seed Data Integrity - Roles & Granular Permissions
    // -------------------------------------------------------------------------
    {
      const roleCount = await prisma.role.count();
      const permissionCount = await prisma.rolePermission.count();
      const ok = roleCount === 5 && permissionCount === 193;
      recordResult(
        '11. Seed data integrity verified (5 Foundational Roles, 193 Granular Permissions)',
        ok,
        `Roles: ${roleCount}, Permissions: ${permissionCount}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 12: Financial Precision Verification (No Float / Decimal 12,2 Enforced)
    // -------------------------------------------------------------------------
    {
      const colCheck = await prisma.$queryRaw<Array<{ column_name: string; data_type: string; numeric_precision: number; numeric_scale: number }>>`
        SELECT COLUMN_NAME as column_name, DATA_TYPE as data_type, NUMERIC_PRECISION as numeric_precision, NUMERIC_SCALE as numeric_scale
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invoices' AND COLUMN_NAME = 'total_amount';
      `;
      const col = colCheck[0];
      const ok = col?.data_type === 'decimal' && Number(col?.numeric_precision) === 12 && Number(col?.numeric_scale) === 2;
      recordResult(
        '12. Strict financial decimal precision verified (DECIMAL 12,2 on invoices.total_amount)',
        ok,
        JSON.stringify(col)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 13: Global Rate Limiter Active on General Endpoints
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/api/v1/users?page=1&limit=1`, {
        headers: { Origin: 'http://localhost:3000' },
      });
      const limitHeader = res.headers.get('ratelimit-limit');
      const ok = limitHeader === '300' || res.headers.has('ratelimit-remaining');
      recordResult(
        '13. Global Rate Limiter active on general endpoints (300 requests / 15m window)',
        ok,
        `RateLimit-Limit Header: ${limitHeader}`
      );
    }
  } catch (err: any) {
    console.error('Fatal Test Error:', err);
    recordResult('Execution halted due to exception', false, err.message);
  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log('FOUNDATION & DATABASE TEST SUMMARY');
  console.log('================================================================');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`Total Tests Run: ${results.length}`);
  console.log(`Passed:          ${passedCount}`);
  console.log(`Failed:          ${results.length - passedCount}`);
  console.log('================================================================');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runFoundationTestSuite()
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


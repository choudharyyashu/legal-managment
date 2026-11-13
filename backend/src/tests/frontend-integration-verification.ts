// ==============================================================================
// HEUGLY & BLUDWORTH - Frontend to Backend API End-to-End Verification
// Verifies all frontend API client methods against backend routes & MySQL
// ==============================================================================

const testDbUrl = process.env.TEST_DATABASE_URL || 'mysql://root:@localhost:3306/legal-db-test';
process.env.DATABASE_URL = testDbUrl;

import { app } from '../app.js';
import { prisma, disconnectDatabase } from '../config/database.js';
import { Server } from 'http';

interface TestResult {
  name: string;
  passed: boolean;
  actual: any;
  expected: any;
  details?: string;
}

const results: TestResult[] = [];

function recordResult(name: string, passed: boolean, actual: any, expected: any, details?: string) {
  results.push({ name, passed, actual, expected, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} - ${name} [Actual: ${JSON.stringify(actual)}, Expected: ${JSON.stringify(expected)}]`);
}

async function runVerification() {
  console.log('================================================================');
  console.log('FRONTEND-BACKEND API END-TO-END VERIFICATION SUITE');
  console.log('================================================================\n');

  const PORT = 3009;
  const baseUrl = `http://localhost:${PORT}/api/v1`;

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(PORT, () => resolve(s));
  });

  let token = '';
  let createdClientId = '';
  let createdMatterId = '';

  try {
    // 1. Auth Login (Super Admin)
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'e.heugly@utahslawyers.com',
        password: 'UtahLaw@2026!',
      }),
    });
    const loginData = await loginRes.json() as any;
    token = loginData.data?.accessToken;
    recordResult('1. Auth Login via API client payload', loginRes.status === 200 && Boolean(token), loginRes.status, 200);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 2. Auth Session Me
    const meRes = await fetch(`${baseUrl}/auth/me`, { headers });
    const meData = await meRes.json() as any;
    recordResult('2. Auth Session restoration (/auth/me)', meRes.status === 200 && meData.data?.user?.email === 'e.heugly@utahslawyers.com', meRes.status, 200);

    // 3. User Directory
    const usersRes = await fetch(`${baseUrl}/users?limit=10`, { headers });
    const usersData = await usersRes.json() as any;
    const usersList = Array.isArray(usersData.data) ? usersData.data : (usersData.data?.users || []);
    recordResult('3. Staff Users Directory (/users)', usersRes.status === 200 && Array.isArray(usersList), usersRes.status, 200);

    // 4. Client Creation & Persistence
    const createClientRes = await fetch(`${baseUrl}/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Wasatch Mountain Logistics LLC (E2E Test)',
        clientType: 'Organization',
        email: 'billing@wasatchlogistics.com',
        phone: '(801) 555-0144',
        status: 'Active',
      }),
    });
    const clientData = await createClientRes.json() as any;
    createdClientId = clientData.data?.client?.id;
    recordResult('4. Client Creation end-to-end (/clients)', createClientRes.status === 201 && Boolean(createdClientId), createClientRes.status, 201);

    // 5. Client Listing & Retrieval
    const getClientsRes = await fetch(`${baseUrl}/clients?limit=10`, { headers });
    const getClientsData = await getClientsRes.json() as any;
    const clientsList = Array.isArray(getClientsData.data) ? getClientsData.data : (getClientsData.data?.clients || []);
    const clientFound = clientsList.some((c: any) => c.id === createdClientId);
    recordResult('5. Client Listing (/clients) includes created client', getClientsRes.status === 200 && clientFound, clientFound, true);

    // 6. Matter Creation & Client Association
    const createMatterRes = await fetch(`${baseUrl}/matters`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Wasatch v. Interstate Freightlines (E2E Test)',
        clientId: createdClientId,
        practiceAreaId: 'pa-civ',
        responsibleAttorneyId: loginData.data?.user?.id,
        billingType: 'Hourly',
        hourlyRate: 450.0,
        budget: 50000.0,
        status: 'Active',
      }),
    });
    const matterData = await createMatterRes.json() as any;
    createdMatterId = matterData.data?.matter?.id;
    recordResult('6. Matter Creation linked to Client (/matters)', createMatterRes.status === 201 && Boolean(createdMatterId), createMatterRes.status, 201);

    // 7. Matter Retrieval by ID
    const getMatterRes = await fetch(`${baseUrl}/matters/${createdMatterId}`, { headers });
    recordResult('7. Matter Details resolution (/matters/:id)', getMatterRes.status === 200, getMatterRes.status, 200);

    // 8. Task Creation for Matter
    const createTaskRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        matterId: createdMatterId,
        title: 'Serve Initial Rule 26 Disclosures',
        assignedToUserId: loginData.data?.user?.id,
        dueDate: '2026-11-30',
        priority: 'High',
      }),
    });
    const taskData = await createTaskRes.json() as any;
    const createdTaskId = taskData.data?.task?.id;
    recordResult('8. Task Creation with Matter Association (/tasks)', createTaskRes.status === 201 && Boolean(createdTaskId), createTaskRes.status, 201);

    // 9. Time Entry Logging
    const createTimeRes = await fetch(`${baseUrl}/time/entries`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        matterId: createdMatterId,
        date: '2026-11-13',
        hours: 2.5,
        rate: 450.0,
        activityType: 'Litigation Drafting',
        description: 'Drafted amended complaint and evidentiary exhibit index',
        isBillable: true,
      }),
    });
    recordResult('9. Time Entry creation (/time/entries)', createTimeRes.status === 201, createTimeRes.status, 201);

    // 10. Atomic Trust Accounting Deposit
    const trustDepRes = await fetch(`${baseUrl}/trust/deposits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        matterId: createdMatterId,
        amount: 15000.0,
        sourceReference: 'WIRE-E2E-001',
        purpose: 'Litigation defense retainer deposit',
      }),
    });
    recordResult('10. Atomic Trust Deposit (/trust/deposits)', trustDepRes.status === 201, trustDepRes.status, 201);

    // 11. Trust Ledgers Listing
    const trustLedgerRes = await fetch(`${baseUrl}/trust/ledgers`, { headers });
    const trustLedgerData = await trustLedgerRes.json() as any;
    const ledgersList = Array.isArray(trustLedgerData.data) ? trustLedgerData.data : (trustLedgerData.data?.ledgers || []);
    const ledgerFound = ledgersList.some((l: any) => l.matterId === createdMatterId);
    recordResult('11. Client Trust Sub-Ledger verified (/trust/ledgers)', trustLedgerRes.status === 200 && ledgerFound, ledgerFound, true);

    // 12. Dashboard Live Metrics Aggregation
    const dashRes = await fetch(`${baseUrl}/reports/dashboard`, { headers });
    const dashData = await dashRes.json() as any;
    const hasMetrics = dashData.data?.clients?.total >= 1 && dashData.data?.matters?.total >= 1;
    recordResult('12. Executive Dashboard Live Aggregation (/reports/dashboard)', dashRes.status === 200 && hasMetrics, true, true);

    // Clean up created entities in test database
    if (createdTaskId) {
      await prisma.task.delete({ where: { id: createdTaskId } }).catch(() => {});
    }
    if (createdMatterId) {
      await prisma.trustTransaction.deleteMany({ where: { trustSubLedger: { matterId: createdMatterId } } }).catch(() => {});
      await prisma.trustSubLedger.deleteMany({ where: { matterId: createdMatterId } }).catch(() => {});
      await prisma.timeEntry.deleteMany({ where: { matterId: createdMatterId } }).catch(() => {});
      await prisma.matter.delete({ where: { id: createdMatterId } }).catch(() => {});
    }
    if (createdClientId) {
      await prisma.client.delete({ where: { id: createdClientId } }).catch(() => {});
    }

  } catch (err) {
    console.error('Fatal error during E2E verification:', err);
  } finally {
    server.close();
    await disconnectDatabase().catch(() => {});
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log('\n================================================================');
  console.log(`E2E VERIFICATION SUMMARY: ${passedCount} / ${results.length} PASSED`);
  console.log('================================================================\n');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runVerification();

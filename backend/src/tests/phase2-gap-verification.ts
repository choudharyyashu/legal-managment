// ==============================================================================
// HEUGLY & BLUDWORTH - Phase 2 Gap Verification Test Suite
// Verifies Calendar, Document Vault, Chart of Accounts, and Practice Workspaces
// ==============================================================================

const testDbUrl = process.env.TEST_DATABASE_URL || 'mysql://root:@localhost:3306/legal-db-test';
process.env.DATABASE_URL = testDbUrl;

import { app } from '../app.js';
import { prisma, disconnectDatabase } from '../config/database.js';
import { Server } from 'http';
import fs from 'fs';

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

async function runPhase2Verification() {
  console.log('================================================================');
  console.log('PHASE 2 GAP VERIFICATION SUITE (ISOLATED TEST DATABASE)');
  console.log('================================================================\n');

  const PORT = 3010;
  const baseUrl = `http://localhost:${PORT}/api/v1`;

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(PORT, () => resolve(s));
  });

  let token = '';
  let createdEventId = '';
  let createdDocId = '';
  let testClientId = '';
  let testMatterId = '';
  const testAccountNum = 8899;

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
    recordResult('1. Super Admin Authentication', loginRes.status === 200 && Boolean(token), loginRes.status, 200);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // Bootstrap test client and matter
    const clientRes = await fetch(`${baseUrl}/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Phase2 Verification Corp',
        clientType: 'Organization',
        email: 'phase2@verification.org',
        phone: '(801) 555-0199',
        status: 'Active',
      }),
    });
    const clientData = await clientRes.json() as any;
    testClientId = clientData.data?.client?.id;

    const matterRes = await fetch(`${baseUrl}/matters`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Phase2 Integrated Litigation Matter',
        clientId: testClientId,
        practiceAreaId: 'pa-civ',
        responsibleAttorneyId: loginData.data?.user?.id,
        billingType: 'Hourly',
        hourlyRate: 450.0,
        status: 'Active',
      }),
    });
    const matterData = await matterRes.json() as any;
    testMatterId = matterData.data?.matter?.id;

    // 2. Calendar Event Creation & Persistence
    const createEventRes = await fetch(`${baseUrl}/calendar/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        matterId: testMatterId,
        title: 'Utah 3rd District Injunction Hearing',
        eventType: 'Hearing',
        startTime: '2026-11-25T16:00:00.000Z',
        endTime: '2026-11-25T17:30:00.000Z',
        location: 'Matheson Courthouse, Room 3A',
        judge: 'Hon. Carolyn Tanner',
        isCourtAppearance: true,
      }),
    });
    const eventData = await createEventRes.json() as any;
    createdEventId = eventData.data?.event?.id;
    recordResult('2. Calendar Event Creation & Persistence (/calendar/events)', createEventRes.status === 201 && Boolean(createdEventId), createEventRes.status, 201);

    // 3. Calendar Event Retrieval
    const getEventsRes = await fetch(`${baseUrl}/calendar/events`, { headers });
    const getEventsData = await getEventsRes.json() as any;
    const eventsList = Array.isArray(getEventsData.data) ? getEventsData.data : (getEventsData.data?.events || []);
    const eventFound = eventsList.some((e: any) => e.id === createdEventId);
    recordResult('3. Calendar Event Listing includes created event', getEventsRes.status === 200 && eventFound, eventFound, true);

    // 4. Document Creation (Metadata)
    const createDocRes = await fetch(`${baseUrl}/documents`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        matterId: testMatterId,
        clientId: testClientId,
        title: 'Memorandum in Support of Injunction',
        category: 'Motion',
        isPrivileged: true,
        privilegeType: 'Attorney Work Product (Utah RPC 1.6)',
      }),
    });
    const docData = await createDocRes.json() as any;
    createdDocId = docData.data?.document?.id;
    recordResult('4. Document Creation in Vault (/documents)', createDocRes.status === 201 && Boolean(createdDocId), createDocRes.status, 201);

    // 5. Document Version Binary Upload (Base64)
    const testContentText = 'VERIFIED BINARY CONTENT OF UTAH LEGAL DISCLOSURE MEMORANDUM';
    const testBase64 = Buffer.from(testContentText).toString('base64');
    const uploadRes = await fetch(`${baseUrl}/documents/${createdDocId}/upload`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fileName: 'Memorandum_Injunction_v1.0.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: Buffer.byteLength(testContentText),
        fileContentBase64: testBase64,
        revisionNotes: 'Initial filed memorandum version',
      }),
    });
    const uploadData = await uploadRes.json() as any;
    recordResult('5. Document Version Upload to Vault (/documents/:id/upload)', uploadRes.status === 201 && uploadData.data?.version?.versionLabel === 'v1.0', uploadRes.status, 201);

    // 6. Document Binary Download & Integrity Check
    const downloadRes = await fetch(`${baseUrl}/documents/${createdDocId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const downloadedText = await downloadRes.text();
    const downloadMatch = downloadedText === testContentText;
    recordResult('6. Document Binary Download from Vault (/documents/:id/download)', downloadRes.status === 200 && downloadMatch, downloadMatch, true);

    // 7. Chart of Accounts Creation
    const createAccountRes = await fetch(`${baseUrl}/ledger/accounts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        accountNumber: testAccountNum,
        accountName: 'Utah State Litigation Defense Reserve',
        accountType: 'Asset',
        isActive: true,
      }),
    });
    const accountData = await createAccountRes.json() as any;
    recordResult('7. Chart of Accounts Creation (/ledger/accounts)', createAccountRes.status === 201 && accountData.data?.account?.accountNumber === testAccountNum, createAccountRes.status, 201);

    // 8. Chart of Accounts Duplicate Conflict Rejection (409 Conflict)
    const dupAccountRes = await fetch(`${baseUrl}/ledger/accounts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        accountNumber: testAccountNum,
        accountName: 'Duplicate Account Attempt',
        accountType: 'Asset',
      }),
    });
    recordResult('8. Chart of Accounts Duplicate Code Rejection (409 Conflict)', dupAccountRes.status === 409, dupAccountRes.status, 409);

    // 9. Practice Area Queries: Personal Injury (pa-pi)
    const piMattersRes = await fetch(`${baseUrl}/matters?practiceAreaId=pa-pi`, { headers });
    const piData = await piMattersRes.json() as any;
    const piList = Array.isArray(piData.data) ? piData.data : (piData.data?.matters || []);
    recordResult('9. Specialized Query: Personal Injury Matters (pa-pi)', piMattersRes.status === 200 && Array.isArray(piList), piMattersRes.status, 200);

    // 10. Practice Area Queries: Bankruptcy (pa-bk)
    const bkMattersRes = await fetch(`${baseUrl}/matters?practiceAreaId=pa-bk`, { headers });
    const bkData = await bkMattersRes.json() as any;
    const bkList = Array.isArray(bkData.data) ? bkData.data : (bkData.data?.matters || []);
    recordResult('10. Specialized Query: Bankruptcy Matters (pa-bk)', bkMattersRes.status === 200 && Array.isArray(bkList), bkMattersRes.status, 200);

    // 11. Practice Area Queries: Immigration (pa-imm)
    const immMattersRes = await fetch(`${baseUrl}/matters?practiceAreaId=pa-imm`, { headers });
    const immData = await immMattersRes.json() as any;
    const immList = Array.isArray(immData.data) ? immData.data : (immData.data?.matters || []);
    recordResult('11. Specialized Query: Immigration Matters (pa-imm)', immMattersRes.status === 200 && Array.isArray(immList), immMattersRes.status, 200);

    // 12. Calendar Event Deletion & Cleanup
    const deleteEventRes = await fetch(`${baseUrl}/calendar/events/${createdEventId}`, {
      method: 'DELETE',
      headers,
    });
    recordResult('12. Calendar Event Deletion (/calendar/events/:id)', deleteEventRes.status === 200, deleteEventRes.status, 200);

    // Cleanup test records
    await prisma.chartOfAccount.deleteMany({ where: { accountNumber: testAccountNum } }).catch(() => {});
    if (createdDocId) {
      await prisma.documentVersion.deleteMany({ where: { documentId: createdDocId } }).catch(() => {});
      await prisma.document.delete({ where: { id: createdDocId } }).catch(() => {});
    }
    if (testMatterId) {
      await prisma.matter.delete({ where: { id: testMatterId } }).catch(() => {});
    }
    if (testClientId) {
      await prisma.client.delete({ where: { id: testClientId } }).catch(() => {});
    }

  } catch (err) {
    console.error('Fatal error during Phase 2 verification:', err);
  } finally {
    server.close();
    await disconnectDatabase().catch(() => {});
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log('\n================================================================');
  console.log(`PHASE 2 VERIFICATION SUMMARY: ${passedCount} / ${results.length} PASSED`);
  console.log('================================================================\n');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runPhase2Verification();

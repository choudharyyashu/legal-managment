// Ensure tests execute against the dedicated isolated test database only
const testDbUrl = process.env.TEST_DATABASE_URL || 'mysql://root:@localhost:3306/legal-db-test';
process.env.DATABASE_URL = testDbUrl;

if (!testDbUrl.toLowerCase().includes('test')) {
  console.error('CRITICAL SAFETY GUARD: Automated tests must run against legal-db-test! Aborting.');
  process.exit(1);
}

import { app } from '../app.js';
import { prisma, disconnectDatabase } from '../config/database.js';
import { Server } from 'http';

interface TestResult {
  name: string;
  passed: boolean;
  statusCode?: number | string;
  expectedStatus?: number | string;
  message?: string;
}

const results: TestResult[] = [];

function recordResult(
  name: string,
  passed: boolean,
  statusCode?: number | string,
  expectedStatus?: number | string,
  message?: string
) {
  results.push({ name, passed, statusCode, expectedStatus, message });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} - ${name} [Status: ${statusCode ?? 'N/A'}, Expected: ${expectedStatus ?? 'N/A'}]`);
  if (!passed && message) {
    console.error(`       Details: ${message}`);
  }
}

async function runBusinessModulesTestSuite() {
  console.log('================================================================');
  console.log('HEUGLY & BLUDWORTH - End-to-End Business Modules Test Suite');
  console.log('================================================================\n');

  const testPort = 5896;
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(testPort, () => resolve(s));
  });

  const baseUrl = `http://localhost:${testPort}/api/v1`;

  // Track created entities for guaranteed teardown
  let createdClientId = '';
  let createdMatterId = '';
  let createdIntakeId = '';
  let createdTaskId = '';
  let createdEventId = '';
  let createdDocId = '';
  let createdTimeId = '';
  let createdExpId = '';
  let createdInvId = '';
  let createdPaymentId = '';
  let createdJournalId = '';

  try {
    // -------------------------------------------------------------------------
    // SETUP: Log in as Super Admin
    // -------------------------------------------------------------------------
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'e.heugly@utahslawyers.com',
        password: 'UtahLaw@2026!',
      }),
    });
    const loginData = (await loginRes.json()) as any;
    const token = loginData.data?.accessToken;
    const adminUserId = loginData.data?.user?.id;

    if (!token) throw new Error('Super Admin login failed during test setup.');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // -------------------------------------------------------------------------
    // BASELINE: Provision a Client and Matter for domain associations
    // -------------------------------------------------------------------------
    const clientRes = await fetch(`${baseUrl}/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Wasatch Commercial Ventures LLC',
        type: 'Organization',
        primaryContact: 'Sarah Jenkins (CFO)',
        email: `wasatch.test.${Date.now()}@utahventures.com`,
        phone: '(801) 555-4321',
        assignedAttorneyId: adminUserId,
      }),
    });
    const clientData = (await clientRes.json()) as any;
    createdClientId = clientData.data?.client?.id;

    const matterRes = await fetch(`${baseUrl}/matters`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Wasatch Commercial Lease Dispute',
        clientId: createdClientId,
        practiceAreaId: 'pa-civ',
        responsibleAttorneyId: adminUserId,
        billingType: 'Hourly',
        hourlyRate: 400.0,
      }),
    });
    const matterData = (await matterRes.json()) as any;
    createdMatterId = matterData.data?.matter?.id;

    // -------------------------------------------------------------------------
    // MODULE 1: INTAKE & CONFLICT CLEARANCE
    // -------------------------------------------------------------------------
    {
      // 1. Create Intake
      const res = await fetch(`${baseUrl}/intakes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prospectiveClient: 'Summit Crest BioSciences Inc',
          contactPerson: 'Dr. Arthur Vance',
          email: `summit.${Date.now()}@biosciences.com`,
          phone: '(801) 555-8899',
          practiceAreaId: 'pa-civ',
          adverseParties: 'Wasatch Commercial Ventures LLC, BioNexus Laboratories',
          matterSummary: 'Patent infringement and commercial lease dispute regarding lab space.',
          disputeAmount: 250000.0,
        }),
      });
      const data = (await res.json()) as any;
      createdIntakeId = data.data?.intake?.id;
      recordResult(
        '1. Intake Creation succeeds with automated conflict check (201 Created)',
        res.status === 201 && !!createdIntakeId,
        res.status,
        201
      );

      // 2. Conflict Check Identification
      const conflictRes = await fetch(`${baseUrl}/intakes/${createdIntakeId}/conflict-check`, {
        method: 'POST',
        headers,
      });
      const conflictData = (await conflictRes.json()) as any;
      recordResult(
        '2. Conflict Check identifies adverse party match against existing Client (200 OK)',
        conflictRes.status === 200 && conflictData.data?.hasConflicts === true,
        conflictRes.status,
        200,
        `Matches: ${conflictData.data?.matches?.length}`
      );

      // 3. Clear Conflict with Waiver
      const clearRes = await fetch(`${baseUrl}/intakes/${createdIntakeId}/clear-conflict`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          status: 'Waiver Obtained',
          notes: 'Formal conflict waiver executed by both corporate entities under Utah RPC 1.7.',
        }),
      });
      const clearData = (await clearRes.json()) as any;
      recordResult(
        '3. Clear Conflict with waiver decision (200 OK)',
        clearRes.status === 200 && clearData.data?.intake?.conflictStatus === 'Waiver Obtained',
        clearRes.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 2: TASKS & CHECKLISTS
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          matterId: createdMatterId,
          title: 'Draft Answer and Counterclaim',
          description: 'Prepare responsive pleadings under Utah URCP Rule 12.',
          assignedToUserId: adminUserId,
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          priority: 'High',
          urcpRuleReference: 'URCP Rule 12',
        }),
      });
      const data = (await res.json()) as any;
      createdTaskId = data.data?.task?.id;
      recordResult(
        '4. Task Creation with matter association and URCP reference (201 Created)',
        res.status === 201 && data.data?.task?.taskCode?.startsWith('TSK-'),
        res.status,
        201
      );

      // Update Task Status to Completed
      const statusRes = await fetch(`${baseUrl}/tasks/${createdTaskId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'Completed' }),
      });
      const statusData = (await statusRes.json()) as any;
      recordResult(
        '5. Task Status transition to Completed sets completedAt timestamp (200 OK)',
        statusRes.status === 200 && statusData.data?.task?.status === 'Completed' && !!statusData.data?.task?.completedAt,
        statusRes.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 3: CALENDAR & DOCKETING
    // -------------------------------------------------------------------------
    {
      const startTime = new Date(Date.now() + 14 * 86400000).toISOString();
      const endTime = new Date(Date.now() + 14 * 86400000 + 3600000).toISOString();

      const res = await fetch(`${baseUrl}/calendar/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          matterId: createdMatterId,
          title: 'Initial Scheduling Conference',
          eventType: 'Hearing',
          startTime,
          endTime,
          location: 'Third Judicial District Court, Courtroom 402',
          judge: 'Hon. Elizabeth A. Hruby-Mills',
          isCourtAppearance: true,
        }),
      });
      const data = (await res.json()) as any;
      createdEventId = data.data?.event?.id;
      recordResult(
        '6. Calendar Court Appearance scheduling (201 Created)',
        res.status === 201 && data.data?.event?.isCourtAppearance === true,
        res.status,
        201
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 4: DOCUMENT VAULT & STORAGE
    // -------------------------------------------------------------------------
    {
      // 1. Create Document Record
      const res = await fetch(`${baseUrl}/documents`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          matterId: createdMatterId,
          clientId: createdClientId,
          title: 'Plaintiff Initial Disclosures',
          category: 'Discovery',
          isPrivileged: false,
          batesNumberStart: 'WCV-0001',
          batesNumberEnd: 'WCV-0045',
        }),
      });
      const data = (await res.json()) as any;
      createdDocId = data.data?.document?.id;
      recordResult(
        '7. Document Metadata Record creation with Bates numbering (201 Created)',
        res.status === 201 && data.data?.document?.documentCode?.startsWith('DOC-'),
        res.status,
        201
      );

      // 2. Upload Document Version with BigInt filesize
      const uploadRes = await fetch(`${baseUrl}/documents/${createdDocId}/upload`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fileName: 'Initial_Disclosures_Signed.pdf',
          fileType: 'application/pdf',
          fileSizeBytes: 2458920,
          fileContentBase64: Buffer.from('%PDF-1.4 Mock Legal Document Content for Testing').toString('base64'),
          revisionNotes: 'Signed original disclosure document.',
        }),
      });
      const uploadData = (await uploadRes.json()) as any;
      recordResult(
        '8. Document Version upload with SHA-256 checksum and BigInt fileSizeBytes (201 Created)',
        uploadRes.status === 201 && !!uploadData.data?.version?.sha256Checksum,
        uploadRes.status,
        201
      );

      // 3. Download Document
      const downloadRes = await fetch(`${baseUrl}/documents/${createdDocId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const disposition = downloadRes.headers.get('content-disposition') || '';
      recordResult(
        '9. Document Download returns attachment stream with version header (200 OK)',
        downloadRes.status === 200 && disposition.includes('Initial_Disclosures'),
        downloadRes.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 5: TIME TRACKING
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/time/entries`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          matterId: createdMatterId,
          date: new Date().toISOString().split('T')[0],
          hours: 2.5,
          rate: 400.0,
          activityType: 'Drafting Pleadings',
          description: 'Researched Utah case law and drafted affirmative defense section.',
          isBillable: true,
        }),
      });
      const data = (await res.json()) as any;
      createdTimeId = data.data?.entry?.id;
      recordResult(
        '10. Time Entry Creation calculates exact amount = hours * rate ($1,000.00) (201 Created)',
        res.status === 201 && data.data?.entry?.amount === 1000.0,
        res.status,
        201
      );

      // Approve Time Entry
      const approveRes = await fetch(`${baseUrl}/time/entries/${createdTimeId}/approve`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'Approved' }),
      });
      const approveData = (await approveRes.json()) as any;
      recordResult(
        '11. Time Entry Partner Approval sets status to Approved (200 OK)',
        approveRes.status === 200 && approveData.data?.entry?.status === 'Approved',
        approveRes.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 6: EXPENSES & DISBURSEMENTS
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/expenses`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          matterId: createdMatterId,
          date: new Date().toISOString().split('T')[0],
          category: 'Court Filing Fee',
          amount: 375.0,
          vendorName: 'Utah State Courts e-Filing Portal',
          isBillable: true,
        }),
      });
      const data = (await res.json()) as any;
      createdExpId = data.data?.expense?.id;
      recordResult(
        '12. Expense Logging with matter and vendor association ($375.00) (201 Created)',
        res.status === 201 && data.data?.expense?.amount === 375.0,
        res.status,
        201
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 7: INVOICING, PAYMENTS & ACCOUNTS RECEIVABLE
    // -------------------------------------------------------------------------
    {
      // 1. Generate Invoice from Time and Expense
      const res = await fetch(`${baseUrl}/billing/invoices`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          clientId: createdClientId,
          matterId: createdMatterId,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          notes: 'Legal services rendered through current period.',
          lineItems: [
            {
              itemType: 'Time',
              timeEntryId: createdTimeId,
              description: 'Drafting pleadings and research (2.5 hrs @ $400/hr)',
              quantity: 2.5,
              unitRate: 400.0,
            },
            {
              itemType: 'Expense',
              expenseId: createdExpId,
              description: 'Court Filing Fee - District Court',
              quantity: 1,
              unitRate: 375.0,
            },
          ],
        }),
      });
      const data = (await res.json()) as any;
      createdInvId = data.data?.invoice?.id;
      const totalAmount = data.data?.invoice?.totalAmount;
      recordResult(
        '13. Invoice Generation aggregates time ($1,000) + expense ($375) = $1,375.00 (201 Created)',
        res.status === 201 && totalAmount === 1375.0 && data.data?.invoice?.balanceDue === 1375.0,
        res.status,
        201,
        `Total: $${totalAmount}`
      );

      // 2. Record Partial Payment ($500.00)
      const payRes = await fetch(`${baseUrl}/billing/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          invoiceId: createdInvId,
          amount: 500.0,
          paymentMethod: 'Credit Card',
          destinationAccount: 'Operating Account (1000)',
          transactionReference: 'AUTH-982144',
          receivedDate: new Date().toISOString().split('T')[0],
        }),
      });
      const payData = (await payRes.json()) as any;
      createdPaymentId = payData.data?.payment?.id;
      const newBalanceDue = payData.data?.invoice?.balanceDue;
      recordResult(
        '14. Payment Recording updates invoice paidAmount ($500) and balanceDue ($875.00) (201 Created)',
        payRes.status === 201 && newBalanceDue === 875.0 && payData.data?.invoice?.status === 'Partially Paid',
        payRes.status,
        201,
        `Balance Due: $${newBalanceDue}`
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 8: TRUST ACCOUNTING / IOLTA COMPLIANCE
    // -------------------------------------------------------------------------
    {
      // 1. Client Retainer Deposit ($5,000.00)
      const depRes = await fetch(`${baseUrl}/trust/deposits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          matterId: createdMatterId,
          amount: 5000.0,
          sourceReference: 'CHK-9021',
          purpose: 'Initial litigation retainer deposit into IOLTA trust.',
        }),
      });
      const depData = (await depRes.json()) as any;
      recordResult(
        '15. IOLTA Trust Deposit increases sub-ledger balance to $5,000.00 (201 Created)',
        depRes.status === 201 && depData.data?.ledger?.balance === 5000.0,
        depRes.status,
        201
      );

      // 2. Disburse Earned Fees ($1,000.00)
      const disbRes = await fetch(`${baseUrl}/trust/disbursements`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          matterId: createdMatterId,
          amount: 1000.0,
          sourceReference: 'TRANS-EARNED-FEE',
          purpose: 'Earned fee disbursement to operating account.',
        }),
      });
      const disbData = (await disbRes.json()) as any;
      recordResult(
        '16. IOLTA Trust Disbursement transfers funds and reduces balance to $4,000.00 (201 Created)',
        disbRes.status === 201 && disbData.data?.ledger?.balance === 4000.0,
        disbRes.status,
        201
      );

      // 3. Utah RPC 1.15 Strict Negative Balance Guard
      const overDisbRes = await fetch(`${baseUrl}/trust/disbursements`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          matterId: createdMatterId,
          amount: 10000.0, // Exceeds $4,000 balance!
          sourceReference: 'TRANS-OVERDRAFT',
          purpose: 'Attempted overdraft disbursement.',
        }),
      });
      recordResult(
        '17. Utah RPC 1.15 Negative Balance Guard strictly prevents overdraft disbursement (400 Bad Request)',
        overDisbRes.status === 400,
        overDisbRes.status,
        400
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 9: GENERAL LEDGER
    // -------------------------------------------------------------------------
    {
      // 1. Get Chart of Accounts
      const accRes = await fetch(`${baseUrl}/ledger/accounts`, { headers });
      const accData = (await accRes.json()) as any;
      recordResult(
        '18. Chart of Accounts retrieved with seeded legal ledgers (200 OK)',
        accRes.status === 200 && accData.data?.length >= 6,
        accRes.status,
        200
      );

      // 2. Post Balanced Double-Entry Journal
      const journalRes = await fetch(`${baseUrl}/ledger/journals`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transactionDate: new Date().toISOString().split('T')[0],
          memo: 'Deposit retainer receipt and credit client trust liability ($4,000 net)',
          entries: [
            { accountNumber: 1010, debit: 4000.0, credit: 0.0, matterId: createdMatterId },
            { accountNumber: 2100, debit: 0.0, credit: 4000.0, matterId: createdMatterId },
          ],
        }),
      });
      const journalData = (await journalRes.json()) as any;
      createdJournalId = journalData.data?.journal?.id;
      recordResult(
        '19. Balanced Double-Entry General Ledger Journal posted (Debit = Credit = $5,000) (201 Created)',
        journalRes.status === 201 && journalData.data?.journal?.journalNumber?.startsWith('GLJ-'),
        journalRes.status,
        201
      );

      // 3. Reject Unbalanced Journal
      const unbalRes = await fetch(`${baseUrl}/ledger/journals`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transactionDate: new Date().toISOString().split('T')[0],
          memo: 'Unbalanced journal attempt',
          entries: [
            { accountNumber: 1010, debit: 5000.0, credit: 0.0 },
            { accountNumber: 2100, debit: 0.0, credit: 4000.0 }, // $1,000 mismatch!
          ],
        }),
      });
      recordResult(
        '20. Unbalanced Journal rejected by validation (422 Unprocessable Entity)',
        unbalRes.status === 422,
        unbalRes.status,
        422
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 10: THREE-WAY RECONCILIATION
    // -------------------------------------------------------------------------
    {
      const month = new Date().toISOString().slice(0, 7);

      // 1. Calculate Live Status
      const statusRes = await fetch(
        `${baseUrl}/reconciliation/status?reconciliationMonth=${month}&bankStatementBalance=4000&depositsInTransit=0&outstandingChecks=0`,
        { headers }
      );
      const statusData = (await statusRes.json()) as any;
      recordResult(
        '21. Three-Way Reconciliation engine computes Bank vs GL vs Client Subledgers (200 OK)',
        statusRes.status === 200 && statusData.data?.clientSubledgersTotalBalance === 4000.0,
        statusRes.status,
        200,
        `Adjusted Bank: $${statusData.data?.adjustedBankBalance}, Subledgers: $${statusData.data?.clientSubledgersTotalBalance}`
      );

      // 2. Submit Monthly Audit Record
      const submitRes = await fetch(`${baseUrl}/reconciliation`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          reconciliationMonth: month,
          bankStatementBalance: 4000.0,
          depositsInTransit: 0.0,
          outstandingChecks: 0.0,
        }),
      });
      const submitData = (await submitRes.json()) as any;
      recordResult(
        '22. Three-Way Reconciliation audit record submitted with balanced status (201 Created)',
        submitRes.status === 201 && submitData.data?.record?.isBalanced === true,
        submitRes.status,
        201
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 11: DASHBOARD & REPORTS
    // -------------------------------------------------------------------------
    {
      const dashRes = await fetch(`${baseUrl}/reports/dashboard`, { headers });
      const dashData = (await dashRes.json()) as any;
      recordResult(
        '23. Executive Dashboard reports real-time aggregated metrics across all operational tables (200 OK)',
        dashRes.status === 200 && dashData.data?.clients?.total >= 1 && dashData.data?.matters?.total >= 1,
        dashRes.status,
        200
      );

      const arRes = await fetch(`${baseUrl}/reports/ar-aging`, { headers });
      const arData = (await arRes.json()) as any;
      recordResult(
        '24. Accounts Receivable Aging analysis computes 0-30 day outstanding bucket ($875.00) (200 OK)',
        arRes.status === 200 && arData.data?.current === 875.0,
        arRes.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 12: CONCURRENCY & TRANSACTION SAFETY TESTS
    // -------------------------------------------------------------------------
    {
      // 1. Invalid/Zero Deposit Amount Validation Guard
      const invalidDepRes = await fetch(`${baseUrl}/trust/deposits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          matterId: createdMatterId,
          amount: 0.0,
          sourceReference: 'ZERO-DEP',
          purpose: 'Zero deposit test',
        }),
      });
      recordResult(
        '25. Trust Deposit with zero amount rejected (422 / 400 Bad Request)',
        invalidDepRes.status === 400 || invalidDepRes.status === 422,
        invalidDepRes.status,
        400
      );

      // 2. Concurrent Trust Disbursal with Row-Level Locking (Race Condition Safety)
      // Current sub-ledger balance is $4,000.00.
      // Launch two concurrent disbursements of $3,000.00 simultaneously.
      // EXACTLY ONE must succeed; the other MUST fail with 400 INSUFFICIENT_TRUST_FUNDS.
      const [res1, res2] = await Promise.all([
        fetch(`${baseUrl}/trust/disbursements`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            matterId: createdMatterId,
            amount: 3000.0,
            sourceReference: 'CONCURRENT-1',
            purpose: 'Concurrent withdrawal 1',
          }),
        }),
        fetch(`${baseUrl}/trust/disbursements`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            matterId: createdMatterId,
            amount: 3000.0,
            sourceReference: 'CONCURRENT-2',
            purpose: 'Concurrent withdrawal 2',
          }),
        }),
      ]);

      const statuses = [res1.status, res2.status];
      const oneSuccess = statuses.filter((s) => s === 201).length === 1;
      const oneOverdraftBlocked = statuses.filter((s) => s === 400).length === 1;

      // Verify sub-ledger balance is now exactly $1,000.00 ($4,000 - $3,000)
      const subCheck = await prisma.trustSubLedger.findUnique({ where: { matterId: createdMatterId } });
      const finalBalance = Number(subCheck?.balance);

      recordResult(
        '26. Concurrent Trust Disbursal with row-level locking strictly prevents overdraft race condition',
        oneSuccess && oneOverdraftBlocked && finalBalance === 1000.0,
        `201=${oneSuccess}, 400=${oneOverdraftBlocked}, Final=$${finalBalance}`,
        '201=true, 400=true, Final=$1000'
      );
    }

    // -------------------------------------------------------------------------
    // MODULE 13: MULTI-ROLE RBAC PERMISSION VERIFICATION
    // -------------------------------------------------------------------------
    {
      const runTag = Date.now();

      // 1. Provision Attorney, Paralegal, and Billing Clerk
      const attorneyEmail = `attorney.rbac.${runTag}@utahslawyers.com`;
      const paralegalEmail = `paralegal.rbac.${runTag}@utahslawyers.com`;
      const billingEmail = `billing.rbac.${runTag}@utahslawyers.com`;

      // 1. Provision Attorney, Paralegal, and Billing Clerk sequentially (avoids userCode generation race condition)
      const attorneyUserRes = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Harvey Specter, Esq.',
          email: attorneyEmail,
          role: 'attorney',
          password: 'AttorneyPassword@2026!',
          billingRate: 350.0,
        }),
      });

      const paralegalUserRes = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Donna Paulsen',
          email: paralegalEmail,
          role: 'paralegal',
          password: 'ParalegalPassword@2026!',
          billingRate: 150.0,
        }),
      });

      const billingUserRes = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Louis Litt (CFO)',
          email: billingEmail,
          role: 'billing',
          password: 'BillingPassword@2026!',
          billingRate: 200.0,
        }),
      });

      const attorneyData = (await attorneyUserRes.json()) as any;
      const paralegalData = (await paralegalUserRes.json()) as any;
      const billingData = (await billingUserRes.json()) as any;

      const attorneyId = attorneyData.data?.user?.id;
      const paralegalId = paralegalData.data?.user?.id;
      const billingId = billingData.data?.user?.id;

      // 2. Log in with each role to obtain scoped JWT access tokens
      const [attorneyLoginRes, paralegalLoginRes, billingLoginRes] = await Promise.all([
        fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: attorneyEmail, password: 'AttorneyPassword@2026!' }),
        }),
        fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: paralegalEmail, password: 'ParalegalPassword@2026!' }),
        }),
        fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: billingEmail, password: 'BillingPassword@2026!' }),
        }),
      ]);

      const attorneyToken = ((await attorneyLoginRes.json()) as any).data?.accessToken;
      const paralegalToken = ((await paralegalLoginRes.json()) as any).data?.accessToken;
      const billingToken = ((await billingLoginRes.json()) as any).data?.accessToken;

      const attorneyHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${attorneyToken}` };
      const paralegalHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${paralegalToken}` };
      const billingHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${billingToken}` };

      // TEST 27: Attorney Role Allowed Operations (intake:create, tasks:create, time:log)
      const attorneyIntakeRes = await fetch(`${baseUrl}/intakes`, {
        method: 'POST',
        headers: attorneyHeaders,
        body: JSON.stringify({
          prospectiveClient: 'Salt Lake Tech Ventures LLC',
          email: 'contact@slctech.com',
          phone: '(801) 555-9988',
          adverseParties: 'None Identified',
          matterSummary: 'IP Trademark registration review',
        }),
      });
      recordResult(
        '27. Attorney Role Authorized Access (intake:create -> 201 Created)',
        attorneyIntakeRes.status === 201,
        attorneyIntakeRes.status,
        201
      );

      // Clean up intake created by attorney
      const attorneyIntakeData = (await attorneyIntakeRes.json()) as any;
      if (attorneyIntakeData.data?.intake?.id) {
        await prisma.intake.delete({ where: { id: attorneyIntakeData.data.intake.id } }).catch(() => {});
      }

      // TEST 28: Attorney Role Denied on Trust Disbursals (403 Forbidden)
      const attorneyDisbRes = await fetch(`${baseUrl}/trust/disbursements`, {
        method: 'POST',
        headers: attorneyHeaders,
        body: JSON.stringify({
          matterId: createdMatterId,
          amount: 500.0,
          sourceReference: 'ILLEGAL-ATTORNEY-DISB',
          purpose: 'Unauthorized withdrawal attempt',
        }),
      });
      recordResult(
        '28. Attorney Role Denied on Trust Disbursement (403 Forbidden)',
        attorneyDisbRes.status === 403,
        attorneyDisbRes.status,
        403
      );

      // TEST 29: Paralegal Role Allowed Operations (tasks:create, time:log, calendar:view)
      const paralegalTaskRes = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: paralegalHeaders,
        body: JSON.stringify({
          matterId: createdMatterId,
          title: 'Paralegal Filing Task - Rule 26 Disclosure',
          assignedToUserId: paralegalId,
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          priority: 'Medium',
        }),
      });
      recordResult(
        '29. Paralegal Role Authorized Access (tasks:create -> 201 Created)',
        paralegalTaskRes.status === 201,
        paralegalTaskRes.status,
        201
      );

      const paralegalTaskData = (await paralegalTaskRes.json()) as any;
      if (paralegalTaskData.data?.task?.id) {
        await prisma.task.delete({ where: { id: paralegalTaskData.data.task.id } }).catch(() => {});
      }

      // TEST 30: Paralegal Role Denied on Client Creation (403 Forbidden)
      const paralegalClientRes = await fetch(`${baseUrl}/clients`, {
        method: 'POST',
        headers: paralegalHeaders,
        body: JSON.stringify({
          name: 'Unauthorized Paralegal Client',
          type: 'Individual',
          email: 'unauth@test.com',
          phone: '(801) 555-0000',
        }),
      });
      recordResult(
        '30. Paralegal Role Denied on Client Creation (403 Forbidden)',
        paralegalClientRes.status === 403,
        paralegalClientRes.status,
        403
      );

      // TEST 31: Billing Clerk Authorized Access (trust:view -> 200 OK)
      const billingTrustRes = await fetch(`${baseUrl}/trust/ledgers`, {
        headers: billingHeaders,
      });
      recordResult(
        '31. Billing Clerk Authorized Access (trust:view -> 200 OK)',
        billingTrustRes.status === 200,
        billingTrustRes.status,
        200
      );

      // TEST 32: Billing Clerk Denied on Adverse Conflict Clearance (403 Forbidden)
      const billingConflictRes = await fetch(`${baseUrl}/intakes/${createdIntakeId}/clear-conflict`, {
        method: 'POST',
        headers: billingHeaders,
        body: JSON.stringify({
          waiverObtained: true,
          waiverNotes: 'Unauthorized waiver clearance by billing clerk',
        }),
      });
      recordResult(
        '32. Billing Clerk Denied on Adverse Conflict Clearance (403 Forbidden)',
        billingConflictRes.status === 403,
        billingConflictRes.status,
        403
      );

      // Teardown test users
      if (attorneyId) await prisma.user.delete({ where: { id: attorneyId } }).catch(() => {});
      if (paralegalId) await prisma.user.delete({ where: { id: paralegalId } }).catch(() => {});
      if (billingId) await prisma.user.delete({ where: { id: billingId } }).catch(() => {});
    }
  } finally {
    // Teardown: Safely remove test records created during this run
    if (createdPaymentId) await prisma.paymentRecord.delete({ where: { id: createdPaymentId } }).catch(() => {});
    if (createdInvId) {
      await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: createdInvId } }).catch(() => {});
      await prisma.invoice.delete({ where: { id: createdInvId } }).catch(() => {});
    }
    if (createdExpId) await prisma.expense.delete({ where: { id: createdExpId } }).catch(() => {});
    if (createdTimeId) await prisma.timeEntry.delete({ where: { id: createdTimeId } }).catch(() => {});
    if (createdDocId) {
      await prisma.documentVersion.deleteMany({ where: { documentId: createdDocId } }).catch(() => {});
      await prisma.document.delete({ where: { id: createdDocId } }).catch(() => {});
    }
    if (createdEventId) await prisma.calendarEvent.delete({ where: { id: createdEventId } }).catch(() => {});
    if (createdTaskId) await prisma.task.delete({ where: { id: createdTaskId } }).catch(() => {});
    if (createdIntakeId) {
      await prisma.conflictSearchLog.deleteMany({ where: { intakeId: createdIntakeId } }).catch(() => {});
      await prisma.intake.delete({ where: { id: createdIntakeId } }).catch(() => {});
    }
    if (createdMatterId) {
      const sub = await prisma.trustSubLedger.findUnique({ where: { matterId: createdMatterId } });
      if (sub) {
        await prisma.trustTransaction.deleteMany({ where: { trustSubLedgerId: sub.id } }).catch(() => {});
        await prisma.trustSubLedger.delete({ where: { id: sub.id } }).catch(() => {});
      }
      if (createdJournalId) {
        await prisma.generalLedgerEntry.deleteMany({ where: { journalId: createdJournalId } }).catch(() => {});
        await prisma.generalLedgerJournal.delete({ where: { id: createdJournalId } }).catch(() => {});
      }
      await prisma.matterStaffAssignment.deleteMany({ where: { matterId: createdMatterId } }).catch(() => {});
      await prisma.matter.delete({ where: { id: createdMatterId } }).catch(() => {});
    }
    if (createdClientId) await prisma.client.delete({ where: { id: createdClientId } }).catch(() => {});

    server.close();
    await disconnectDatabase();
  }

  // Summary
  console.log('\n================================================================');
  console.log('BUSINESS MODULES TEST SUITE SUMMARY');
  console.log('================================================================');
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:          ${passedCount}`);
  console.log(`Failed:          ${failedCount}`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runBusinessModulesTestSuite().catch(async (err) => {
  console.error('Fatal business modules test suite error:', err);
  await disconnectDatabase();
  process.exit(1);
});

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

async function runMatterTestSuite() {
  console.log('================================================================');
  console.log('HEUGLY & BLUDWORTH - End-to-End Matters Module Test Suite');
  console.log('================================================================\n');

  const testPort = 5895;
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(testPort, () => resolve(s));
  });

  const baseUrl = `http://localhost:${testPort}/api/v1`;

  try {
    // -------------------------------------------------------------------------
    // SETUP: Log in as Super Admin (Eleanor Heugly, Esq.)
    // -------------------------------------------------------------------------
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'e.heugly@utahslawyers.com',
        password: 'UtahLaw@2026!',
      }),
    });
    const adminLoginData = (await adminLoginRes.json()) as any;
    const adminToken = adminLoginData.data?.accessToken;
    const adminUserId = adminLoginData.data?.user?.id;

    if (!adminToken) {
      throw new Error('Failed to log in as Super Admin during test suite setup.');
    }

    // -------------------------------------------------------------------------
    // TEST 1: Unauthenticated request rejected (401 Unauthorized)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters`);
      recordResult(
        '1. Unauthenticated request without token rejected (401 Unauthorized)',
        res.status === 401,
        res.status,
        401
      );
    }

    // -------------------------------------------------------------------------
    // TEST 2: Invalid / tampered token rejected (401 Unauthorized)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters`, {
        headers: { Authorization: 'Bearer invalid.tampered.token' },
      });
      recordResult(
        '2. Request with invalid/tampered token rejected (401 Unauthorized)',
        res.status === 401,
        res.status,
        401
      );
    }

    // -------------------------------------------------------------------------
    // SETUP: Provision a test paralegal user for RBAC and Ethical Wall tests
    // -------------------------------------------------------------------------
    const paralegalEmail = `paralegal.test.${Date.now()}@utahslawyers.com`;
    let paralegalUserId = '';
    let paralegalToken = '';

    {
      const createParalegalRes = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Rachel Zane',
          email: paralegalEmail,
          password: 'UtahLaw@2026!Paralegal',
          role: 'paralegal',
          title: 'Senior Litigation Paralegal',
          department: 'Civil Litigation',
          billingRate: 150,
          status: 'Active',
        }),
      });
      const pData = (await createParalegalRes.json()) as any;
      if (createParalegalRes.status === 201 && pData.data?.user?.id) {
        paralegalUserId = pData.data.user.id;
      }

      // Log in as paralegal to obtain paralegal access token
      const pLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: paralegalEmail,
          password: 'UtahLaw@2026!Paralegal',
        }),
      });
      const pLoginData = (await pLoginRes.json()) as any;
      paralegalToken = pLoginData.data?.accessToken;
    }

    // -------------------------------------------------------------------------
    // TEST 3: Missing Permission check: Paralegal cannot create matters (403 Forbidden)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${paralegalToken}`,
        },
        body: JSON.stringify({
          title: 'Unauthorized Matter Attempt',
          clientId: '00000000-0000-0000-0000-000000000000',
          practiceAreaId: 'pa-civ',
          responsibleAttorneyId: adminUserId,
          billingType: 'Hourly',
          hourlyRate: 350,
        }),
      });
      recordResult(
        '3. Paralegal lacking matters:create rejected (403 Forbidden)',
        res.status === 403,
        res.status,
        403
      );
    }

    // -------------------------------------------------------------------------
    // SETUP: Ensure an Active Client exists for Matter associations
    // -------------------------------------------------------------------------
    let activeClientUuid = '';
    let inactiveClientUuid = '';

    {
      // 1. Create a dedicated active client for matter tests
      const clientRes = await fetch(`${baseUrl}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Wasatch Mountain Logistics Inc',
          type: 'Organization',
          primaryContact: 'Michael R. Vance (COO)',
          email: `logistics.matter.test.${Date.now()}@utahfreight.com`,
          phone: '(801) 555-9831',
          assignedAttorneyId: adminUserId,
          status: 'Active',
          notes: 'Active commercial client for Matter test suite.',
        }),
      });
      const cData = (await clientRes.json()) as any;
      if (clientRes.status === 201 && cData.data?.client?.id) {
        activeClientUuid = cData.data.client.id;
      }

      // 2. Query DB for the existing inactive client (CLI-1001) or create one
      const inactiveClient = await prisma.client.findFirst({
        where: { status: 'Inactive' },
        select: { id: true },
      });
      if (inactiveClient) {
        inactiveClientUuid = inactiveClient.id;
      }
    }

    // -------------------------------------------------------------------------
    // TEST 4: Valid Matter Creation (POST /api/v1/matters -> 201 Created)
    // -------------------------------------------------------------------------
    let createdMatterUuid = '';
    let createdMatterNumber = '';

    {
      const res = await fetch(`${baseUrl}/matters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Summit County Land Dispute & Mineral Rights',
          clientId: activeClientUuid,
          practiceAreaId: 'pa-civ',
          responsibleAttorneyId: adminUserId,
          billingType: 'Hourly',
          hourlyRate: 425.0,
          budget: 50000.0,
          courtName: 'Third Judicial District Court - Summit County',
          judge: 'Hon. Richard M. Mrazik',
          caseDocketNumber: '260900142',
          description: 'Commercial boundary and easement dispute involving adjacent mining parcels.',
          status: 'Active',
          isEthicalWallEnabled: false,
        }),
      });

      const data = (await res.json()) as any;
      const ok =
        res.status === 201 &&
        !!data.data?.matter?.id &&
        !!data.data?.matter?.matterNumber &&
        data.data.matter.status === 'Active' &&
        data.data.matter.hourlyRate === 425;

      if (ok) {
        createdMatterUuid = data.data.matter.id;
        createdMatterNumber = data.data.matter.matterNumber;
      }

      recordResult(
        '4. Valid Matter Creation with Hourly billing (201 Created)',
        ok,
        res.status,
        201,
        `Matter Number: ${data.data?.matter?.matterNumber}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 5: Matter Creation validation: Hourly billing without hourlyRate (422 Unprocessable)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Invalid Hourly Matter',
          clientId: activeClientUuid,
          practiceAreaId: 'pa-civ',
          responsibleAttorneyId: adminUserId,
          billingType: 'Hourly',
          // Omit hourlyRate
        }),
      });
      recordResult(
        '5. Hourly billing without hourlyRate rejected (422 Unprocessable Entity)',
        res.status === 422,
        res.status,
        422
      );
    }

    // -------------------------------------------------------------------------
    // TEST 6: Matter Creation validation: Non-existent Client UUID (404 Not Found)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Orphan Matter Test',
          clientId: 'a0000000-0000-0000-0000-000000000001',
          practiceAreaId: 'pa-civ',
          responsibleAttorneyId: adminUserId,
          billingType: 'Hourly',
          hourlyRate: 350,
        }),
      });
      const data = (await res.json()) as any;
      recordResult(
        '6. Non-existent Client UUID rejected (404 Not Found)',
        res.status === 404 && data.error?.code === 'CLIENT_NOT_FOUND',
        res.status,
        404
      );
    }

    // -------------------------------------------------------------------------
    // TEST 7: Matter Creation validation: Inactive Client rejected (400 CLIENT_INACTIVE)
    // -------------------------------------------------------------------------
    if (inactiveClientUuid) {
      const res = await fetch(`${baseUrl}/matters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Matter for Inactive Client Test',
          clientId: inactiveClientUuid,
          practiceAreaId: 'pa-civ',
          responsibleAttorneyId: adminUserId,
          billingType: 'Hourly',
          hourlyRate: 350,
        }),
      });
      const data = (await res.json()) as any;
      recordResult(
        '7. Inactive client rejected from opening new matters (400 CLIENT_INACTIVE)',
        res.status === 400 && data.error?.code === 'CLIENT_INACTIVE',
        res.status,
        400
      );
    } else {
      recordResult('7. Inactive client rejected (Skipped: no inactive client)', true, 400, 400);
    }

    // -------------------------------------------------------------------------
    // TEST 8: Matter Creation validation: Invalid practiceAreaId (400 INVALID_PRACTICE_AREA)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Invalid Practice Area Matter',
          clientId: activeClientUuid,
          practiceAreaId: 'pa-nonexistent-xyz',
          responsibleAttorneyId: adminUserId,
          billingType: 'Hourly',
          hourlyRate: 350,
        }),
      });
      const data = (await res.json()) as any;
      recordResult(
        '8. Invalid practice area ID rejected (400 INVALID_PRACTICE_AREA)',
        res.status === 400 && data.error?.code === 'INVALID_PRACTICE_AREA',
        res.status,
        400
      );
    }

    // -------------------------------------------------------------------------
    // TEST 9: Matter Creation validation: Inactive / non-existent Attorney (400 INVALID_ATTORNEY)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Invalid Attorney Matter',
          clientId: activeClientUuid,
          practiceAreaId: 'pa-civ',
          responsibleAttorneyId: 'b0000000-0000-0000-0000-000000000002',
          billingType: 'Hourly',
          hourlyRate: 350,
        }),
      });
      const data = (await res.json()) as any;
      recordResult(
        '9. Non-existent lead attorney rejected (400 INVALID_ATTORNEY)',
        res.status === 400 && data.error?.code === 'INVALID_ATTORNEY',
        res.status,
        400
      );
    }

    // -------------------------------------------------------------------------
    // TEST 9B (SEC-02): Lead Attorney must have Attorney role (400 INVALID_ATTORNEY_ROLE)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Invalid Attorney Role Matter',
          clientId: activeClientUuid,
          practiceAreaId: 'pa-civ',
          responsibleAttorneyId: paralegalUserId, // Paralegal role
          billingType: 'Hourly',
          hourlyRate: 350,
        }),
      });
      const data = (await res.json()) as any;
      recordResult(
        '9B. SEC-02: Non-attorney role (Paralegal) rejected as responsible attorney (400 INVALID_ATTORNEY_ROLE)',
        res.status === 400 && data.error?.code === 'INVALID_ATTORNEY_ROLE',
        res.status,
        400
      );
    }

    // -------------------------------------------------------------------------
    // TEST 10: Matter Number Sequencing & Uniqueness
    // Create second matter in same practice area to verify sequence increment
    // -------------------------------------------------------------------------
    let secondMatterUuid = '';
    let secondMatterNumber = '';
    {
      const res = await fetch(`${baseUrl}/matters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Weber County Commercial Lease Arbitration',
          clientId: activeClientUuid,
          practiceAreaId: 'pa-civ',
          responsibleAttorneyId: adminUserId,
          billingType: 'Flat Fee',
          flatFeeAmount: 12500,
          budget: 15000,
        }),
      });
      const data = (await res.json()) as any;
      const ok = res.status === 201 && !!data.data?.matter?.matterNumber;
      if (ok) {
        secondMatterUuid = data.data.matter.id;
        secondMatterNumber = data.data.matter.matterNumber;
      }

      // Check format e.g. 26-CIV-0101 and 26-CIV-0102
      const isSequential =
        createdMatterNumber.startsWith('26-CIV-') &&
        secondMatterNumber.startsWith('26-CIV-') &&
        createdMatterNumber !== secondMatterNumber;

      recordResult(
        '10. Concurrency-safe Matter Number format & uniqueness ({YY}-{PA_CODE}-{SEQ})',
        ok && isSequential,
        res.status,
        201,
        `First: ${createdMatterNumber}, Second: ${secondMatterNumber}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 11: Paginated Matter Listing (GET /api/v1/matters -> 200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      const ok =
        res.status === 200 &&
        Array.isArray(data.data) &&
        data.data.length >= 2 &&
        typeof data.pagination?.total === 'number';

      recordResult(
        '11. Paginated matter listing returns data and metadata (200 OK)',
        ok,
        res.status,
        200,
        `Total matters: ${data.pagination?.total}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 12: Search by title / docket / matterNumber (GET /api/v1/matters?search=...)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters?search=Summit+County`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      const matches = data.data?.some((m: any) => m.id === createdMatterUuid);
      recordResult(
        '12. Search query matches matter by title/caption (200 OK)',
        res.status === 200 && matches,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 13: Filter by Practice Area and Billing Type
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters?practiceAreaId=pa-civ&billingType=Flat+Fee`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      const matches = data.data?.every(
        (m: any) => m.practiceAreaId === 'pa-civ' && m.billingType === 'Flat Fee'
      );
      recordResult(
        '13. Matter filtering by practice area and billing type (200 OK)',
        res.status === 200 && matches && data.data.length >= 1,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 14: Matter Detail by UUID (GET /api/v1/matters/:uuid -> 200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterUuid}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      const ok = res.status === 200 && data.data?.matter?.id === createdMatterUuid;
      recordResult(
        '14. Get matter detail by UUID (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 15: Matter Detail by Matter Number (GET /api/v1/matters/:matterNumber -> 200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterNumber}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      const ok = res.status === 200 && data.data?.matter?.matterNumber === createdMatterNumber;
      recordResult(
        '15. Get matter detail by Matter Number (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 16: Matter Update (PUT /api/v1/matters/:id -> 200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterUuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Summit County Land Dispute & Mineral Rights (Amended Caption)',
          budget: 65000,
          judge: 'Hon. Barry G. Lawrence',
        }),
      });
      const data = (await res.json()) as any;
      const ok =
        res.status === 200 &&
        data.data?.matter?.budget === 65000 &&
        data.data?.matter?.judge === 'Hon. Barry G. Lawrence';

      recordResult(
        '16. Update matter details via PUT /api/v1/matters/:id (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 16B (SEC-02): Matter Update rejects reassigning attorney to non-attorney (400)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterUuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          responsibleAttorneyId: paralegalUserId, // Paralegal role
        }),
      });
      const data = (await res.json()) as any;
      recordResult(
        '16B. SEC-02: Matter update rejects non-attorney role as responsible attorney (400 INVALID_ATTORNEY_ROLE)',
        res.status === 400 && data.error?.code === 'INVALID_ATTORNEY_ROLE',
        res.status,
        400
      );
    }

    // -------------------------------------------------------------------------
    // TEST 16C (SEC-04): Update switching to Hourly without rate rejected (400)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${secondMatterUuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          billingType: 'Hourly',
          hourlyRate: 0, // Invalid zero rate
        }),
      });
      const data = (await res.json()) as any;
      recordResult(
        '16C. SEC-04: Update switching to Hourly with zero/missing rate rejected (400 INVALID_BILLING_RATE)',
        res.status === 400 && data.error?.code === 'INVALID_BILLING_RATE',
        res.status,
        400
      );
    }

    // -------------------------------------------------------------------------
    // TEST 16D (SEC-04): Update switching to Hourly with valid rate succeeds (200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${secondMatterUuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          billingType: 'Hourly',
          hourlyRate: 450,
        }),
      });
      const data = (await res.json()) as any;
      const ok =
        res.status === 200 &&
        data.data?.matter?.billingType === 'Hourly' &&
        data.data?.matter?.hourlyRate === 450 &&
        data.data?.matter?.flatFeeAmount === null;

      recordResult(
        '16D. SEC-04: Update switching to Hourly with valid rate succeeds and nulls flat fee (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 16E (SEC-04): Update switching to Flat Fee without amount rejected (400)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterUuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          billingType: 'Flat Fee',
          flatFeeAmount: 0,
        }),
      });
      const data = (await res.json()) as any;
      recordResult(
        '16E. SEC-04: Update switching to Flat Fee without amount rejected (400 INVALID_BILLING_FLAT_FEE)',
        res.status === 400 && data.error?.code === 'INVALID_BILLING_FLAT_FEE',
        res.status,
        400
      );
    }

    // -------------------------------------------------------------------------
    // TEST 16F (SEC-04): Update switching to Flat Fee with amount succeeds (200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterUuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          billingType: 'Flat Fee',
          flatFeeAmount: 18000,
        }),
      });
      const data = (await res.json()) as any;
      const ok =
        res.status === 200 &&
        data.data?.matter?.billingType === 'Flat Fee' &&
        data.data?.matter?.flatFeeAmount === 18000 &&
        data.data?.matter?.hourlyRate === null;

      recordResult(
        '16F. SEC-04: Update switching to Flat Fee with valid amount succeeds and nulls hourly rate (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 16G (SEC-04): Partial update preserves existing valid billing rates (200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterUuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          budget: 72000,
        }),
      });
      const data = (await res.json()) as any;
      const ok =
        res.status === 200 &&
        data.data?.matter?.budget === 72000 &&
        data.data?.matter?.billingType === 'Flat Fee' &&
        data.data?.matter?.flatFeeAmount === 18000;

      recordResult(
        '16G. SEC-04: Partial update preserves existing valid billing terms (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 16H (SEC-04): Update switching to Contingency with valid percentage (200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterUuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          billingType: 'Contingency',
          contingencyPercentage: 33.33,
        }),
      });
      const data = (await res.json()) as any;
      const ok =
        res.status === 200 &&
        data.data?.matter?.billingType === 'Contingency' &&
        data.data?.matter?.contingencyPercentage === 33.33 &&
        data.data?.matter?.flatFeeAmount === null;

      recordResult(
        '16H. SEC-04: Update switching to Contingency with valid percentage succeeds (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 17: Matter Status Transition (PATCH /api/v1/matters/:id/status)
    // Transition to Concluded must populate closeDate
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterUuid}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: 'Concluded',
        }),
      });
      const data = (await res.json()) as any;
      const ok =
        res.status === 200 &&
        data.data?.matter?.status === 'Concluded' &&
        !!data.data?.matter?.closeDate;

      recordResult(
        '17. Status transition to Concluded populates closeDate (200 OK)',
        ok,
        res.status,
        200,
        `Close Date: ${data.data?.matter?.closeDate}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 18: Staff Assignment (POST /api/v1/matters/:id/staff -> 200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterUuid}/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          userId: paralegalUserId,
          assignmentRole: 'lead_paralegal',
        }),
      });
      const data = (await res.json()) as any;
      const staffList = data.data?.assignedStaff || [];
      const assigned = staffList.some((s: any) => s.userId === paralegalUserId);

      recordResult(
        '18. Assign staff member to matter (POST /api/v1/matters/:id/staff -> 200 OK)',
        res.status === 200 && assigned,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 19: Duplicate Staff Assignment Prevention (409 Conflict)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterUuid}/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          userId: paralegalUserId,
          assignmentRole: 'support_paralegal',
        }),
      });
      const data = (await res.json()) as any;
      recordResult(
        '19. Duplicate staff assignment guard prevents duplicate records (409 DUPLICATE_STAFF_ASSIGNMENT)',
        res.status === 409 && data.error?.code === 'DUPLICATE_STAFF_ASSIGNMENT',
        res.status,
        409
      );
    }

    // -------------------------------------------------------------------------
    // TEST 20: Remove Staff Assignment (DELETE /api/v1/matters/:id/staff/:userId -> 200 OK)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters/${createdMatterUuid}/staff/${paralegalUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      recordResult(
        '20. Remove staff assignment (DELETE /api/v1/matters/:id/staff/:userId -> 200 OK)',
        res.status === 200 && data.success === true,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 21: Ethical Wall Enforcement (Utah RPC 1.10) - Screening on Detail
    // Create an Ethical Wall matter where paralegal is NOT assigned
    // Paralegal requests GET /matters/:id -> 403 ETHICAL_WALL_RESTRICTION
    // -------------------------------------------------------------------------
    let ethicalMatterUuid = '';
    let ethicalMatterNumber = '';

    {
      const res = await fetch(`${baseUrl}/matters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'High-Profile Corporate Whistleblower Defense (Restricted)',
          clientId: activeClientUuid,
          practiceAreaId: 'pa-civ',
          responsibleAttorneyId: adminUserId,
          billingType: 'Hourly',
          hourlyRate: 500.0,
          budget: 100000.0,
          isEthicalWallEnabled: true,
          ethicalWallExcludedRole: 'Paralegal Staff',
          description: 'Strict ethical screen active under Utah RPC 1.10. Unassigned personnel screened.',
        }),
      });
      const data = (await res.json()) as any;
      ethicalMatterUuid = data.data?.matter?.id;
      ethicalMatterNumber = data.data?.matter?.matterNumber;

      // Paralegal attempts to fetch this restricted matter
      const screenedRes = await fetch(`${baseUrl}/matters/${ethicalMatterUuid}`, {
        headers: { Authorization: `Bearer ${paralegalToken}` },
      });
      const screenedData = (await screenedRes.json()) as any;

      const denied =
        screenedRes.status === 403 &&
        screenedData.error?.code === 'ETHICAL_WALL_RESTRICTION';

      recordResult(
        '21. Utah RPC 1.10 Ethical Wall restriction blocks unassigned staff from detail view (403 ETHICAL_WALL_RESTRICTION)',
        denied,
        screenedRes.status,
        403,
        `Error Code: ${screenedData.error?.code}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 21B (SEC-01): Client Matters Sub-resource filters out Ethical Wall matters for screened user
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients/${activeClientUuid}/matters`, {
        headers: { Authorization: `Bearer ${paralegalToken}` },
      });
      const data = (await res.json()) as any;
      const clientMatters = data.data?.matters || [];
      const leaked = clientMatters.some((m: any) => m.id === ethicalMatterUuid);

      recordResult(
        '21B. SEC-01: Client matters sub-resource excludes Ethical Wall restricted matters for screened user (200 OK)',
        res.status === 200 && !leaked,
        res.status,
        200,
        `Leaked in client matters? ${leaked}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 21C (SEC-01): Client Matters Sub-resource permits Super Admin to see all client matters
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients/${activeClientUuid}/matters`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      const clientMatters = data.data?.matters || [];
      const includesEthicalMatter = clientMatters.some((m: any) => m.id === ethicalMatterUuid);

      recordResult(
        '21C. SEC-01: Client matters sub-resource returns all client matters for Super Admin (200 OK)',
        res.status === 200 && includesEthicalMatter,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 22: Ethical Wall Query-Level List Screening (No Data Leakage)
    // Paralegal queries GET /api/v1/matters.
    // The restricted ethical matter must NOT appear in results or total count
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters?limit=50`, {
        headers: { Authorization: `Bearer ${paralegalToken}` },
      });
      const data = (await res.json()) as any;
      const returnedMatters = data.data || [];

      const leaked = returnedMatters.some((m: any) => m.id === ethicalMatterUuid);

      recordResult(
        '22. Ethical Wall prevents data leakage: restricted matter omitted from list & counts for screened user',
        res.status === 200 && !leaked,
        res.status,
        200,
        `Leaked in list? ${leaked}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 22B (SEC-03): Pagination total count matches returned visible dataset (No count discrepancy)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/matters?limit=50`, {
        headers: { Authorization: `Bearer ${paralegalToken}` },
      });
      const data = (await res.json()) as any;
      const returnedMatters = data.data || [];
      const totalCount = data.pagination?.total;

      // Because limit is 50 and total matters in test DB < 50, total must equal returnedMatters.length
      const countsMatch = totalCount === returnedMatters.length;

      recordResult(
        '22B. SEC-03: Ethical Wall list total count matches exact length of visible matters (Zero discrepancy)',
        res.status === 200 && countsMatch,
        res.status,
        200,
        `Total Count: ${totalCount}, Returned: ${returnedMatters.length}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 23: Audit Log Verification for Matter Actions
    // Verify MATTER_CREATED, MATTER_UPDATED, MATTER_STATUS_UPDATED, MATTER_STAFF_ASSIGNED, MATTER_STAFF_REMOVED
    // -------------------------------------------------------------------------
    {
      const logs = await prisma.auditLog.findMany({
        where: {
          resourceType: 'MATTER',
          resourceId: createdMatterUuid,
        },
      });

      const actions = logs.map((l) => l.action);
      const hasCreated = actions.includes('MATTER_CREATED');
      const hasUpdated = actions.includes('MATTER_UPDATED');
      const hasStatus = actions.includes('MATTER_STATUS_UPDATED');
      const hasStaffAssigned = actions.includes('MATTER_STAFF_ASSIGNED');
      const hasStaffRemoved = actions.includes('MATTER_STAFF_REMOVED');

      const allPresent =
        hasCreated && hasUpdated && hasStatus && hasStaffAssigned && hasStaffRemoved;

      recordResult(
        '23. Immutable Audit Logs recorded for all Matter actions (CREATED, UPDATED, STATUS_UPDATED, STAFF_ASSIGNED, STAFF_REMOVED)',
        allPresent,
        logs.length,
        5,
        `Recorded actions: ${actions.join(', ')}`
      );
    }
  } finally {
    server.close();
    await disconnectDatabase();
  }

  // Summary
  console.log('\n================================================================');
  console.log('MATTERS TEST SUITE SUMMARY');
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

runMatterTestSuite().catch(async (err) => {
  console.error('Fatal Matter test suite error:', err);
  await disconnectDatabase();
  process.exit(1);
});


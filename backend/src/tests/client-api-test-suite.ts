import { app } from '../app.js';
import { prisma, disconnectDatabase } from '../config/database.js';
import { Server } from 'http';

interface TestResult {
  name: string;
  passed: boolean;
  statusCode?: number;
  expectedStatus?: number;
  message?: string;
}

const results: TestResult[] = [];

function recordResult(name: string, passed: boolean, statusCode?: number, expectedStatus?: number, message?: string) {
  results.push({ name, passed, statusCode, expectedStatus, message });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} - ${name} [Status: ${statusCode ?? 'N/A'}, Expected: ${expectedStatus ?? 'N/A'}]`);
  if (!passed && message) {
    console.error(`       Details: ${message}`);
  }
}

async function runClientTestSuite() {
  console.log('================================================================');
  console.log('HEUGLY & BLUDWORTH - End-to-End Clients Module Test Suite');
  console.log('================================================================\n');

  const testPort = 5894;
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(testPort, () => resolve(s));
  });

  const baseUrl = `http://localhost:${testPort}/api/v1`;

  try {
    // -------------------------------------------------------------------------
    // PREPARATION: Obtain Super Admin Token for authorized calls
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
    const adminToken = loginData.data?.accessToken;
    const adminUserId = loginData.data?.user?.id;

    if (!adminToken) {
      throw new Error('Failed to log in as Super Admin during test suite setup.');
    }

    // -------------------------------------------------------------------------
    // TEST 1: Unauthorized Request (Missing Bearer Token)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients`);
      recordResult(
        '1. Unauthorized request without token rejected (401 Unauthorized)',
        res.status === 401,
        res.status,
        401
      );
    }

    // -------------------------------------------------------------------------
    // TEST 2: Missing Permission Gate
    // -------------------------------------------------------------------------
    {
      // Create a dummy user without clients permissions if needed, or tamper payload
      const res = await fetch(`${baseUrl}/clients`, {
        headers: { Authorization: 'Bearer invalid.tampered.token' },
      });
      recordResult(
        '2. Request with invalid/unauthorized token rejected (401 Unauthorized)',
        res.status === 401,
        res.status,
        401
      );
    }

    // -------------------------------------------------------------------------
    // TEST 3: Valid Client Creation
    // -------------------------------------------------------------------------
    let createdClientUuid = '';
    let createdClientNumber = '';
    const testClientEmail = `apex.logistics.${Date.now()}@utahfreight.com`;

    {
      const res = await fetch(`${baseUrl}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Wasatch Mountain Logistics LLC',
          type: 'Organization',
          primaryContact: 'Robert H. Henderson (CEO)',
          email: testClientEmail,
          phone: '(801) 555-0192',
          address: '1420 South Foothill Blvd, Suite 400, Salt Lake City, UT 84108',
          assignedAttorneyId: adminUserId,
          status: 'Active',
          notes: 'Commercial freight logistics client. Retainer agreement signed.',
          portalAccessEnabled: true,
        }),
      });

      const data = (await res.json()) as any;
      const ok = res.status === 201 && !!data.data?.client?.id && !!data.data?.client?.clientNumber;
      if (ok) {
        createdClientUuid = data.data.client.id;
        createdClientNumber = data.data.client.clientNumber;
      }

      recordResult(
        '3. Valid Client creation succeeds with generated CLI-xxxx (201 Created)',
        ok,
        res.status,
        201,
        JSON.stringify(data)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 4: Invalid Client Data (Missing Name, Bad Email, Missing Type)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: '',
          email: 'not-an-email',
          phone: '123',
        }),
      });
      const data = (await res.json()) as any;
      recordResult(
        '4. Invalid Client Data fails Zod validation (422 Unprocessable Entity)',
        res.status === 422,
        res.status,
        422,
        JSON.stringify(data.error)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 5: Attorney Assignment Validation (Rejects non-existent attorney UUID)
    // -------------------------------------------------------------------------
    {
      const fakeAttorneyUuid = '00000000-0000-0000-0000-000000000000';
      const res = await fetch(`${baseUrl}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Dr. Evelyn Martinez',
          type: 'Individual',
          email: `evelyn.${Date.now()}@health.org`,
          phone: '(801) 555-0348',
          assignedAttorneyId: fakeAttorneyUuid,
        }),
      });
      const data = (await res.json()) as any;
      recordResult(
        '5. Non-existent assigned attorney ID rejected (400 Bad Request)',
        res.status === 400 && data.error?.code === 'INVALID_ATTORNEY',
        res.status,
        400,
        JSON.stringify(data.error)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 6: Client Listing and Pagination
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients?page=1&limit=10&sortBy=clientNumber&sortOrder=asc`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      const ok = res.status === 200 && Array.isArray(data.data) && data.pagination?.total >= 1;
      recordResult(
        '6. GET /clients retrieves paginated client list with metadata (200 OK)',
        ok,
        res.status,
        200,
        JSON.stringify(data.pagination)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 7: Search and Filter Functionality
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients?search=Wasatch&status=Active`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      const ok = res.status === 200 && data.data.some((c: any) => c.name.includes('Wasatch'));
      recordResult(
        '7. Search by query string and filter by status returns matched clients (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 8: Client Detail by UUID
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients/${createdClientUuid}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      const ok = res.status === 200 && data.data?.client?.id === createdClientUuid;
      recordResult(
        '8. GET /clients/:id resolves client by UUID (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 9: Client Detail by Client Number (CLI-xxxx)
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients/${createdClientNumber}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      const ok = res.status === 200 && data.data?.client?.clientNumber === createdClientNumber;
      recordResult(
        '9. GET /clients/:clientNumber resolves client by business reference ID (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 10: Client Update
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients/${createdClientUuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          primaryContact: 'Robert H. Henderson (Executive Chairman)',
          notes: 'Updated scope: Master Service Agreement renewed for 2027.',
        }),
      });
      const data = (await res.json()) as any;
      const ok = res.status === 200 && data.data?.client?.primaryContact?.includes('Executive Chairman');
      recordResult(
        '10. PUT /clients/:id updates client fields successfully (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 11: Client Status Change
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients/${createdClientUuid}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'Inactive' }),
      });
      const data = (await res.json()) as any;
      const ok = res.status === 200 && data.data?.client?.status === 'Inactive';
      recordResult(
        '11. PATCH /clients/:id/status updates status to Inactive (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 12: Invalid Client ID Lookup
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients/CLI-999999`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      recordResult(
        '12. Non-existent client ID returns 404 Not Found (404 Not Found)',
        res.status === 404 && data.error?.code === 'CLIENT_NOT_FOUND',
        res.status,
        404
      );
    }

    // -------------------------------------------------------------------------
    // TEST 13: Client Matters Sub-resource
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/clients/${createdClientUuid}/matters`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as any;
      const ok = res.status === 200 && Array.isArray(data.data?.matters);
      recordResult(
        '13. GET /clients/:id/matters returns associated matters array (200 OK)',
        ok,
        res.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 14: Audit Log Verification
    // -------------------------------------------------------------------------
    {
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          resourceType: 'CLIENT',
          resourceId: createdClientUuid,
        },
      });

      const actions = auditLogs.map((a) => a.action);
      const hasCreated = actions.includes('CLIENT_CREATED');
      const hasUpdated = actions.includes('CLIENT_UPDATED');
      const hasStatus = actions.includes('CLIENT_STATUS_UPDATED');

      const ok = hasCreated && hasUpdated && hasStatus;
      recordResult(
        '14. Immutable Audit Logs recorded for CLIENT_CREATED, CLIENT_UPDATED, CLIENT_STATUS_UPDATED',
        ok,
        auditLogs.length,
        3,
        `Actions: ${actions.join(', ')}`
      );
    }
  } finally {
    server.close();
    await disconnectDatabase();
  }

  // Summary
  console.log('\n================================================================');
  console.log('CLIENTS TEST SUITE SUMMARY');
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

runClientTestSuite().catch(async (err) => {
  console.error('Fatal Client test suite error:', err);
  await disconnectDatabase();
  process.exit(1);
});


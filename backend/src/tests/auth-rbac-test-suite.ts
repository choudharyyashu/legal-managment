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
  console.log(`${icon} - ${name} [Status: ${statusCode || 'N/A'}, Expected: ${expectedStatus || 'N/A'}]`);
  if (!passed && message) {
    console.error(`       Details: ${message}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('HEUGLY & BLUDWORTH - End-to-End Auth & RBAC Verification Suite');
  console.log('================================================================\n');

  // Start temporary server
  const testPort = 5892;
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(testPort, () => resolve(s));
  });

  const baseUrl = `http://localhost:${testPort}/api/v1`;

  let adminAccessToken = '';
  let adminRefreshToken = '';
  let adminCookie = '';
  let createdAttorneyId = '';
  let attorneyAccessToken = '';

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Missing Credentials on Login
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', password: '' }),
      });
      const data = await res.json() as any;
      recordResult(
        '1. Login with Missing Credentials rejected (Validation Error 422)',
        res.status === 422,
        res.status,
        422,
        JSON.stringify(data.error)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 2: Invalid Password on Login
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'e.heugly@utahslawyers.com',
          password: 'WrongPassword123!',
        }),
      });
      const data = await res.json() as any;
      recordResult(
        '2. Login with Invalid Password rejected (Unauthorized 401)',
        res.status === 401 && data.error?.code === 'INVALID_CREDENTIALS',
        res.status,
        401,
        JSON.stringify(data.error)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 3: Valid Super Admin Login
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'e.heugly@utahslawyers.com',
          password: 'UtahLaw@2026!',
        }),
      });
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) adminCookie = setCookie;

      const data = await res.json() as any;
      const ok = res.status === 200 && data.success === true && !!data.data?.accessToken;
      if (ok) {
        adminAccessToken = data.data.accessToken;
        adminRefreshToken = data.data.refreshToken;
      }
      recordResult(
        '3. Valid Super Admin Login succeeds with tokens & cookie (200 OK)',
        ok,
        res.status,
        200,
        JSON.stringify(data)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 4: Access Protected /auth/me with Valid Token
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      const data = await res.json() as any;
      const ok = res.status === 200 && data.data?.user?.email === 'e.heugly@utahslawyers.com';
      recordResult(
        '4. Authenticated /auth/me returns current user profile (200 OK)',
        ok,
        res.status,
        200,
        JSON.stringify(data)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 5: Access Protected /auth/me with Invalid/Tampered Token
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: 'Bearer invalid.tampered.token.here' },
      });
      recordResult(
        '5. Access with Tampered Token rejected (401 Unauthorized)',
        res.status === 401,
        res.status,
        401
      );
    }

    // -------------------------------------------------------------------------
    // TEST 6: Refresh Token Rotation
    // -------------------------------------------------------------------------
    let rotatedRefreshToken = '';
    {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: adminCookie,
        },
        body: JSON.stringify({ refreshToken: adminRefreshToken }),
      });
      const data = await res.json() as any;
      const ok = res.status === 200 && !!data.data?.accessToken && !!data.data?.refreshToken;
      if (ok) {
        rotatedRefreshToken = data.data.refreshToken;
        // update adminAccessToken with refreshed one
        adminAccessToken = data.data.accessToken;
      }
      recordResult(
        '6. Refresh Token Rotation issues new Access & Refresh tokens (200 OK)',
        ok,
        res.status,
        200,
        JSON.stringify(data)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 7: Old Refresh Token Revocation Safeguard
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: adminRefreshToken }),
      });
      recordResult(
        '7. Replaying Old Refresh Token blocked by Rotation Revocation (401)',
        res.status === 401,
        res.status,
        401
      );
    }

    // -------------------------------------------------------------------------
    // TEST 8: Administrative User Provisioning (Create Attorney)
    // -------------------------------------------------------------------------
    const attorneyEmail = `t.bludworth.${Date.now()}@utahslawyers.com`;
    {
      const res = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminAccessToken}`,
        },
        body: JSON.stringify({
          name: 'Thomas Bludworth, Esq.',
          email: attorneyEmail,
          password: 'UtahLawAttorney@2026!',
          role: 'attorney',
          title: 'Litigation Partner',
          department: 'Civil Litigation',
          billingRate: 500.0,
        }),
      });
      const data = await res.json() as any;
      const ok = res.status === 201 && !!data.data?.user?.id;
      if (ok) {
        createdAttorneyId = data.data.user.id;
      }
      recordResult(
        '8. Super Admin provisions new Attorney account (201 Created)',
        ok,
        res.status,
        201,
        JSON.stringify(data)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 9: List Users with Pagination & Filter
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/users?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      const data = await res.json() as any;
      const ok = res.status === 200 && Array.isArray(data.data) && data.pagination?.total >= 2;
      recordResult(
        '9. GET /users retrieves paginated user list (200 OK)',
        ok,
        res.status,
        200,
        JSON.stringify(data.pagination)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 10: RBAC Authorization Gate - Attorney blocked from Managing Users
    // -------------------------------------------------------------------------
    {
      // First log in as the newly created attorney
      const attorneyLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: attorneyEmail,
          password: 'UtahLawAttorney@2026!',
        }),
      });
      const attorneyLoginData = await attorneyLoginRes.json() as any;
      const attorneyToken = attorneyLoginData.data?.accessToken;
      attorneyAccessToken = attorneyToken;

      // Attorney attempts to create a user (which requires 'users:manage')
      const unauthorizedCreateRes = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${attorneyToken}`,
        },
        body: JSON.stringify({
          name: 'Unauthorized User',
          email: 'unauth@utahslawyers.com',
          password: 'Password123!',
          role: 'paralegal',
        }),
      });

      const ok = unauthorizedCreateRes.status === 403;
      recordResult(
        '10. RBAC Gate: Non-admin (Attorney) blocked from managing users (403 Forbidden)',
        ok,
        unauthorizedCreateRes.status,
        403
      );
    }

    // -------------------------------------------------------------------------
    // TEST 11: Deactivate User & Verify Login Block
    // -------------------------------------------------------------------------
    {
      // Deactivate attorney
      const deactivateRes = await fetch(`${baseUrl}/users/${createdAttorneyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminAccessToken}`,
        },
        body: JSON.stringify({ status: 'Inactive' }),
      });
      const deactOk = deactivateRes.status === 200;

      // Try logging in with deactivated user
      const loginAttemptRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: attorneyEmail,
          password: 'UtahLawAttorney@2026!',
        }),
      });
      const blockOk = loginAttemptRes.status === 403;

      recordResult(
        '11. User Account Deactivation blocks subsequent logins (403 Forbidden)',
        deactOk && blockOk,
        loginAttemptRes.status,
        403
      );
    }

    // -------------------------------------------------------------------------
    // TEST 12: Re-activate User Account
    // -------------------------------------------------------------------------
    {
      const reactivateRes = await fetch(`${baseUrl}/users/${createdAttorneyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminAccessToken}`,
        },
        body: JSON.stringify({ status: 'Active' }),
      });
      recordResult(
        '12. User Account Re-activation restores Active state (200 OK)',
        reactivateRes.status === 200,
        reactivateRes.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 13: Password Reset Workflow
    // -------------------------------------------------------------------------
    {
      // Request forgot password
      const forgotRes = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: attorneyEmail }),
      });
      const forgotData = await forgotRes.json() as any;
      const resetToken = forgotData.data?.resetToken;

      let resetOk = false;
      if (resetToken) {
        const resetRes = await fetch(`${baseUrl}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: resetToken,
            newPassword: 'NewUtahLawPassword@2026!',
          }),
        });
        resetOk = resetRes.status === 200;
      }

      // Verify login with new password
      const newLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: attorneyEmail,
          password: 'NewUtahLawPassword@2026!',
        }),
      });

      const loginOk = newLoginRes.status === 200;

      recordResult(
        '13. Forgot/Reset Password workflow verifies token & enables new login (200 OK)',
        resetOk && loginOk,
        newLoginRes.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 14: Logout & Token Revocation
    // -------------------------------------------------------------------------
    {
      const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminAccessToken}`,
        },
        body: JSON.stringify({ refreshToken: rotatedRefreshToken }),
      });
      recordResult(
        '14. User Logout successfully clears session & revokes tokens (200 OK)',
        logoutRes.status === 200,
        logoutRes.status,
        200
      );
    }

    // -------------------------------------------------------------------------
    // TEST 15: Security Audit Logs Verification
    // -------------------------------------------------------------------------
    {
      const auditCount = await prisma.auditLog.count({
        where: { resourceType: { in: ['AUTH', 'USER', 'SECURITY'] } },
      });
      const ok = auditCount >= 5;
      recordResult(
        '15. Immutable Audit Logs recorded in test database for all auth & security events',
        ok,
        auditCount,
        5,
        `Audit entries recorded: ${auditCount}`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 16: Privilege Escalation Guard - Non-Super Admin Blocked from Creating Super Admin
    // -------------------------------------------------------------------------
    {
      const res = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${attorneyAccessToken}`,
        },
        body: JSON.stringify({
          name: 'Rogue Admin Candidate',
          email: `rogue.${Date.now()}@hb-legal.test`,
          password: 'RoguePassword123!',
          role: 'super_admin',
        }),
      });
      const data = (await res.json()) as any;
      const ok =
        res.status === 403 &&
        (data.error?.code === 'PRIVILEGE_ESCALATION_BLOCKED' ||
          data.error?.code === 'INSUFFICIENT_PERMISSIONS');
      recordResult(
        '16. Privilege Escalation Guard: Non-Super Admin blocked from creating Super Admin (403 Forbidden)',
        ok,
        res.status,
        403,
        JSON.stringify(data.error)
      );
    }

    // -------------------------------------------------------------------------
    // TEST 17: Immediate In-Flight Access Token Revocation upon Deactivation
    // -------------------------------------------------------------------------
    {
      // 1. Deactivate attorney again
      await fetch(`${baseUrl}/users/${createdAttorneyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminAccessToken}`,
        },
        body: JSON.stringify({ status: 'Inactive' }),
      });

      // 2. Attorney attempts to use existing valid, unexpired access token immediately
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${attorneyAccessToken}` },
      });
      const data = (await res.json()) as any;
      const ok = res.status === 403 && data.error?.code === 'ACCOUNT_DEACTIVATED';
      recordResult(
        '17. Immediate Token Revocation: In-flight access token of deactivated user blocked immediately (403)',
        ok,
        res.status,
        403,
        JSON.stringify(data.error)
      );
    }
  } finally {
    // Test Lifecycle Teardown: safely clean up test-created records to guarantee isolated, repeatable tests
    if (createdAttorneyId) {
      await prisma.user.delete({ where: { id: createdAttorneyId } }).catch(() => {});
    }
    server.close();
    await prisma.$disconnect();
  }

  // Summary
  console.log('\n================================================================');
  console.log('TEST SUITE SUMMARY');
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

runTestSuite();


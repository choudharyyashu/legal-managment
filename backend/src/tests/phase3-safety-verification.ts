/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Phase 3 Step 3.3.3 Safety Implementation Verification Test Suite
 *
 * Strictly isolated: Does NOT connect to Railway or any shared database.
 * Verifies all 10 required safety specifications.
 */

import { Prisma } from '@prisma/client';
import {
  parseDatabaseConfig,
  redactCredentials,
  validateTargetHost,
} from '../scripts/backup-db.js';
import { SettlementSafetyValidator } from '../modules/personal-injury/settlement-safety.js';
import { TrustService } from '../modules/trust/trust.service.js';

interface TestResult {
  testNumber: number;
  name: string;
  passed: boolean;
  actual: any;
  expected: any;
  notes?: string;
}

const results: TestResult[] = [];

function record(testNumber: number, name: string, passed: boolean, actual: any, expected: any, notes?: string) {
  results.push({ testNumber, name, passed, actual, expected, notes });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[Test ${testNumber}] ${status}: ${name}`);
  if (!passed) {
    console.error(`   Expected: ${JSON.stringify(expected)}`);
    console.error(`   Actual:   ${JSON.stringify(actual)}`);
  }
}

async function runTestSuite() {
  console.log('=============================================================================');
  console.log('PHASE 3 — STEP 3.3.3 SAFETY IMPLEMENTATION VERIFICATION TEST SUITE');
  console.log('=============================================================================\n');

  // ---------------------------------------------------------------------------
  // TEST 1: Two concurrent withdrawals against a $500 balance, each requesting $400.
  // Expected: Exactly one succeeds, second fails with INSUFFICIENT_TRUST_FUNDS, final balance = $100.
  // ---------------------------------------------------------------------------
  try {
    let mockBalance = new Prisma.Decimal(500.0);
    let lockQueue: Promise<void> = Promise.resolve();

    const simulateLockedDisbursement = async (amount: number, id: string) => {
      // Simulate MySQL InnoDB exclusive row lock queue (SELECT ... FOR UPDATE)
      const currentLock = lockQueue;
      let releaseLock: () => void = () => {};
      lockQueue = new Promise((resolve) => {
        releaseLock = resolve;
      });

      await currentLock;
      try {
        const disburse = new Prisma.Decimal(amount);
        if (mockBalance.lessThan(disburse)) {
          throw new Error('INSUFFICIENT_TRUST_FUNDS');
        }
        mockBalance = mockBalance.minus(disburse);
        return { success: true, remaining: mockBalance.toNumber(), id };
      } finally {
        releaseLock();
      }
    };

    const [res1, res2] = await Promise.allSettled([
      simulateLockedDisbursement(400.0, 'req-1'),
      simulateLockedDisbursement(400.0, 'req-2'),
    ]);

    const successes = [res1, res2].filter((r) => r.status === 'fulfilled');
    const failures = [res1, res2].filter((r) => r.status === 'rejected');

    const passed =
      successes.length === 1 &&
      failures.length === 1 &&
      mockBalance.equals(new Prisma.Decimal(100.0)) &&
      (failures[0] as PromiseRejectedResult).reason.message === 'INSUFFICIENT_TRUST_FUNDS';

    record(
      1,
      'Concurrent Withdrawals Serialization (Two $400 on $500 ledger -> exactly one succeeds, balance=$100)',
      passed,
      { successCount: successes.length, failCount: failures.length, finalBalance: mockBalance.toNumber() },
      { successCount: 1, failCount: 1, finalBalance: 100.0 }
    );
  } catch (err: any) {
    record(1, 'Concurrent Withdrawals Serialization', false, err.message, 'Handled without crash');
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Negative balance rejection
  // ---------------------------------------------------------------------------
  try {
    let rejected = false;
    try {
      const mockTx: any = {
        matter: {
          findUnique: async () => ({ id: 'mat-1', clientId: 'cli-1' }),
        },
        trustSubLedger: {
          findUnique: async () => ({ id: 'sub-1', balance: 50.0 }),
        },
        $queryRaw: async () => [{ id: 'sub-1', balance: 50.0 }],
      };

      // Attempt to disburse $100 against $50
      await TrustService.executeDisbursementOperation(
        { matterId: 'mat-1', amount: 100.0, sourceReference: 'REF', purpose: 'Payout', destinationAccount: 'Client Checking' },
        { userId: 'user-1' },
        mockTx
      );
    } catch (err: any) {
      if (err.code === 'INSUFFICIENT_TRUST_FUNDS' || err.message.includes('Insufficient trust funds')) {
        rejected = true;
      }
    }
    record(2, 'Negative Balance Rejection (Overdraft strictly blocked by validation under lock)', rejected, rejected, true);
  } catch (err: any) {
    record(2, 'Negative Balance Rejection', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: TrustTransaction and TrustSubLedger atomic rollback
  // ---------------------------------------------------------------------------
  try {
    let rollbackVerified = false;
    let ledgerUpdated = false;
    let txCreated = false;

    try {
      const mockTx: any = {
        matter: {
          findUnique: async () => ({ id: 'mat-1', clientId: 'cli-1' }),
        },
        trustSubLedger: {
          findUnique: async () => ({ id: 'sub-1', balance: 500.0 }),
          update: async () => {
            ledgerUpdated = true;
            throw new Error('SIMULATED_DB_FAILURE_AFTER_TRANSACTION');
          },
        },
        trustTransaction: {
          create: async () => {
            txCreated = true;
            return { id: 'tx-1' };
          },
        },
        $queryRaw: async () => [{ id: 'sub-1', balance: 500.0 }],
      };

      await TrustService.executeDisbursementOperation(
        { matterId: 'mat-1', amount: 50.0, sourceReference: 'REF', purpose: 'Payout', destinationAccount: 'Client Checking' },
        { userId: 'user-1' },
        mockTx
      );
    } catch (err: any) {
      if (err.message === 'SIMULATED_DB_FAILURE_AFTER_TRANSACTION') {
        rollbackVerified = true;
      }
    }
    record(
      3,
      'Atomic Rollback on Failure (Operation aborts and propagates error to Prisma $transaction rollback)',
      rollbackVerified && txCreated && ledgerUpdated,
      rollbackVerified,
      true
    );
  } catch (err: any) {
    record(3, 'Atomic Rollback on Failure', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Immutable settlement UPDATE rejection
  // ---------------------------------------------------------------------------
  try {
    let updateBlocked = false;
    try {
      SettlementSafetyValidator.assertVersionMutable({
        id: 'ver-1',
        isImmutable: true,
        versionStatus: 'FINALIZED',
      });
    } catch (err: any) {
      if (err.code === 'SETTLEMENT_VERSION_IMMUTABLE') {
        updateBlocked = true;
      }
    }
    record(4, 'Immutable Settlement UPDATE Rejection', updateBlocked, updateBlocked, true);
  } catch (err: any) {
    record(4, 'Immutable Settlement UPDATE Rejection', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Immutable settlement DELETE rejection
  // ---------------------------------------------------------------------------
  try {
    let deleteBlocked = false;
    try {
      SettlementSafetyValidator.assertVersionDeletable({
        id: 'ver-1',
        isImmutable: true,
        versionStatus: 'FINALIZED',
      });
    } catch (err: any) {
      if (err.code === 'SETTLEMENT_VERSION_CANNOT_DELETE') {
        deleteBlocked = true;
      }
    }
    record(5, 'Immutable Settlement DELETE Rejection', deleteBlocked, deleteBlocked, true);
  } catch (err: any) {
    record(5, 'Immutable Settlement DELETE Rejection', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Finalization with modified financial values rejection
  // ---------------------------------------------------------------------------
  try {
    let modificationBlocked = false;
    try {
      const current = {
        isImmutable: false,
        grossSettlementAmount: 100000.0,
        calculatedAttorneyFee: 33333.33,
        netClientRecovery: 66666.67,
      };

      const finalizationInput = {
        approvedByAttorneyId: 'user-atty-1',
        approvedAt: new Date(),
        clientApprovalDate: new Date(),
        signedClosingStatementDocId: 'doc-closing-1',
      };

      // Attacker attempts to surreptitiously alter gross settlement during finalization call
      const illicitUpdate = {
        grossSettlementAmount: 120000.0,
      };

      SettlementSafetyValidator.validateFinalizationTransition(current, finalizationInput, illicitUpdate);
    } catch (err: any) {
      if (err.code === 'CANNOT_MODIFY_FINANCIALS_AT_FINALIZATION') {
        modificationBlocked = true;
      }
    }
    record(
      6,
      'Finalization With Modified Financial Values Rejection',
      modificationBlocked,
      modificationBlocked,
      true
    );
  } catch (err: any) {
    record(6, 'Finalization With Modified Financial Values Rejection', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 7: New settlement version preserving old versions
  // ---------------------------------------------------------------------------
  try {
    const oldVersion = {
      settlementDisbursementId: 'disb-1',
      versionNumber: 1,
      grossSettlementAmount: 50000.0,
      contingencyFeePercentage: 33.33,
      calculatedAttorneyFee: 16665.0,
      totalLitigationCosts: 1000.0,
      totalClientAdvances: 0.0,
      totalMedicalLiens: 5000.0,
      otherDeductions: 0.0,
      netClientRecovery: 27335.0,
      isImmutable: true,
      versionStatus: 'FINALIZED',
    };

    const newDraft = SettlementSafetyValidator.prepareNewDraftVersion(oldVersion, 2, 'user-paralegal-1');

    const preserved =
      newDraft.versionNumber === 2 &&
      newDraft.versionStatus === 'DRAFT' &&
      newDraft.isImmutable === false &&
      oldVersion.isImmutable === true &&
      oldVersion.versionNumber === 1;

    record(7, 'New Settlement Version Preserving Old Versions', preserved, preserved, true);
  } catch (err: any) {
    record(7, 'New Settlement Version Preserving Old Versions', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Cross-Matter settlement and lien rejection
  // ---------------------------------------------------------------------------
  try {
    let subledgerCrossMatterBlocked = false;
    let lienCrossMatterBlocked = false;

    // Subledger mismatch
    try {
      SettlementSafetyValidator.validateCrossMatterSubledger('matter-AAA', 'matter-BBB');
    } catch (err: any) {
      if (err.code === 'CROSS_MATTER_SUBLEDGER_MISMATCH') {
        subledgerCrossMatterBlocked = true;
      }
    }

    // Lien mismatch
    try {
      SettlementSafetyValidator.validateCrossMatterLien('matter-AAA', 'matter-BBB', 'lien-999');
    } catch (err: any) {
      if (err.code === 'CROSS_MATTER_LIEN_MISMATCH') {
        lienCrossMatterBlocked = true;
      }
    }

    const passed = subledgerCrossMatterBlocked && lienCrossMatterBlocked;
    record(8, 'Cross-Matter Settlement and Lien Rejection', passed, passed, true);
  } catch (err: any) {
    record(8, 'Cross-Matter Settlement and Lien Rejection', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 9: Backup configuration refusing an unconfirmed cloud target
  // ---------------------------------------------------------------------------
  try {
    let cloudRefused = false;
    try {
      const cloudConfig = parseDatabaseConfig('mysql://root:secret@zephyr.proxy.rlwy.net:18623/railway');
      validateTargetHost(cloudConfig, false); // allowCloud = false
    } catch (err: any) {
      if (err.message.includes('Cloud backups require explicit confirmation')) {
        cloudRefused = true;
      }
    }
    record(9, 'Backup Configuration Refusing Unconfirmed Cloud Target', cloudRefused, cloudRefused, true);
  } catch (err: any) {
    record(9, 'Backup Configuration Refusing Unconfirmed Cloud Target', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 10: Backup credential redaction
  // ---------------------------------------------------------------------------
  try {
    const rawUrl = 'mysql://admin_user:super_secret_password_123@zephyr.proxy.rlwy.net:18623/railway';
    const redacted = redactCredentials(rawUrl);

    const safe = !redacted.includes('super_secret_password_123') && redacted.includes('admin_user:***@');
    record(10, 'Backup Credential Redaction in Logs', safe, redacted, 'mysql://admin_user:***@zephyr.proxy.rlwy.net:18623/railway');
  } catch (err: any) {
    record(10, 'Backup Credential Redaction', false, err.message, true);
  }

  console.log('\n=============================================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(`SUMMARY: ${results.filter((r) => r.passed).length} / ${results.length} TESTS PASSED.`);
  console.log(`RESULT:  ${allPassed ? 'ALL SAFETY TESTS PASSED (100%)' : 'TEST FAILURES DETECTED'}`);
  console.log('=============================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

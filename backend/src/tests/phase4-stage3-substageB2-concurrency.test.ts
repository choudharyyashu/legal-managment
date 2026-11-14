/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Phase 4 Stage 3 Sub-stage B.2: Atomic Demand Document Idempotency & Concurrency Test Suite
 *
 * TEST SUITE ARCHITECTURE & ENVIRONMENT CLASSIFICATION:
 * [ISOLATED IN-ENGINE CONCURRENCY & ASYNCHRONOUS MUTEX VERIFICATION]
 * Note: These tests run in an isolated in-engine sandbox with in-memory state.
 * They simulate Node.js event-loop concurrency, simultaneous promise races,
 * and database-backed record tracking without connecting to remote cloud infrastructure.
 * They verify algorithmic correctness, time-of-check to time-of-use (TOCTOU) mutex locks,
 * and retry release guarantees.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { MatterService } from '../modules/matters/matter.service.js';
import { AutoDraftService } from '../modules/documents/events/auto-draft.service.js';
import { PersonalInjuryService } from '../modules/personal-injury/pi.service.js';
import { DraftService } from '../modules/documents/drafts/draft.service.js';
import { DemandReadyPayload } from '../modules/documents/events/event.types.js';

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

async function runConcurrencyTestSuite() {
  console.log('=============================================================================');
  console.log('PHASE 4 — STAGE 3: SUB-STAGE B.2 (ATOMIC CONCURRENCY & IDEMPOTENCY SUITE)');
  console.log('Mode: Isolated In-Engine Event-Loop & Asynchronous Mutex Verification');
  console.log('=============================================================================\n');

  // State Store
  const store = {
    matters: new Map<string, any>(),
    demandPackages: new Map<string, any>(),
    documentDrafts: new Map<string, any>(),
    templates: new Map<string, any>(),
    reviewTasks: [] as any[],
    auditLogs: [] as any[],
  };

  const matter = {
    id: 'mat-conc-001',
    matterNumber: 'PI-2026-9001',
    title: 'Harrison v. Pacific Trucking',
    status: 'Active',
    clientId: 'cli-conc-001',
    responsibleAttorneyId: 'usr-atty-conc',
    practiceArea: { code: 'PI', name: 'Personal Injury' },
    client: { id: 'cli-conc-001', name: 'James Harrison' },
    responsibleAttorney: { id: 'usr-atty-conc', name: 'Eleanor Bludworth, Esq.' },
  };

  store.matters.set(matter.id, matter);

  // Template 140
  const template140 = {
    id: 'tpl-140-uuid',
    templateCode: '140',
    templateName: 'Personal Injury Settlement Demand Letter (Template 140)',
    isActive: true,
    versions: [
      {
        id: 'ver-140-v1',
        versionNumber: 'v1.0',
        docxStorageKey: 'storage/templates/140/template_140_v1.0.docx',
        fieldMappings: [
          { placeholderTag: 'Client.Name', sourceEntity: 'Client', sourceField: 'name', isRequired: true, formattingRule: 'NONE' },
          { placeholderTag: 'Matter.MatterNumber', sourceEntity: 'Matter', sourceField: 'matterNumber', isRequired: true, formattingRule: 'NONE' },
          { placeholderTag: 'Demand.RecipientCarrier', sourceEntity: 'Demand', sourceField: 'recipientCarrier', isRequired: true, formattingRule: 'NONE' },
          { placeholderTag: 'Demand.DemandedAmount', sourceEntity: 'Demand', sourceField: 'demandedAmount', isRequired: true, formattingRule: 'CURRENCY_USD' },
          { placeholderTag: 'Demand.DeadlineDate', sourceEntity: 'Demand', sourceField: 'deadlineDate', isRequired: true, formattingRule: 'DATE_LONG' },
          { placeholderTag: 'Attorney.Name', sourceEntity: 'ResponsibleAttorney', sourceField: 'name', isRequired: true, formattingRule: 'NONE' },
        ],
      },
    ],
  };

  store.templates.set('140', template140);
  store.templates.set('UT-PI-DEM-140', template140);

  // Users
  const user = {
    id: 'usr-atty-conc',
    email: 'ebludworth@utahslawyers.com',
    role: 'attorney',
    userCode: 'EB',
    permissions: ['matters:view', 'matters:edit'],
  };

  const context = { ipAddress: '127.0.0.1', userAgent: 'Concurrency-Test-Runner/1.0' };

  // Setup Mocks on Prisma
  MatterService.getMatterByIdOrNumber = async (id: string) => {
    return store.matters.get(id) || null;
  };

  (prisma.matter as any).findFirst = async ({ where }: any) => {
    const id = where?.OR?.[0]?.id || where?.id;
    return store.matters.get(id) || null;
  };

  (prisma.documentTemplate as any).findFirst = async () => template140;

  (prisma as any).pIDemandPackage = {
    findUnique: async ({ where }: any) => store.demandPackages.get(where.id) || null,
    update: async ({ where, data }: any) => {
      const existing = store.demandPackages.get(where.id) || { id: where.id };
      const updated = { ...existing, ...data };
      store.demandPackages.set(where.id, updated);
      return updated;
    },
  };

  let draftCounter = 0;
  (prisma.documentDraft as any).findUnique = async ({ where }: any) => store.documentDrafts.get(where.id) || null;

  (prisma.documentDraft as any).findFirst = async ({ where }: any) => {
    for (const draft of store.documentDrafts.values()) {
      if (draft.matterId === where.matterId) {
        if (where.title?.contains) {
          if (draft.title.includes(where.title.contains)) return draft;
        } else {
          return draft;
        }
      }
    }
    return null;
  };

  (prisma.documentDraft as any).create = async ({ data }: any) => {
    draftCounter++;
    const id = `dft-conc-${draftCounter}`;
    const draft = { id, ...data, createdAt: new Date() };
    store.documentDrafts.set(id, draft);
    return draft;
  };

  (prisma.auditLog as any).create = async ({ data }: any) => {
    store.auditLogs.push(data);
    return data;
  };

  // Mock DraftService.generateDraft to simulate realistic async I/O latency (25ms)
  let shouldSimulateDraftFailure = false;
  const originalGenerateDraft = DraftService.generateDraft;
  DraftService.generateDraft = async (input: any) => {
    // Artificial latency to reliably test concurrency race window
    await new Promise((resolve) => setTimeout(resolve, 25));

    if (shouldSimulateDraftFailure) {
      throw new Error('SIMULATED_TRANSIENT_IO_ERROR: Storage drive momentarily unavailable.');
    }

    draftCounter++;
    const id = `dft-conc-${draftCounter}`;
    const draftCode = `DFT-26-${String(draftCounter).padStart(4, '0')}`;
    const draft = {
      id,
      draftCode,
      matterId: input.matterId,
      templateId: input.templateId,
      title: input.title,
      missingFieldsFlags: [],
      docxStorageKey: `drafts/${input.matterId}/${draftCode}.docx`,
    };
    store.documentDrafts.set(id, draft);
    return draft as any;
  };

  // Mock TaskService.createTask
  (AutoDraftService as any).createDraftReviewTask = async (_matter: any, draft: any) => {
    store.reviewTasks.push({ id: `task-${Date.now()}`, draftId: draft.id });
  };

  // ---------------------------------------------------------------------------
  // TEST 1: Same Package Submitted Sequentially Twice
  // ---------------------------------------------------------------------------
  try {
    const pkgId1 = 'pkg-seq-001';
    store.demandPackages.set(pkgId1, { id: pkgId1, matterId: matter.id, checklistState: null });

    const payload: DemandReadyPayload = {
      matterId: matter.id,
      demandPackageId: pkgId1,
      demandTitle: 'Policy Limit Tender',
      demandAmount: 100000,
      recipientCarrier: 'State Farm',
      deadlineDate: '2026-12-31',
    };

    // 1st sequential execution
    const res1 = await AutoDraftService.handleDemandReady(payload, user, context);
    const draft1Created = res1.draftsCreated.length === 1;

    // 2nd sequential execution
    const res2 = await AutoDraftService.handleDemandReady(payload, user, context);
    const draft2Skipped = res2.skipped.length === 1 && res2.draftsCreated.length === 0;

    const totalDraftsForPkg1 = Array.from(store.documentDrafts.values()).filter((d) =>
      d.title.includes(pkgId1)
    ).length;

    const passed = draft1Created && draft2Skipped && totalDraftsForPkg1 === 1;
    record(
      1,
      'Same Package Submitted Sequentially Twice (second attempt safely skipped, 1 draft created)',
      passed,
      { draft1Created, draft2Skipped, totalDrafts: totalDraftsForPkg1 },
      { draft1Created: true, draft2Skipped: true, totalDrafts: 1 }
    );
  } catch (err: any) {
    record(1, 'Sequential duplicate submission', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Same Package Submitted Concurrently (Simultaneous Race Condition Simulation)
  // ---------------------------------------------------------------------------
  try {
    const pkgId2 = 'pkg-conc-002';
    store.demandPackages.set(pkgId2, { id: pkgId2, matterId: matter.id, checklistState: null });

    const payloadConcurrent: DemandReadyPayload = {
      matterId: matter.id,
      demandPackageId: pkgId2,
      demandTitle: 'Concurrent Policy Tender',
      demandAmount: 250000,
      recipientCarrier: 'Travelers Commercial',
      deadlineDate: '2026-12-31',
    };

    // Launch 3 simultaneous requests at the EXACT same millisecond
    const [cRes1, cRes2, cRes3] = await Promise.all([
      AutoDraftService.handleDemandReady(payloadConcurrent, user, context),
      AutoDraftService.handleDemandReady(payloadConcurrent, user, context),
      AutoDraftService.handleDemandReady(payloadConcurrent, user, context),
    ]);

    const totalDraftsForPkg2 = Array.from(store.documentDrafts.values()).filter((d) =>
      d.title.includes(pkgId2)
    ).length;

    // All three callers receive success
    const allSuccessful = cRes1.success && cRes2.success && cRes3.success;

    // Concurrency mutex guarantees exactly ONE draft is created across all concurrent requests
    const exactlyOneDraftCreated = totalDraftsForPkg2 === 1;

    const passed = allSuccessful && exactlyOneDraftCreated;
    record(
      2,
      'Same Package Submitted Concurrently (3 simultaneous requests -> exactly 1 draft created via mutex)',
      passed,
      { allSuccessful, totalDraftsCreated: totalDraftsForPkg2 },
      { allSuccessful: true, totalDraftsCreated: 1 }
    );
  } catch (err: any) {
    record(2, 'Concurrent duplicate submission race', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Two Different Demand Packages Submitted Concurrently Under the Same Matter
  // ---------------------------------------------------------------------------
  try {
    const pkgA = 'pkg-distinct-A';
    const pkgB = 'pkg-distinct-B';

    store.demandPackages.set(pkgA, { id: pkgA, matterId: matter.id, checklistState: null });
    store.demandPackages.set(pkgB, { id: pkgB, matterId: matter.id, checklistState: null });

    const payloadA: DemandReadyPayload = {
      matterId: matter.id,
      demandPackageId: pkgA,
      demandTitle: 'Primary Driver Liability Demand',
      demandAmount: 100000,
      recipientCarrier: 'Geico Direct',
      deadlineDate: '2026-12-31',
    };

    const payloadB: DemandReadyPayload = {
      matterId: matter.id,
      demandPackageId: pkgB,
      demandTitle: 'Underinsured Motorist Excess Demand',
      demandAmount: 300000,
      recipientCarrier: 'Allstate UIM',
      deadlineDate: '2027-01-15',
    };

    // Launch both distinct packages concurrently under the SAME Matter
    const [resA, resB] = await Promise.all([
      AutoDraftService.handleDemandReady(payloadA, user, context),
      AutoDraftService.handleDemandReady(payloadB, user, context),
    ]);

    const draftACreated = resA.draftsCreated.length === 1;
    const draftBCreated = resB.draftsCreated.length === 1;

    const draftsForA = Array.from(store.documentDrafts.values()).filter((d) => d.title.includes(pkgA)).length;
    const draftsForB = Array.from(store.documentDrafts.values()).filter((d) => d.title.includes(pkgB)).length;

    const passed = draftACreated && draftBCreated && draftsForA === 1 && draftsForB === 1;
    record(
      3,
      'Two Different Packages Submitted Concurrently on Same Matter (both generate independent drafts)',
      passed,
      { draftACreated, draftBCreated, draftsForA, draftsForB },
      { draftACreated: true, draftBCreated: true, draftsForA: 1, draftsForB: 1 }
    );
  } catch (err: any) {
    record(3, 'Two different packages on same matter concurrent', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Failed Generation Followed by Valid Retry (No Permanent Deadlock)
  // ---------------------------------------------------------------------------
  try {
    const pkgFail = 'pkg-retry-test';
    store.demandPackages.set(pkgFail, { id: pkgFail, matterId: matter.id, checklistState: null });

    const payloadRetry: DemandReadyPayload = {
      matterId: matter.id,
      demandPackageId: pkgFail,
      demandTitle: 'Transient Failure Test Demand',
      demandAmount: 50000,
      recipientCarrier: 'Farmers Insurance',
      deadlineDate: '2026-12-31',
    };

    // Step 1: Simulate transient failure
    shouldSimulateDraftFailure = true;
    const failedResult = await AutoDraftService.handleDemandReady(payloadRetry, user, context);
    const firstAttemptFailed = failedResult.success === false;

    // Step 2: Clear failure condition (drive recovered)
    shouldSimulateDraftFailure = false;

    // Step 3: Immediate retry
    const retryResult = await AutoDraftService.handleDemandReady(payloadRetry, user, context);
    const retrySucceeded = retryResult.success === true && retryResult.draftsCreated.length === 1;

    const passed = firstAttemptFailed && retrySucceeded;
    record(
      4,
      'Failed Generation Followed by Valid Retry (mutex cleans up in finally block, no deadlock)',
      passed,
      { firstAttemptFailed, retrySucceeded },
      { firstAttemptFailed: true, retrySucceeded: true }
    );
  } catch (err: any) {
    record(4, 'Failed generation retry', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Compatibility with Existing Sub-stage A and B Workflows
  // ---------------------------------------------------------------------------
  try {
    // Verify that DraftService and AutoDraftService work without regressions
    const pkgStandard = 'pkg-std-005';
    store.demandPackages.set(pkgStandard, { id: pkgStandard, matterId: matter.id, checklistState: null });

    const standardPayload: DemandReadyPayload = {
      matterId: matter.id,
      demandPackageId: pkgStandard,
      demandTitle: 'Standard Settlement Demand',
      demandAmount: 150000,
      recipientCarrier: 'State Farm',
      deadlineDate: '2026-12-31',
    };

    const res = await AutoDraftService.handleDemandReady(standardPayload, user, context);

    const passed = res.success === true && res.draftsCreated.length === 1;
    record(
      5,
      'Compatibility with Existing Sub-stage A and B Workflows (clean execution)',
      passed,
      { success: res.success, draftsCount: res.draftsCreated.length },
      { success: true, draftsCount: 1 }
    );
  } catch (err: any) {
    record(5, 'Sub-stage A & B workflow compatibility', false, err.message, true);
  }

  // Restore original DraftService
  DraftService.generateDraft = originalGenerateDraft;

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n=============================================================================');
  const allPassed = results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`SUB-STAGE B.2 CONCURRENCY TEST RESULTS: ${passedCount}/${results.length} PASSED`);
  console.log('=============================================================================');

  if (!allPassed) {
    process.exit(1);
  }
}

runConcurrencyTestSuite().catch((err) => {
  console.error('Fatal concurrency test error:', err);
  process.exit(1);
});

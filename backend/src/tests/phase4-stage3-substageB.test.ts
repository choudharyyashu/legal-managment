/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Phase 4 Stage 3 Sub-stage B: Insurance & Demand APIs Verification Suite
 *
 * Strictly isolated: Does NOT connect to Railway or any external database.
 * Verifies all Sub-stage B specifications:
 * 1. Successful insurance creation and retrieval
 * 2. Invalid insurance payload validation
 * 3. Unauthorized Matter access (Utah RPC 1.10)
 * 4. Cross-Matter insurance isolation
 * 5. Successful demand creation and retrieval with Decimal precision
 * 6. Invalid demand amounts and fields
 * 7. Missing Matter handling
 * 8. Duplicate event prevention & Demand Ready trigger
 * 9. Correct demand-to-Matter association
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../errors/AppError.js';
import { MatterService } from '../modules/matters/matter.service.js';
import { PersonalInjuryService } from '../modules/personal-injury/pi.service.js';
import { DOCUMENT_EVENT, DemandReadyPayload } from '../modules/documents/events/event.types.js';
import { DocumentEventBus } from '../modules/documents/events/event-bus.js';
import { insurancePolicySchema, demandPackageSchema } from '../modules/personal-injury/pi.validation.js';

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

async function runSubstageBTests() {
  console.log('=============================================================================');
  console.log('PHASE 4 — STAGE 3: SUB-STAGE B (INSURANCE & DEMAND APIS TEST SUITE)');
  console.log('=============================================================================\n');

  // In-Memory Database Fixture
  const db = {
    matters: new Map<string, any>(),
    incidents: new Map<string, any>(),
    insurancePolicies: new Map<string, any>(),
    demandPackages: new Map<string, any>(),
    documentDrafts: new Map<string, any>(),
    auditLogs: [] as any[],
  };

  // Seed Matters
  const matterA = {
    id: 'mat-uuid-aaaa-0001',
    matterNumber: 'PI-2026-0001',
    title: 'Anderson v. Wasatch Freight',
    status: 'Active',
    clientId: 'cli-001',
    responsibleAttorneyId: 'usr-atty-01',
    staffAssignments: [{ userId: 'usr-atty-01' }],
  };

  const matterB = {
    id: 'mat-uuid-bbbb-0002',
    matterNumber: 'PI-2026-0002',
    title: 'Baker v. Salt Lake Metro',
    status: 'Active',
    clientId: 'cli-002',
    responsibleAttorneyId: 'usr-atty-02',
    staffAssignments: [{ userId: 'usr-atty-02' }],
  };

  db.matters.set(matterA.id, matterA);
  db.matters.set(matterA.matterNumber, matterA);
  db.matters.set(matterB.id, matterB);
  db.matters.set(matterB.matterNumber, matterB);

  // Seed Incident for Matter A
  const incidentA = {
    id: 'inc-uuid-0001',
    matterId: matterA.id,
    incidentLocation: 'I-15 Southbound, Salt Lake City',
  };
  db.incidents.set(incidentA.id, incidentA);

  // Seed Incident for Matter B
  const incidentB = {
    id: 'inc-uuid-0002',
    matterId: matterB.id,
    incidentLocation: 'State St & 200 S, Salt Lake City',
  };
  db.incidents.set(incidentB.id, incidentB);

  // Users
  const authorizedUser = {
    id: 'usr-atty-01',
    email: 'atty1@utahslawyers.com',
    role: 'attorney',
    userCode: 'AT1',
    permissions: ['matters:view', 'matters:edit'],
  };

  const screenedUser = {
    id: 'usr-screened-09',
    email: 'screened@utahslawyers.com',
    role: 'paralegal',
    userCode: 'SC9',
    permissions: ['matters:view'],
  };

  // Mock Prisma Methods
  const originalGetMatter = MatterService.getMatterByIdOrNumber;
  MatterService.getMatterByIdOrNumber = async (idOrNumber: string, user: any) => {
    if (user.id === screenedUser.id) {
      throw AppError.forbidden('Access denied: You are screened from this matter (Utah RPC 1.10).', 'FORBIDDEN');
    }
    const found = db.matters.get(idOrNumber);
    if (!found) {
      throw AppError.notFound(`Matter '${idOrNumber}' was not found.`, 'MATTER_NOT_FOUND');
    }
    return found;
  };

  // Mock Prisma delegates
  (prisma.insurancePolicy as any).create = async ({ data }: any) => {
    const id = `pol-${Date.now()}-${Math.random().toString().slice(2, 6)}`;
    const created = { id, createdAt: new Date(), updatedAt: new Date(), ...data };
    db.insurancePolicies.set(id, created);
    return created;
  };

  (prisma.insurancePolicy as any).findMany = async ({ where }: any) => {
    const list = Array.from(db.insurancePolicies.values()).filter((p) => p.matterId === where.matterId);
    return list;
  };

  (prisma.insurancePolicy as any).findFirst = async ({ where }: any) => {
    for (const p of db.insurancePolicies.values()) {
      let match = true;
      if (where.id && p.id !== where.id) match = false;
      if (where.matterId && p.matterId !== where.matterId) match = false;
      if (match) return p;
    }
    return null;
  };

  (prisma.incident as any).findFirst = async ({ where }: any) => {
    for (const inc of db.incidents.values()) {
      let match = true;
      if (where.id && inc.id !== where.id) match = false;
      if (where.matterId && inc.matterId !== where.matterId) match = false;
      if (match) return inc;
    }
    return null;
  };

  (prisma as any).pIDemandPackage = {
    create: async ({ data }: any) => {
      const id = `dem-${Date.now()}-${Math.random().toString().slice(2, 6)}`;
      const created = { id, createdAt: new Date(), updatedAt: new Date(), ...data };
      db.demandPackages.set(id, created);
      return created;
    },
    findMany: async ({ where }: any) => {
      return Array.from(db.demandPackages.values()).filter((d) => d.matterId === where.matterId);
    },
    findFirst: async ({ where }: any) => {
      for (const d of db.demandPackages.values()) {
        let match = true;
        if (where.id && d.id !== where.id) match = false;
        if (where.matterId && d.matterId !== where.matterId) match = false;
        if (match) return d;
      }
      return null;
    },
  };

  (prisma as any).documentDraft = {
    findFirst: async ({ where }: any) => {
      for (const draft of db.documentDrafts.values()) {
        if (draft.matterId === where.matterId) {
          if (where.OR) {
            const matchesOr = where.OR.some((condition: any) => {
              if (condition.title?.contains && draft.title.includes(condition.title.contains)) return true;
              return false;
            });
            if (matchesOr) return draft;
          } else {
            return draft;
          }
        }
      }
      return null;
    },
  };

  (prisma.auditLog as any).create = async ({ data }: any) => {
    db.auditLogs.push(data);
    return data;
  };

  const context = { ipAddress: '127.0.0.1', userAgent: 'Jest-Isolated-Test/1.0' };

  // ---------------------------------------------------------------------------
  // TEST 1: Successful Insurance Policy Creation
  // ---------------------------------------------------------------------------
  let createdPolicyA: any = null;
  try {
    const input = {
      insuranceCompany: 'State Farm Mutual',
      coverageType: 'Liability',
      policyNumber: 'SF-99120-01',
      claimNumber: 'CLM-2026-4411',
      adjusterName: 'Robert Vance',
      adjusterPhone: '(801) 555-4321',
      adjusterEmail: 'rvance@statefarm.com',
      policyLimits: '$250,000 / $500,000',
      status: 'Active',
    };

    createdPolicyA = await PersonalInjuryService.createInsurancePolicy(
      matterA.id,
      input,
      authorizedUser,
      context
    );

    const passed =
      Boolean(createdPolicyA.id) &&
      createdPolicyA.matterId === matterA.id &&
      createdPolicyA.insuranceCompany === 'State Farm Mutual' &&
      createdPolicyA.claimNumber === 'CLM-2026-4411' &&
      createdPolicyA.coverageType === 'Liability' &&
      createdPolicyA.incidentId === incidentA.id; // Linked to primary incident

    record(
      1,
      'Successful Insurance Policy Creation with validation & primary incident linking',
      passed,
      { id: createdPolicyA.id, company: createdPolicyA.insuranceCompany, matterId: createdPolicyA.matterId },
      { id: 'pol-*', company: 'State Farm Mutual', matterId: matterA.id }
    );
  } catch (err: any) {
    record(1, 'Successful Insurance Policy Creation', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Insurance Policy Retrieval for Matter
  // ---------------------------------------------------------------------------
  try {
    const res = await PersonalInjuryService.getInsurancePolicies(matterA.id, authorizedUser);

    const passed =
      res.matterId === matterA.id &&
      res.totalCount === 1 &&
      res.policies.length === 1 &&
      res.policies[0].insuranceCompany === 'State Farm Mutual';

    record(
      2,
      'Successful Insurance Policy Retrieval for Matter',
      passed,
      { count: res.totalCount, company: res.policies[0]?.insuranceCompany },
      { count: 1, company: 'State Farm Mutual' }
    );
  } catch (err: any) {
    record(2, 'Insurance Policy Retrieval', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Invalid Insurance Payload Validation
  // ---------------------------------------------------------------------------
  try {
    let emptyCompanyRejected = false;
    try {
      await PersonalInjuryService.createInsurancePolicy(
        matterA.id,
        { insuranceCompany: '   ' } as any,
        authorizedUser,
        context
      );
    } catch (err: any) {
      emptyCompanyRejected = err.code === 'INVALID_INSURANCE_COMPANY' || err.statusCode === 400;
    }

    let schemaValidationRejected = false;
    try {
      insurancePolicySchema.parse({
        insuranceCompany: '',
        adjusterEmail: 'not-an-email',
      });
    } catch (err: any) {
      schemaValidationRejected = true;
    }

    const passed = emptyCompanyRejected && schemaValidationRejected;
    record(
      3,
      'Invalid Insurance Payload Validation (empty company & invalid email rejected)',
      passed,
      { emptyCompanyRejected, schemaValidationRejected },
      { emptyCompanyRejected: true, schemaValidationRejected: true }
    );
  } catch (err: any) {
    record(3, 'Invalid Insurance Payload Validation', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Cross-Matter Insurance Isolation
  // ---------------------------------------------------------------------------
  try {
    let crossMatterBlocked = false;
    try {
      // Attempt to link Matter B's incident to an insurance policy on Matter A
      await PersonalInjuryService.createInsurancePolicy(
        matterA.id,
        {
          insuranceCompany: 'Allstate Insurance',
          incidentId: incidentB.id, // Belongs to Matter B!
        },
        authorizedUser,
        context
      );
    } catch (err: any) {
      crossMatterBlocked = err.code === 'CROSS_MATTER_ISOLATION_VIOLATION';
    }

    record(
      4,
      'Cross-Matter Insurance Isolation (linking incident from another matter is strictly rejected)',
      crossMatterBlocked,
      { crossMatterBlocked },
      { crossMatterBlocked: true }
    );
  } catch (err: any) {
    record(4, 'Cross-Matter Insurance Isolation', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Unauthorized Matter Access (Utah RPC 1.10 Ethical Boundary)
  // ---------------------------------------------------------------------------
  try {
    let insuranceDenied = false;
    let demandDenied = false;

    try {
      await PersonalInjuryService.getInsurancePolicies(matterA.id, screenedUser);
    } catch (err: any) {
      insuranceDenied = err.statusCode === 403 || err.code === 'FORBIDDEN';
    }

    try {
      await PersonalInjuryService.getDemandPackages(matterA.id, screenedUser);
    } catch (err: any) {
      demandDenied = err.statusCode === 403 || err.code === 'FORBIDDEN';
    }

    const passed = insuranceDenied && demandDenied;
    record(
      5,
      'Unauthorized Matter Access Rejection (Ethical Wall enforcement)',
      passed,
      { insuranceDenied, demandDenied },
      { insuranceDenied: true, demandDenied: true }
    );
  } catch (err: any) {
    record(5, 'Unauthorized Matter Access Rejection', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Missing Matter Handling
  // ---------------------------------------------------------------------------
  try {
    let missingMatterHandled = false;
    try {
      await PersonalInjuryService.createInsurancePolicy(
        'non-existent-matter-id',
        { insuranceCompany: 'Geico' },
        authorizedUser,
        context
      );
    } catch (err: any) {
      missingMatterHandled = err.code === 'MATTER_NOT_FOUND' && err.statusCode === 404;
    }

    record(
      6,
      'Missing Matter Handling (returns 404 MATTER_NOT_FOUND)',
      missingMatterHandled,
      { missingMatterHandled },
      { missingMatterHandled: true }
    );
  } catch (err: any) {
    record(6, 'Missing Matter Handling', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Successful Demand Creation with Exact Decimal Financial Precision
  // ---------------------------------------------------------------------------
  let createdDemandA: any = null;
  try {
    const input = {
      demandTitle: 'Comprehensive Policy Limit Settlement Demand',
      recipientCarrier: 'State Farm Mutual',
      claimNumber: 'CLM-2026-4411',
      insurancePolicyId: createdPolicyA.id,
      demandedAmount: 250000.0,
      policyLimitAmount: 250000.0,
      isPolicyLimitDemand: true,
      deadlineDate: '2026-12-15T00:00:00.000Z',
      status: 'DRAFTING', // Drafting status: should NOT dispatch event
      notes: 'Initial formal demand following maximum medical improvement (MMI).',
    };

    const res = await PersonalInjuryService.createDemandPackage(
      matterA.id,
      input,
      authorizedUser,
      context
    );

    createdDemandA = res.demandPackage;
    const isDecimalInstance = createdDemandA.demandedAmount instanceof Prisma.Decimal;
    const demandedVal = createdDemandA.demandedAmount.toNumber();
    const eventDispatched = res.eventDispatched;

    const passed =
      Boolean(createdDemandA.id) &&
      createdDemandA.matterId === matterA.id &&
      isDecimalInstance &&
      demandedVal === 250000 &&
      createdDemandA.isPolicyLimitDemand === true &&
      createdDemandA.recipientCarrier === 'State Farm Mutual' &&
      eventDispatched === false; // Suppressed on DRAFTING status

    record(
      7,
      'Successful Demand Creation with exact Decimal precision (DRAFTING suppresses event)',
      passed,
      { id: createdDemandA.id, isDecimalInstance, demandedVal, eventDispatched },
      { id: 'dem-*', isDecimalInstance: true, demandedVal: 250000, eventDispatched: false }
    );
  } catch (err: any) {
    record(7, 'Successful Demand Creation', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Invalid Demand Amounts and Field Validation
  // ---------------------------------------------------------------------------
  try {
    let negativeAmountBlocked = false;
    try {
      await PersonalInjuryService.createDemandPackage(
        matterA.id,
        {
          demandTitle: 'Policy Demand',
          recipientCarrier: 'State Farm',
          demandedAmount: -50000,
          deadlineDate: '2026-12-15',
        },
        authorizedUser,
        context
      );
    } catch (err: any) {
      negativeAmountBlocked = err.code === 'INVALID_DEMANDED_AMOUNT';
    }

    let zeroAmountBlocked = false;
    try {
      await PersonalInjuryService.createDemandPackage(
        matterA.id,
        {
          demandTitle: 'Policy Demand',
          recipientCarrier: 'State Farm',
          demandedAmount: 0,
          deadlineDate: '2026-12-15',
        },
        authorizedUser,
        context
      );
    } catch (err: any) {
      zeroAmountBlocked = err.code === 'INVALID_DEMANDED_AMOUNT';
    }

    let missingCarrierBlocked = false;
    try {
      await PersonalInjuryService.createDemandPackage(
        matterA.id,
        {
          demandTitle: 'Policy Demand',
          recipientCarrier: '   ',
          demandedAmount: 100000,
          deadlineDate: '2026-12-15',
        },
        authorizedUser,
        context
      );
    } catch (err: any) {
      missingCarrierBlocked = err.code === 'INVALID_RECIPIENT_CARRIER';
    }

    let invalidDeadlineBlocked = false;
    try {
      await PersonalInjuryService.createDemandPackage(
        matterA.id,
        {
          demandTitle: 'Policy Demand',
          recipientCarrier: 'State Farm',
          demandedAmount: 100000,
          deadlineDate: 'not-a-valid-date',
        },
        authorizedUser,
        context
      );
    } catch (err: any) {
      invalidDeadlineBlocked = err.code === 'INVALID_DEADLINE_DATE';
    }

    const passed = negativeAmountBlocked && zeroAmountBlocked && missingCarrierBlocked && invalidDeadlineBlocked;
    record(
      8,
      'Invalid Demand Amounts & Field Validation (negative, zero, empty carrier, invalid date)',
      passed,
      { negativeAmountBlocked, zeroAmountBlocked, missingCarrierBlocked, invalidDeadlineBlocked },
      { negativeAmountBlocked: true, zeroAmountBlocked: true, missingCarrierBlocked: true, invalidDeadlineBlocked: true }
    );
  } catch (err: any) {
    record(8, 'Invalid Demand Amounts & Field Validation', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 9: Cross-Matter Demand Policy Linking Isolation
  // ---------------------------------------------------------------------------
  try {
    let crossMatterPolicyBlocked = false;
    try {
      // Create a policy under Matter B
      const policyB = await PersonalInjuryService.createInsurancePolicy(
        matterB.id,
        { insuranceCompany: 'Farmers Insurance' },
        { ...authorizedUser, id: 'usr-atty-02' },
        context
      );

      // Attempt to link Policy B to Demand under Matter A
      await PersonalInjuryService.createDemandPackage(
        matterA.id,
        {
          demandTitle: 'Cross Matter Demand Attempt',
          recipientCarrier: 'Farmers Insurance',
          insurancePolicyId: policyB.id, // Belongs to Matter B!
          demandedAmount: 100000,
          deadlineDate: '2026-12-31',
        },
        authorizedUser,
        context
      );
    } catch (err: any) {
      crossMatterPolicyBlocked = err.code === 'CROSS_MATTER_ISOLATION_VIOLATION';
    }

    record(
      9,
      'Cross-Matter Demand Isolation (linking insurance policy from another matter rejected)',
      crossMatterPolicyBlocked,
      { crossMatterPolicyBlocked },
      { crossMatterPolicyBlocked: true }
    );
  } catch (err: any) {
    record(9, 'Cross-Matter Demand Isolation', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // TEST 10: Demand Ready Event Dispatch & Duplicate Event Prevention
  // ---------------------------------------------------------------------------
  try {
    let eventReceivedCount = 0;
    let receivedEventPayload: DemandReadyPayload | null = null;

    DocumentEventBus.subscribe<DemandReadyPayload>(DOCUMENT_EVENT.PI_DEMAND_READY, async (payload) => {
      eventReceivedCount++;
      receivedEventPayload = payload;
    });

    // 1st Creation with status: 'READY'
    const res1 = await PersonalInjuryService.createDemandPackage(
      matterA.id,
      {
        demandTitle: 'Ready Settlement Demand',
        recipientCarrier: 'State Farm Mutual',
        demandedAmount: 350000,
        deadlineDate: '2026-12-31',
        status: 'READY', // Triggers readiness condition
      },
      authorizedUser,
      context
    );

    const firstEventDispatched = res1.eventDispatched;

    // Simulate draft creation in database so idempotency guard has a record to inspect
    db.documentDrafts.set('dft-001', {
      id: 'dft-001',
      matterId: matterA.id,
      title: `Settlement Demand - ${res1.demandPackage.id}`,
    });

    // 2nd Creation attempting to re-trigger for the same package
    const res2 = await PersonalInjuryService.createDemandPackage(
      matterA.id,
      {
        demandTitle: 'Ready Settlement Demand',
        recipientCarrier: 'State Farm Mutual',
        demandedAmount: 350000,
        deadlineDate: '2026-12-31',
        status: 'READY',
      },
      authorizedUser,
      context
    );

    // Because a draft already exists matching title 'Ready Settlement Demand', res2 should suppress dispatch
    const secondEventDispatched = res2.eventDispatched;

    const passed = firstEventDispatched === true && secondEventDispatched === false;
    record(
      10,
      'Demand Ready Event Integration (dispatches on READY; suppresses on duplicate draft)',
      passed,
      { firstEventDispatched, secondEventDispatched },
      { firstEventDispatched: true, secondEventDispatched: false }
    );
  } catch (err: any) {
    record(10, 'Demand Ready Event Integration', false, err.message, true);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n=============================================================================');
  const allPassed = results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`SUB-STAGE B TEST RESULTS: ${passedCount}/${results.length} PASSED`);
  console.log('=============================================================================');

  // Restore original MatterService method
  MatterService.getMatterByIdOrNumber = originalGetMatter;

  if (!allPassed) {
    process.exit(1);
  }
}

runSubstageBTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

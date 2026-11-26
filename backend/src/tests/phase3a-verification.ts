/**
 * LEGAL MANAGEMENT SYSTEM - PHASE 3.A SANDBOX VERIFICATION TEST SUITE
 * 
 * Strict Isolation: Connects ONLY to legalpro_isolated_test
 * Verifies the 5 Approved Automations:
 * 1. CAT-001 - Consultation Confirmation & Rescheduling Lifecycle
 * 2. CAT-002 - Prospective Client Questionnaire (Practice Area Segregation)
 * 3. CAT-003 - Conflict Search Report & Ethical Safeguards (Utah RPC 1.7)
 * 4. CAT-010 - Intake-to-Matter Conversion Welcome Letter
 * 5. CAT-300 - Eviction Judgment Payment & Closure Letter (Financial Safeguard)
 * 
 * Baseline Records (INT-26-0001, 26-FAM-0101, DFT-26-0001) are strictly verified untouched.
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '../../');
process.chdir(backendDir);
dotenv.config({ path: path.resolve(backendDir, '.env') });

// Enforce Sandbox Database Isolation URL BEFORE any module imports database
const ISOLATED_TEST_DB_URL = 'mysql://root:tavrdBoFlfWXWrCwIndZVPKrmUdwnSXj@zephyr.proxy.rlwy.net:18623/legalpro_isolated_test';
process.env.DATABASE_URL = ISOLATED_TEST_DB_URL;

import { prisma } from '../config/database.js';
import { DocumentEventBus } from '../modules/documents/events/event-bus.js';
import { DOCUMENT_EVENT } from '../modules/documents/events/event.types.js';
import { AutoDraftService } from '../modules/documents/events/auto-draft.service.js';
import { IntakeService } from '../modules/intakes/intake.service.js';
import { EvictionsService } from '../modules/evictions/evictions.service.js';
import { MatterService } from '../modules/matters/matter.service.js';
import { StorageService } from '../modules/documents/storage/storage.service.js';
import { AuthenticatedUser } from '../modules/auth/auth.types.js';

interface VerificationResult {
  suite: string;
  name: string;
  status: 'PASSED' | 'FAILED';
  details?: any;
}

const testResults: VerificationResult[] = [];

function record(suite: string, name: string, status: 'PASSED' | 'FAILED', details?: any) {
  testResults.push({ suite, name, status, details });
  const icon = status === 'PASSED' ? '✓' : '✗';
  console.log(`[${icon} ${status}] [${suite}] ${name}${details ? ` -> ${typeof details === 'string' ? details : JSON.stringify(details)}` : ''}`);
}

const adminUser: AuthenticatedUser = {
  id: '66c97d44-096b-4d34-8bd1-5691ba855e23',
  userCode: 'USR-ADMIN',
  name: 'Eleanor Heugly, Esq.',
  email: 'e.heugly@utahslawyers.com',
  role: 'super_admin',
  permissions: ['*'],
};

const attorneyUser: AuthenticatedUser = {
  id: '8640f71a-0142-42f4-a4c0-732537dcd9b7',
  userCode: 'USR-ATTY',
  name: 'Thomas Bludworth, Esq.',
  email: 't.bludworth@utahslawyers.com',
  role: 'attorney',
  permissions: ['matters:view', 'matters:edit', 'documents:create', 'documents:view'],
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDraft(query: any, maxWaitMs = 90000, intervalMs = 1000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const draft = await prisma.documentDraft.findFirst(query);
    if (draft) return draft;
    await sleep(intervalMs);
  }
  return null;
}

async function waitForTask(query: any, maxWaitMs = 90000, intervalMs = 1000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const task = await prisma.task.findFirst(query);
    if (task) return task;
    await sleep(intervalMs);
  }
  return null;
}

async function runPhase3aVerification() {
  console.log('================================================================');
  console.log('LEGAL MANAGEMENT SYSTEM - PHASE 3.A SANDBOX VERIFICATION');
  console.log('Target DB: legalpro_isolated_test');
  console.log('Time: ' + new Date().toISOString());
  console.log('================================================================\n');

  // STAGE 0: DATABASE ISOLATION VERIFICATION
  const dbCheck: any = await prisma.$queryRawUnsafe('SELECT DATABASE() as db, @@hostname as host, @@port as port');
  const activeDb = dbCheck[0]?.db;
  if (activeDb !== 'legalpro_isolated_test') {
    throw new Error(`CRITICAL FAILURE: Connected to '${activeDb}'! Must be 'legalpro_isolated_test'. Aborting tests.`);
  }
  record('STAGE 0', 'Database Isolation Verified', 'PASSED', { activeDb, host: dbCheck[0]?.host });

  // STAGE 0.1: BASELINE HISTORICAL RECORDS SNAPSHOT
  const baselineIntake = await prisma.intake.findUnique({ where: { intakeNumber: 'INT-26-0001' } });
  const baselineMatter = await prisma.matter.findUnique({ where: { matterNumber: '26-FAM-0101' } });
  const baselineDraft = await prisma.documentDraft.findUnique({ where: { draftCode: 'DFT-26-0001' } });

  if (!baselineIntake || !baselineMatter || !baselineDraft) {
    throw new Error('Baseline historical records (INT-26-0001, 26-FAM-0101, DFT-26-0001) not found in test db!');
  }
  const baselineSnapshot = {
    intakeUpdatedAt: baselineIntake.updatedAt.toISOString(),
    matterUpdatedAt: baselineMatter.updatedAt.toISOString(),
    draftUpdatedAt: baselineDraft.updatedAt.toISOString(),
    intakeConflictStatus: baselineIntake.conflictStatus,
    matterStatus: baselineMatter.status,
    draftStatus: baselineDraft.status,
  };
  record('STAGE 0', 'Baseline Historical Records Captured', 'PASSED', baselineSnapshot);

  // Initialize event subscriptions
  AutoDraftService.initSubscriptions();
  record('STAGE 0', 'AutoDraftService Subscriptions Initialized', 'PASSED');

  const fictionalCreatedIds: { intakes: string[]; matters: string[]; drafts: string[] } = {
    intakes: [],
    matters: [],
    drafts: [],
  };

  // ============================================================================
  // WORKFLOW 1: CAT-001 CONSULTATION CONFIRMATION & RESCHEDULING LIFECYCLE
  // ============================================================================
  console.log('\n--- WORKFLOW 1: CAT-001 Consultation Confirmation & Rescheduling Lifecycle ---');
  try {
    // 1.A Initial Booking
    const intake1 = await prisma.intake.create({
      data: {
        intakeNumber: `INT-3A-CAT001-${Date.now().toString().slice(-6)}`,
        prospectiveClient: 'Fictional Client CAT001',
        email: 'cat001.client@example.com',
        phone: '801-555-0101',
        practiceArea: { connect: { id: 'pa-fam' } },
        matterSummary: 'Initial divorce and custody consultation inquiry.',
        adverseParties: 'None',
        conflictStatus: 'Cleared',
      },
    });
    fictionalCreatedIds.intakes.push(intake1.id);

    await IntakeService.bookConsultation(
      intake1.id,
      {
        consultationDate: '2026-12-05',
        consultationTime: '10:00 AM',
        location: 'Salt Lake Office Suite 400',
        preparationInstructions: 'Bring photo ID and recent paystubs.',
      },
      { userId: adminUser.id, userRole: adminUser.role }
    );

    // Wait for async handler
    const draft1 = await waitForDraft({
      where: {
        template: { templateCode: 'CAT-001' },
        title: { contains: 'Fictional Client CAT001' },
      },
      orderBy: { createdAt: 'desc' },
      include: { template: true },
    });

    if (!draft1) {
      record('CAT-001', 'Initial Booking Draft Generation', 'FAILED', 'No CAT-001 draft found');
    } else {
      fictionalCreatedIds.drafts.push(draft1.id);
      const isInitialValid =
        draft1.status === 'Draft' &&
        draft1.title.toLowerCase().includes('consultation confirmation') &&
        !draft1.title.toLowerCase().includes('rescheduled') &&
        draft1.docxStorageKey !== null;

      record('CAT-001', 'Initial Booking Draft Generation', isInitialValid ? 'PASSED' : 'FAILED', {
        draftCode: draft1.draftCode,
        status: draft1.status,
        title: draft1.title,
        docxKey: draft1.docxStorageKey,
      });

      // 1.B Idempotent Replay Guard
      await IntakeService.bookConsultation(
        intake1.id,
        {
          consultationDate: '2026-12-05',
          consultationTime: '10:00 AM',
        },
        { userId: adminUser.id, userRole: adminUser.role }
      );
      await sleep(2500);

      const draftsAfterReplay = await prisma.documentDraft.findMany({
        where: {
          template: { templateCode: 'CAT-001' },
          title: { contains: 'Fictional Client CAT001' },
        },
      });
      const replayPrevented = draftsAfterReplay.length === 1;
      record('CAT-001', 'Idempotency Duplicate Guard on Re-booking', replayPrevented ? 'PASSED' : 'FAILED', {
        expectedDrafts: 1,
        actualDrafts: draftsAfterReplay.length,
      });

      // 1.C 1st Rescheduling
      await IntakeService.rescheduleConsultation(
        intake1.id,
        {
          consultationDate: '2026-12-10',
          consultationTime: '02:00 PM',
          rescheduleReason: 'Client work schedule conflict',
          notes: 'Client requested afternoon slot',
        },
        { userId: adminUser.id, userRole: adminUser.role }
      );

      const draft2 = await waitForDraft({
        where: {
          template: { templateCode: 'CAT-001' },
          title: { contains: 'Rescheduled Consultation Confirmation' },
          id: { not: draft1.id },
        },
        orderBy: { createdAt: 'desc' },
      });

      let draft1AfterResched: any = null;
      for (let i = 0; i < 40; i++) {
        draft1AfterResched = await prisma.documentDraft.findUnique({ where: { id: draft1.id } });
        if (draft1AfterResched?.status === 'Archived') break;
        await sleep(1000);
      }

      if (!draft2) {
        record('CAT-001', '1st Rescheduled Consultation Draft Generation', 'FAILED', 'No rescheduled draft created');
      } else {
        fictionalCreatedIds.drafts.push(draft2.id);
        const priorArchived = draft1AfterResched?.status === 'Archived';
        const newDraftActive = draft2.status === 'Draft';
        record('CAT-001', '1st Rescheduling: Prior Draft Marked Archived', priorArchived ? 'PASSED' : 'FAILED', {
          draft1Status: draft1AfterResched?.status,
        });
        record('CAT-001', '1st Rescheduling: New Linked Draft Created', newDraftActive ? 'PASSED' : 'FAILED', {
          draftCode: draft2.draftCode,
          title: draft2.title,
          status: draft2.status,
        });

        // 1.D 2nd Rescheduling
        await IntakeService.rescheduleConsultation(
          intake1.id,
          {
            consultationDate: '2026-12-15',
            consultationTime: '11:00 AM',
            rescheduleReason: 'Attorney court appearance',
          },
          { userId: adminUser.id, userRole: adminUser.role }
        );

        const draft3 = await waitForDraft({
          where: {
            template: { templateCode: 'CAT-001' },
            id: { notIn: [draft1.id, draft2.id] },
          },
          orderBy: { createdAt: 'desc' },
        });

        let draft2AfterResched: any = null;
        for (let i = 0; i < 20; i++) {
          draft2AfterResched = await prisma.documentDraft.findUnique({ where: { id: draft2.id } });
          if (draft2AfterResched?.status === 'Archived') break;
          await sleep(500);
        }

        if (!draft3) {
          record('CAT-001', '2nd Rescheduled Consultation Draft Generation', 'FAILED', 'No 3rd draft created');
        } else {
          fictionalCreatedIds.drafts.push(draft3.id);
          const secondArchived = draft2AfterResched?.status === 'Archived';
          record('CAT-001', '2nd Rescheduling: Preceding Draft Archived & 3rd Draft Created', secondArchived ? 'PASSED' : 'FAILED', {
            draft2Status: draft2AfterResched?.status,
            draft3Code: draft3.draftCode,
            draft3Status: draft3.status,
          });
        }
      }
    }
  } catch (err: any) {
    record('CAT-001', 'Workflow Execution', 'FAILED', err.message);
  }

  // ============================================================================
  // WORKFLOW 2: CAT-002 PROSPECTIVE CLIENT QUESTIONNAIRE SEGREGATION
  // ============================================================================
  console.log('\n--- WORKFLOW 2: CAT-002 Prospective Client Questionnaire Segregation ---');
  try {
    const practiceCases = [
      { paId: 'pa-fam', expectedSubtype: 'Family Law', label: 'FAM' },
      { paId: 'pa-pi', expectedSubtype: 'Personal Injury', label: 'PI' },
      { paId: 'pa-prob', expectedSubtype: 'Estate & Probate', label: 'EST' },
    ];

    for (const pc of practiceCases) {
      const intake = await prisma.intake.create({
        data: {
          intakeNumber: `INT-3A-CAT002-${pc.label}-${Date.now().toString().slice(-5)}`,
          prospectiveClient: `Fictional Client ${pc.label}`,
          email: `${pc.label.toLowerCase()}.client@example.com`,
          phone: '801-555-0202',
          practiceArea: { connect: { id: pc.paId } },
          matterSummary: `Inquiry regarding ${pc.expectedSubtype} representation.`,
          adverseParties: 'None',
          conflictStatus: 'Cleared',
        },
      });
      fictionalCreatedIds.intakes.push(intake.id);

      DocumentEventBus.emitAsync(
        DOCUMENT_EVENT.INTAKE_PROSPECT_SAVED,
        {
          intakeId: intake.id,
          prospectiveClient: intake.prospectiveClient,
          practiceAreaId: pc.paId,
          matterSummary: intake.matterSummary,
        },
        { user: adminUser }
      );

      const qDraft = await waitForDraft({
        where: {
          template: { templateCode: 'CAT-002' },
          title: { contains: intake.prospectiveClient },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!qDraft) {
        record('CAT-002', `Questionnaire Generation (${pc.expectedSubtype})`, 'FAILED', 'Draft not found');
      } else {
        fictionalCreatedIds.drafts.push(qDraft.id);
        const hasSubtype = qDraft.title.toLowerCase().includes(pc.expectedSubtype.toLowerCase());
        record('CAT-002', `Questionnaire Generation (${pc.expectedSubtype})`, hasSubtype ? 'PASSED' : 'FAILED', {
          draftCode: qDraft.draftCode,
          title: qDraft.title,
          status: qDraft.status,
        });

        // Test Idempotency: Re-saving the prospect must not duplicate the questionnaire
        DocumentEventBus.emitAsync(
          DOCUMENT_EVENT.INTAKE_PROSPECT_SAVED,
          {
            intakeId: intake.id,
            prospectiveClient: intake.prospectiveClient,
            practiceAreaId: pc.paId,
            matterSummary: intake.matterSummary,
          },
          { user: adminUser }
        );
        await sleep(3000);

        const countAfterReSave = await prisma.documentDraft.count({
          where: {
            template: { templateCode: 'CAT-002' },
            title: { contains: intake.prospectiveClient },
          },
        });
        record('CAT-002', `Idempotency Guard on Re-save (${pc.expectedSubtype})`, countAfterReSave === 1 ? 'PASSED' : 'FAILED', {
          count: countAfterReSave,
        });
      }
    }
  } catch (err: any) {
    record('CAT-002', 'Workflow Execution', 'FAILED', err.message);
  }

  // ============================================================================
  // WORKFLOW 3: CAT-003 CONFLICT SEARCH REPORT & ETHICAL SAFEGUARDS
  // ============================================================================
  console.log('\n--- WORKFLOW 3: CAT-003 Conflict Search Report & Ethical Safeguards ---');
  try {
    // 3.A Known Conflict Scenario
    const conflictIntake = await prisma.intake.create({
      data: {
        intakeNumber: `INT-3A-CAT003-CONF-${Date.now().toString().slice(-5)}`,
        prospectiveClient: 'Fictional Adversary Corp',
        email: 'adversary@example.com',
        phone: '801-555-0301',
        practiceArea: { connect: { id: 'pa-civ' } },
        matterSummary: 'Contract litigation against existing client.',
        adverseParties: 'Existing Client LLC',
        conflictStatus: 'Flagged Conflict',
      },
    });
    fictionalCreatedIds.intakes.push(conflictIntake.id);

    DocumentEventBus.emitAsync(
      DOCUMENT_EVENT.INTAKE_CONFLICT_SEARCH_COMPLETED,
      {
        intakeId: conflictIntake.id,
        prospectiveClient: conflictIntake.prospectiveClient,
        conflictStatus: 'Flagged Conflict',
        hasConflicts: true,
        matches: [
          {
            entityName: 'Existing Client LLC',
            entityType: 'ADVERSE_PARTY',
            status: 'FLAGGED',
            severity: 'HARD_CONFLICT',
          },
        ],
        queriedTerms: ['Existing Client LLC', 'Adversary Corp'],
      },
      { user: adminUser }
    );
    const flaggedReport = await waitForDraft({
      where: {
        template: { templateCode: 'CAT-003' },
        title: { contains: 'Fictional Adversary Corp' },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!flaggedReport) {
      record('CAT-003', 'Scenario A: Known Conflict Report Generation', 'FAILED', 'Draft not created');
    } else {
      fictionalCreatedIds.drafts.push(flaggedReport.id);
      const isUnderReview = flaggedReport.status === 'Under Review';
      const hasConflictTitle = flaggedReport.title.includes('(FLAGGED)');
      const flags = flaggedReport.missingFieldsFlags as any[];
      const hasAlert = Array.isArray(flags) && flags.some((f) => f.type === 'CONFLICT_ALERT');

      record('CAT-003', 'Scenario A: Known Conflict Report (FLAGGED / Under Review)', (isUnderReview && hasConflictTitle && hasAlert) ? 'PASSED' : 'FAILED', {
        draftCode: flaggedReport.draftCode,
        status: flaggedReport.status,
        title: flaggedReport.title,
        alertPresent: hasAlert,
      });
    }

    // 3.B Clean Scan Scenario
    const cleanIntake = await prisma.intake.create({
      data: {
        intakeNumber: `INT-3A-CAT003-CLN-${Date.now().toString().slice(-5)}`,
        prospectiveClient: 'Fictional Clean Client',
        email: 'clean@example.com',
        phone: '801-555-0302',
        practiceArea: { connect: { id: 'pa-civ' } },
        matterSummary: 'Clean breach of contract inquiry.',
        adverseParties: 'None',
        conflictStatus: 'Cleared',
      },
    });
    fictionalCreatedIds.intakes.push(cleanIntake.id);

    DocumentEventBus.emitAsync(
      DOCUMENT_EVENT.INTAKE_CONFLICT_SEARCH_COMPLETED,
      {
        intakeId: cleanIntake.id,
        prospectiveClient: cleanIntake.prospectiveClient,
        conflictStatus: 'Cleared',
        hasConflicts: false,
        matches: [],
        queriedTerms: ['Clean Client'],
      },
      { user: adminUser }
    );

    const cleanReport = await waitForDraft({
      where: {
        template: { templateCode: 'CAT-003' },
        title: { contains: 'Fictional Clean Client' },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!cleanReport) {
      record('CAT-003', 'Scenario B: Clean Conflict Report Generation', 'FAILED', 'Draft not created');
    } else {
      fictionalCreatedIds.drafts.push(cleanReport.id);
      const isDraftStatus = cleanReport.status === 'Draft';
      const hasClearedTitle = cleanReport.title.includes('(CLEARED)');
      record('CAT-003', 'Scenario B: Clean Conflict Report (CLEARED / Draft Status)', (isDraftStatus && hasClearedTitle) ? 'PASSED' : 'FAILED', {
        draftCode: cleanReport.draftCode,
        status: cleanReport.status,
        title: cleanReport.title,
      });
    }

    // 3.C Pending Review Scenario (Must NEVER auto-clear)
    const pendingIntake = await prisma.intake.create({
      data: {
        intakeNumber: `INT-3A-CAT003-PND-${Date.now().toString().slice(-5)}`,
        prospectiveClient: 'Fictional Potential Match Client',
        email: 'potential@example.com',
        phone: '801-555-0303',
        practiceArea: { connect: { id: 'pa-civ' } },
        matterSummary: 'Potential party overlap needing attorney review.',
        adverseParties: 'Similar Corp',
        conflictStatus: 'Pending Review',
      },
    });
    fictionalCreatedIds.intakes.push(pendingIntake.id);

    DocumentEventBus.emitAsync(
      DOCUMENT_EVENT.INTAKE_CONFLICT_SEARCH_COMPLETED,
      {
        intakeId: pendingIntake.id,
        prospectiveClient: pendingIntake.prospectiveClient,
        conflictStatus: 'Pending Review',
        hasConflicts: false,
        matches: [{ entityName: 'Similar Corp', entityType: 'PROSPECTIVE_CLIENT', status: 'PENDING', severity: 'POTENTIAL_CONFLICT' }],
        queriedTerms: ['Similar Corp'],
      },
      { user: adminUser }
    );

    const pendingReport = await waitForDraft({
      where: {
        template: { templateCode: 'CAT-003' },
        title: { contains: 'Fictional Potential Match Client' },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!pendingReport) {
      record('CAT-003', 'Scenario C: Pending Review Report Generation', 'FAILED', 'Draft not created');
    } else {
      fictionalCreatedIds.drafts.push(pendingReport.id);
      const isPendingUnderReview = pendingReport.status === 'Under Review';
      record('CAT-003', 'Scenario C: Pending Review Remains Under Review (Never Auto-Cleared)', isPendingUnderReview ? 'PASSED' : 'FAILED', {
        draftCode: pendingReport.draftCode,
        status: pendingReport.status,
      });
    }

    // 3.D Mandatory RPC 1.7 Conversion Gatekeeper
    let conversionBlocked = false;
    let conversionErrorCode = '';
    try {
      await IntakeService.convertToMatter(
        conflictIntake.id,
        {
          title: 'Adversary Matter Attempt',
          practiceAreaId: 'pa-civ',
          responsibleAttorneyId: attorneyUser.id,
          billingType: 'Hourly',
        },
        { userId: adminUser.id, userRole: adminUser.role }
      );
    } catch (err: any) {
      conversionBlocked = true;
      conversionErrorCode = err.code || err.message;
    }
    record('CAT-003', 'Scenario D: Matter Conversion Blocked on Uncleared Conflict (RPC 1.7)', (conversionBlocked && conversionErrorCode === 'CONFLICT_NOT_CLEARED') ? 'PASSED' : 'FAILED', {
      blocked: conversionBlocked,
      errorCode: conversionErrorCode,
    });
  } catch (err: any) {
    record('CAT-003', 'Workflow Execution', 'FAILED', err.message);
  }

  // ============================================================================
  // WORKFLOW 4: CAT-010 INTAKE-TO-MATTER CONVERSION WELCOME LETTER
  // ============================================================================
  console.log('\n--- WORKFLOW 4: CAT-010 Intake-to-Matter Conversion Welcome Letter ---');
  try {
    const intakeForConvert = await prisma.intake.create({
      data: {
        intakeNumber: `INT-3A-CAT010-${Date.now().toString().slice(-5)}`,
        prospectiveClient: 'Fictional Retained Client',
        email: 'retained@example.com',
        phone: '801-555-0100',
        practiceArea: { connect: { id: 'pa-fam' } },
        matterSummary: 'Divorce proceeding approved for representation.',
        adverseParties: 'None',
        conflictStatus: 'Cleared',
      },
    });
    fictionalCreatedIds.intakes.push(intakeForConvert.id);

    // Convert intake to matter
    const convertResult = await IntakeService.convertToMatter(
      intakeForConvert.id,
      {
        title: 'Retained Client Divorce Matter',
        practiceAreaId: 'pa-fam',
        responsibleAttorneyId: attorneyUser.id,
        billingType: 'Hourly',
        hourlyRate: 350,
      },
      { userId: adminUser.id, userRole: adminUser.role }
    );
    fictionalCreatedIds.matters.push(convertResult.matter.id);

    // Verify CAT-010 Welcome Letter draft created
    const welcomeDraft = await waitForDraft({
      where: {
        template: { templateCode: 'CAT-010' },
        matterId: convertResult.matter.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!welcomeDraft) {
      record('CAT-010', 'Welcome Letter Auto-Draft Generation', 'FAILED', 'Draft not created for converted matter');
    } else {
      fictionalCreatedIds.drafts.push(welcomeDraft.id);
      const isWelcomeValid = welcomeDraft.title.includes('Welcome letter and next steps') && welcomeDraft.docxStorageKey !== null;
      record('CAT-010', 'Welcome Letter Auto-Draft Generation', isWelcomeValid ? 'PASSED' : 'FAILED', {
        draftCode: welcomeDraft.draftCode,
        title: welcomeDraft.title,
        status: welcomeDraft.status,
      });

      // Verify draft review task created for responsible attorney
      const reviewTask = await waitForTask({
        where: {
          matterId: convertResult.matter.id,
          title: { contains: 'Review Document Draft:' },
        },
      });
      record('CAT-010', 'Draft Review Task Assigned to Attorney', reviewTask ? 'PASSED' : 'FAILED', {
        taskId: reviewTask?.id,
        title: reviewTask?.title,
        assignedToId: reviewTask?.assignedToId,
      });

      // 4.B Replay Conversion Duplicate Guard
      let duplicateConvertBlocked = false;
      let duplicateErrorCode = '';
      try {
        await IntakeService.convertToMatter(
          intakeForConvert.id,
          {
            title: 'Duplicate Conversion Attempt',
            practiceAreaId: 'pa-fam',
            responsibleAttorneyId: attorneyUser.id,
            billingType: 'Hourly',
          },
          { userId: adminUser.id, userRole: adminUser.role }
        );
      } catch (err: any) {
        duplicateConvertBlocked = true;
        duplicateErrorCode = err.code || err.message;
      }
      record('CAT-010', 'Duplicate Conversion Prevention (ALREADY_CONVERTED)', (duplicateConvertBlocked && duplicateErrorCode === 'ALREADY_CONVERTED') ? 'PASSED' : 'FAILED', {
        blocked: duplicateConvertBlocked,
        errorCode: duplicateErrorCode,
      });
    }
  } catch (err: any) {
    record('CAT-010', 'Workflow Execution', 'FAILED', err.message);
  }

  // ============================================================================
  // WORKFLOW 5: CAT-300 EVICTION CLOSURE LETTER (FINANCIAL SAFEGUARD)
  // ============================================================================
  console.log('\n--- WORKFLOW 5: CAT-300 Eviction Closure Letter (Financial Safeguard) ---');
  try {
    // 5.A Full Satisfaction Scenario ($3,200 judgment, $3,200 collected, $0 balance)
    const clientFull = await prisma.client.create({
      data: {
        clientNumber: `CLI-3A-FULL-${Date.now().toString().slice(-4)}`,
        name: 'Landlord Properties LLC',
        clientType: 'Corporate',
        email: 'landlord.full@example.com',
        phone: '801-555-3001',
      },
    });
    const matterFull = await prisma.matter.create({
      data: {
        matterNumber: `26-EVICT-FULL-${Date.now().toString().slice(-4)}`,
        title: 'Landlord Properties v. Resident Doe (Full)',
        clientId: clientFull.id,
        practiceAreaId: 'pa-evict',
        responsibleAttorneyId: attorneyUser.id,
        billingType: 'Flat Fee',
        openDate: new Date(),
        status: 'Active',
      },
    });
    fictionalCreatedIds.matters.push(matterFull.id);

    await EvictionsService.reviewClosure(
      matterFull.id,
      {
        judgmentAmount: 3200,
        totalCollected: 3200,
        outstandingBalance: 0,
        closureReviewNotes: 'Full cashier check received and deposited.',
      },
      adminUser
    );

    const fullDraft = await waitForDraft({
      where: {
        template: { templateCode: 'CAT-300' },
        matterId: matterFull.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!fullDraft) {
      record('CAT-300', 'Scenario A: Full Satisfaction Closure Draft', 'FAILED', 'Draft not created');
    } else {
      fictionalCreatedIds.drafts.push(fullDraft.id);
      const isFullSatisfied =
        fullDraft.title.includes('Full Satisfaction') &&
        fullDraft.status === 'Draft' &&
        fullDraft.docxStorageKey !== null;

      record('CAT-300', 'Scenario A: Full Satisfaction ($3,200 Paid / $0 Bal)', isFullSatisfied ? 'PASSED' : 'FAILED', {
        draftCode: fullDraft.draftCode,
        title: fullDraft.title,
        status: fullDraft.status,
      });
    }

    // 5.B Partial Payment Scenario ($3,200 judgment, $1,200 collected, $2,000 balance)
    const clientPart = await prisma.client.create({
      data: {
        clientNumber: `CLI-3A-PART-${Date.now().toString().slice(-4)}`,
        name: 'Mountain Real Estate Corp',
        clientType: 'Corporate',
        email: 'landlord.part@example.com',
        phone: '801-555-3002',
      },
    });
    const matterPart = await prisma.matter.create({
      data: {
        matterNumber: `26-EVICT-PART-${Date.now().toString().slice(-4)}`,
        title: 'Mountain RE Corp v. Resident Smith (Partial)',
        clientId: clientPart.id,
        practiceAreaId: 'pa-evict',
        responsibleAttorneyId: attorneyUser.id,
        billingType: 'Flat Fee',
        openDate: new Date(),
        status: 'Active',
      },
    });
    fictionalCreatedIds.matters.push(matterPart.id);

    await EvictionsService.reviewClosure(
      matterPart.id,
      {
        judgmentAmount: 3200,
        totalCollected: 1200,
        outstandingBalance: 2000,
        closureReviewNotes: 'Partial installment received. Eviction executed; $2000 money judgment remains unpaid.',
      },
      adminUser
    );

    const partDraft = await waitForDraft({
      where: {
        template: { templateCode: 'CAT-300' },
        matterId: matterPart.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!partDraft) {
      record('CAT-300', 'Scenario B: Partial Payment Closure Draft', 'FAILED', 'Draft not created');
    } else {
      fictionalCreatedIds.drafts.push(partDraft.id);

      // Poll until the async status update to 'Under Review' is persisted
      let refreshedPartDraft: any = partDraft;
      for (let i = 0; i < 30; i++) {
        refreshedPartDraft = await prisma.documentDraft.findUnique({ where: { id: partDraft.id } });
        if (refreshedPartDraft?.status === 'Under Review') break;
        await sleep(1000);
      }

      const isPartValid =
        refreshedPartDraft.title.includes('Remaining Balance: $2000.00') &&
        refreshedPartDraft.status === 'Under Review';
      const flags = refreshedPartDraft.missingFieldsFlags as any[];
      const hasFinancialSafeguard = Array.isArray(flags) && flags.some((f) => f.type === 'FINANCIAL_SAFEGUARD');

      record('CAT-300', 'Scenario B: Partial Payment Financial Safeguard ($1,200 Paid / $2,000 Remainder)', (isPartValid && hasFinancialSafeguard) ? 'PASSED' : 'FAILED', {
        draftCode: refreshedPartDraft.draftCode,
        title: refreshedPartDraft.title,
        status: refreshedPartDraft.status,
        financialSafeguardPresent: hasFinancialSafeguard,
      });
    }
  } catch (err: any) {
    record('CAT-300', 'Workflow Execution', 'FAILED', err.message);
  }

  // ============================================================================
  // WORKFLOW 6: SCAFFOLDING & DOCX FILE INTEGRITY INSPECTION
  // ============================================================================
  console.log('\n--- WORKFLOW 6: Scaffolding & DOCX File Integrity Inspection ---');
  try {
    let filesVerified = 0;
    for (const draftId of fictionalCreatedIds.drafts) {
      const draft = await prisma.documentDraft.findUnique({ where: { id: draftId } });
      if (!draft || !draft.docxStorageKey) continue;

      const fullPath = StorageService.resolvePath(draft.docxStorageKey);
      let fileFound = false;
      for (let attempt = 0; attempt < 15; attempt++) {
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          const buffer = fs.readFileSync(fullPath);
          // Check zip / docx header: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
          const isDocxZip = buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
          if (stats.size > 0 && isDocxZip) {
            fileFound = true;
            break;
          }
        }
        await sleep(1000);
      }
      if (fileFound) {
        filesVerified++;
      }
    }
    const allFilesValid = filesVerified === fictionalCreatedIds.drafts.length && filesVerified > 0;
    record('SCAFFOLDING', `DOCX Integrity Verification (${filesVerified}/${fictionalCreatedIds.drafts.length} files valid)`, allFilesValid ? 'PASSED' : 'FAILED', {
      verifiedCount: filesVerified,
      totalDrafts: fictionalCreatedIds.drafts.length,
    });
  } catch (err: any) {
    record('SCAFFOLDING', 'DOCX File Verification', 'FAILED', err.message);
  }

  // ============================================================================
  // WORKFLOW 7: BASELINE HISTORICAL RECORDS INTEGRITY POST-CHECK
  // ============================================================================
  console.log('\n--- WORKFLOW 7: Baseline Historical Records Integrity Post-Check ---');
  try {
    const postIntake = await prisma.intake.findUnique({ where: { intakeNumber: 'INT-26-0001' } });
    const postMatter = await prisma.matter.findUnique({ where: { matterNumber: '26-FAM-0101' } });
    const postDraft = await prisma.documentDraft.findUnique({ where: { draftCode: 'DFT-26-0001' } });

    const postSnapshot = {
      intakeUpdatedAt: postIntake?.updatedAt.toISOString(),
      matterUpdatedAt: postMatter?.updatedAt.toISOString(),
      draftUpdatedAt: postDraft?.updatedAt.toISOString(),
      intakeConflictStatus: postIntake?.conflictStatus,
      matterStatus: postMatter?.status,
      draftStatus: postDraft?.status,
    };

    const isIntakeUntouched = baselineSnapshot.intakeUpdatedAt === postSnapshot.intakeUpdatedAt && baselineSnapshot.intakeConflictStatus === postSnapshot.intakeConflictStatus;
    const isMatterUntouched = baselineSnapshot.matterUpdatedAt === postSnapshot.matterUpdatedAt && baselineSnapshot.matterStatus === postSnapshot.matterStatus;
    const isDraftUntouched = baselineSnapshot.draftUpdatedAt === postSnapshot.draftUpdatedAt && baselineSnapshot.draftStatus === postSnapshot.draftStatus;

    const allUntouched = isIntakeUntouched && isMatterUntouched && isDraftUntouched;
    record('SAFETY', 'Baseline Records 100% Untouched (INT-26-0001, 26-FAM-0101, DFT-26-0001)', allUntouched ? 'PASSED' : 'FAILED', {
      pre: baselineSnapshot,
      post: postSnapshot,
    });
  } catch (err: any) {
    record('SAFETY', 'Baseline Records Post-Check', 'FAILED', err.message);
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n================================================================');
  const passed = testResults.filter((r) => r.status === 'PASSED').length;
  const failed = testResults.filter((r) => r.status === 'FAILED').length;
  console.log(`PHASE 3.A VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED (TOTAL: ${testResults.length})`);
  console.log('================================================================\n');

  return { passed, failed, total: testResults.length, results: testResults };
}

runPhase3aVerification()
  .then((summary) => {
    if (summary.failed > 0) {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Fatal Test Suite Error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

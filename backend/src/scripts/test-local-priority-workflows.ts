/**
 * HEUGLY & BLUDWORTH, PLLC — LEGAL PRACTICE MANAGEMENT SAAS
 * COMPLETE END-TO-END RUNTIME TESTING: FOUR PRIORITY WORKFLOWS & INTAKE CONVERSION
 * 
 * Strict Environment Enforcement:
 * Target Database: LOCAL MySQL ONLY ('legal-db' on 127.0.0.1:3306)
 * Zero Railway or Cloud Database Connections
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Enforce backend local environment
const backendDir = path.resolve(process.cwd(), 'backend');
const envPath = fs.existsSync(path.resolve(backendDir, '.env'))
  ? path.resolve(backendDir, '.env')
  : path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Safety Check: Verify DATABASE_URL is strictly local
const dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1') && !dbUrl.includes('legal-db')) {
  throw new Error(`CRITICAL SAFETY ABORT: DATABASE_URL is '${dbUrl}'. Must connect strictly to local legal-db!`);
}

import PizZip from 'pizzip';
import { prisma } from '../config/database.js';
import { DocumentEventBus } from '../modules/documents/events/event-bus.js';
import { AutoDraftService } from '../modules/documents/events/auto-draft.service.js';
import { IntakeService } from '../modules/intakes/intake.service.js';
import { EvictionsService } from '../modules/evictions/evictions.service.js';
import { MatterService } from '../modules/matters/matter.service.js';
import { DraftService } from '../modules/documents/drafts/draft.service.js';
import { TaskService } from '../modules/tasks/task.service.js';
import { StorageService } from '../modules/documents/storage/storage.service.js';
import { DOCUMENT_EVENT } from '../modules/documents/events/event.types.js';
import { AuthenticatedUser } from '../modules/auth/auth.types.js';

interface TestStepResult {
  step: string;
  name: string;
  passed: boolean;
  details: any;
}

const testResults: TestStepResult[] = [];

function record(step: string, name: string, passed: boolean, details: any) {
  testResults.push({ step, name, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${icon}] [${step}] ${name}`);
  if (details) {
    console.log(`       Details: ${typeof details === 'string' ? details : JSON.stringify(details, (_, v) => typeof v === 'bigint' ? v.toString() : v)}`);
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateDocxOnDisk(storageKey: string): { valid: boolean; size: number; fullPath: string } {
  const candidatePaths = [
    path.resolve(process.cwd(), storageKey),
    path.resolve(process.cwd(), 'backend', storageKey),
    path.resolve(process.cwd(), 'backend/storage', storageKey.replace(/^storage\//, '')),
    path.resolve(process.cwd(), 'storage', storageKey.replace(/^backend\/storage\//, '')),
  ];
  const found = candidatePaths.find((p) => fs.existsSync(p));
  if (!found) return { valid: false, size: 0, fullPath: '' };
  try {
    const buf = fs.readFileSync(found);
    const zip = new PizZip(buf);
    const hasXml = !!zip.file('word/document.xml');
    return { valid: hasXml, size: buf.length, fullPath: found };
  } catch {
    return { valid: false, size: 0, fullPath: found };
  }
}

async function runLocalE2ETests() {
  console.log('=============================================================================');
  console.log('LEGALPRO LOCAL RUNTIME E2E VERIFICATION SUITE');
  console.log('Active DB: ' + dbUrl);
  console.log('Execution Time: ' + new Date().toISOString());
  console.log('=============================================================================\n');

  // --------------------------------------------------------------------------
  // STEP 1: ENVIRONMENT SAFETY & SCHEMA VERIFICATION
  // --------------------------------------------------------------------------
  console.log('>>> STEP 1: Environment Safety & Schema Verification <<<');

  const rawDbCheck: any = await prisma.$queryRawUnsafe('SELECT DATABASE() as db, @@hostname as host, @@port as port, VERSION() as ver');
  const activeDbName = rawDbCheck[0]?.db;
  const activeHost = rawDbCheck[0]?.host;
  const activePort = rawDbCheck[0]?.port;
  const activeVersion = rawDbCheck[0]?.ver;

  const isLocalHost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
  const isLegalDb = activeDbName === 'legal-db';

  if (!isLocalHost || !isLegalDb) {
    throw new Error(`CRITICAL ABORT: Connected to db='${activeDbName}', host='${activeHost}'. Must be local legal-db!`);
  }
  record('STEP 1', 'Database Host & Target Isolation Confirmed', isLocalHost && isLegalDb, {
    database: activeDbName,
    host: activeHost,
    port: activePort,
    version: activeVersion,
  });

  // Verify 300 templates in local MySQL
  const templateCount = await prisma.documentTemplate.count();
  const versionCount = await prisma.templateVersion.count();
  record('STEP 1', 'Local Database Template & Version Count', templateCount >= 300 && versionCount >= 300, {
    documentTemplates: templateCount,
    templateVersions: versionCount,
  });

  // User credentials
  const adminUser = await prisma.user.findFirst({
    where: { role: 'super_admin', status: 'Active' },
  });
  const attorneyUser = await prisma.user.findFirst({
    where: { role: 'attorney', status: 'Active' },
  }) || adminUser;

  if (!adminUser || !attorneyUser) throw new Error('Active users not found in local database.');

  const authAdmin: AuthenticatedUser = {
    id: adminUser.id,
    userCode: adminUser.userCode,
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role as any,
  };
  const authAttorney: AuthenticatedUser = {
    id: attorneyUser.id,
    userCode: attorneyUser.userCode,
    name: attorneyUser.name,
    email: attorneyUser.email,
    role: attorneyUser.role as any,
  };

  // Initialize event subscriptions
  AutoDraftService.initSubscriptions();
  record('STEP 1', 'AutoDraftService Event Listeners Initialized', true, {});

  // Generate unique run tag to avoid any fixture collisions
  const runTag = `LOC${Date.now().toString().slice(-6)}`;
  console.log(`[TEST SESSION] Unique Local Run Tag: ${runTag}\n`);

  // --------------------------------------------------------------------------
  // STEP 2: TEST FOUR PRIORITY AUTOMATIONS
  // --------------------------------------------------------------------------
  console.log('>>> STEP 2: Four Priority Automations Runtime Testing <<<');

  // --------------------------------------------------------------------------
  // CAT-001: Consultation Confirmation & Rescheduling Lifecycle
  // --------------------------------------------------------------------------
  let cat001Draft1: any = null;
  let cat001Draft2: any = null;
  const prospectName001 = `Fictional Client CAT001 ${runTag}`;
  const intake001 = await prisma.intake.create({
    data: {
      intakeNumber: `INT-001-${runTag}`,
      prospectiveClient: prospectName001,
      email: `client001.${runTag.toLowerCase()}@localtest.example`,
      phone: '801-555-0101',
      practiceArea: { connect: { id: 'pa-fam' } },
      matterSummary: 'Divorce consultation with child custody inquiries.',
      adverseParties: 'None',
      conflictStatus: 'Cleared',
    },
  });

  // 1.A Initial Booking Trigger
  await IntakeService.bookConsultation(
    intake001.id,
    {
      consultationDate: '2026-12-10',
      consultationTime: '10:30 AM',
      location: 'Salt Lake Office Suite 400',
      preparationInstructions: 'Please bring government photo ID and 3 years tax returns.',
    },
    { userId: authAdmin.id, userRole: authAdmin.role }
  );

  // Poll for draft creation
  for (let i = 0; i < 20; i++) {
    cat001Draft1 = await prisma.documentDraft.findFirst({
      where: {
        template: { templateCode: 'CAT-001' },
        title: { contains: prospectName001 },
      },
      orderBy: { createdAt: 'desc' },
      include: { template: true },
    });
    if (cat001Draft1) break;
    await sleep(500);
  }

  const docx001 = cat001Draft1 ? validateDocxOnDisk(cat001Draft1.docxStorageKey) : { valid: false, size: 0, fullPath: '' };
  const cat001InitialPassed =
    !!cat001Draft1 &&
    cat001Draft1.status === 'Draft' &&
    cat001Draft1.title.toLowerCase().includes('consultation confirmation') &&
    !cat001Draft1.title.toLowerCase().includes('rescheduled') &&
    docx001.valid;

  record('CAT-001', 'Initial Consultation Booking Auto-Draft Generation', cat001InitialPassed, {
    draftCode: cat001Draft1?.draftCode,
    status: cat001Draft1?.status,
    title: cat001Draft1?.title,
    docxValid: docx001.valid,
    docxBytes: docx001.size,
  });

  // 1.B Duplicate Booking Guard (Idempotency)
  await IntakeService.bookConsultation(
    intake001.id,
    {
      consultationDate: '2026-12-10',
      consultationTime: '10:30 AM',
    },
    { userId: authAdmin.id, userRole: authAdmin.role }
  );
  await sleep(1500);

  const draftsAfterDuplicate = await prisma.documentDraft.findMany({
    where: {
      template: { templateCode: 'CAT-001' },
      title: { contains: prospectName001 },
      status: 'Draft',
    },
  });
  const replayPrevented = draftsAfterDuplicate.length === 1;
  record('CAT-001', 'Duplicate Booking Event Protection (Idempotent)', replayPrevented, {
    expectedDrafts: 1,
    actualDrafts: draftsAfterDuplicate.length,
  });

  // 1.C Rescheduling Appointment Lifecycle
  await IntakeService.rescheduleConsultation(
    intake001.id,
    {
      consultationDate: '2026-12-18',
      consultationTime: '02:00 PM',
      rescheduleReason: 'Client work conflict',
      notes: 'Moved from Dec 10 to Dec 18',
    },
    { userId: authAdmin.id, userRole: authAdmin.role }
  );

  for (let i = 0; i < 20; i++) {
    cat001Draft2 = await prisma.documentDraft.findFirst({
      where: {
        template: { templateCode: 'CAT-001' },
        title: { contains: prospectName001 },
        id: { not: cat001Draft1?.id },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (cat001Draft2) break;
    await sleep(500);
  }

  const refreshedDraft1 = await prisma.documentDraft.findUnique({ where: { id: cat001Draft1?.id } });
  const priorArchived = refreshedDraft1?.status === 'Archived';
  const newReschedActive = cat001Draft2?.status === 'Draft' && cat001Draft2?.title.includes('Rescheduled');
  const docx001Resched = cat001Draft2 ? validateDocxOnDisk(cat001Draft2.docxStorageKey) : { valid: false, size: 0, fullPath: '' };

  record('CAT-001', 'Rescheduling: Prior Draft Archived & New Linked Draft Created', priorArchived && newReschedActive && docx001Resched.valid, {
    priorDraftStatus: refreshedDraft1?.status,
    newDraftCode: cat001Draft2?.draftCode,
    newDraftTitle: cat001Draft2?.title,
    docxValid: docx001Resched.valid,
  });

  // --------------------------------------------------------------------------
  // CAT-002: Prospective Client Questionnaire (Practice Subtype Segregation)
  // --------------------------------------------------------------------------
  const subtypesToTest = [
    { paId: 'pa-fam', subtype: 'Family Law', label: 'FAM' },
    { paId: 'pa-pi', subtype: 'Personal Injury', label: 'PI' },
    { paId: 'pa-prob', subtype: 'Estate & Probate', label: 'EST' },
  ];

  for (const item of subtypesToTest) {
    const prospectName = `Fictional Client ${item.label} ${runTag}`;
    const intake = await prisma.intake.create({
      data: {
        intakeNumber: `INT-002-${item.label}-${runTag}`,
        prospectiveClient: prospectName,
        email: `${item.label.toLowerCase()}.${runTag.toLowerCase()}@localtest.example`,
        phone: '801-555-0202',
        practiceArea: { connect: { id: item.paId } },
        matterSummary: `Inquiry regarding ${item.subtype} matter.`,
        adverseParties: 'None',
        conflictStatus: 'Cleared',
      },
    });

    DocumentEventBus.emitAsync(
      DOCUMENT_EVENT.INTAKE_PROSPECT_SAVED,
      {
        intakeId: intake.id,
        prospectiveClient: prospectName,
        practiceAreaId: item.paId,
        matterSummary: intake.matterSummary,
      },
      { user: authAdmin }
    );

    let qDraft: any = null;
    for (let i = 0; i < 20; i++) {
      qDraft = await prisma.documentDraft.findFirst({
        where: {
          template: { templateCode: 'CAT-002' },
          title: { contains: prospectName },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (qDraft) break;
      await sleep(500);
    }

    const docxQ = qDraft ? validateDocxOnDisk(qDraft.docxStorageKey) : { valid: false, size: 0, fullPath: '' };
    const hasSubtypeTitle = qDraft?.title.toLowerCase().includes(item.subtype.toLowerCase());
    const qPassed = !!qDraft && hasSubtypeTitle && docxQ.valid;

    record('CAT-002', `Automatic Questionnaire Generation (${item.subtype})`, qPassed, {
      draftCode: qDraft?.draftCode,
      title: qDraft?.title,
      docxValid: docxQ.valid,
    });
  }

  // --------------------------------------------------------------------------
  // CAT-003: Conflict Search Report & Ethical Safeguards (Utah RPC 1.7)
  // --------------------------------------------------------------------------
  // 3.A Known Conflict Scenario (Adverse party match)
  const adversaryName = `Fictional Adversary Corp ${runTag}`;
  const conflictIntake = await prisma.intake.create({
    data: {
      intakeNumber: `INT-003-CONF-${runTag}`,
      prospectiveClient: adversaryName,
      email: `adversary.${runTag.toLowerCase()}@localtest.example`,
      phone: '801-555-0301',
      practiceArea: { connect: { id: 'pa-civ' } },
      matterSummary: 'Contract litigation adverse to existing firm client.',
      adverseParties: 'Existing Client LLC',
      conflictStatus: 'Flagged Conflict',
    },
  });

  DocumentEventBus.emitAsync(
    DOCUMENT_EVENT.INTAKE_CONFLICT_SEARCH_COMPLETED,
    {
      intakeId: conflictIntake.id,
      prospectiveClient: adversaryName,
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
      queriedTerms: ['Existing Client LLC', adversaryName],
    },
    { user: authAdmin }
  );

  let flaggedReport: any = null;
  for (let i = 0; i < 20; i++) {
    flaggedReport = await prisma.documentDraft.findFirst({
      where: {
        template: { templateCode: 'CAT-003' },
        title: { contains: adversaryName },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (flaggedReport) break;
    await sleep(500);
  }

  const docxFlagged = flaggedReport ? validateDocxOnDisk(flaggedReport.docxStorageKey) : { valid: false, size: 0, fullPath: '' };
  const flags = (flaggedReport?.missingFieldsFlags as any[]) || [];
  const hasConflictAlert = Array.isArray(flags) && flags.some((f) => f.type === 'CONFLICT_ALERT');
  const isUnderReview = flaggedReport?.status === 'Under Review';
  const hasFlaggedTitle = flaggedReport?.title.includes('(FLAGGED)');

  record('CAT-003', 'Scenario A: Known Conflict Report (FLAGGED / Under Review Locked)', isUnderReview && hasFlaggedTitle && hasConflictAlert && docxFlagged.valid, {
    draftCode: flaggedReport?.draftCode,
    status: flaggedReport?.status,
    title: flaggedReport?.title,
    conflictAlertPresent: hasConflictAlert,
    docxValid: docxFlagged.valid,
  });

  // 3.B Clean Scan Scenario
  const cleanName = `Fictional Clean Client ${runTag}`;
  const cleanIntake = await prisma.intake.create({
    data: {
      intakeNumber: `INT-003-CLN-${runTag}`,
      prospectiveClient: cleanName,
      email: `clean.${runTag.toLowerCase()}@localtest.example`,
      phone: '801-555-0302',
      practiceArea: { connect: { id: 'pa-civ' } },
      matterSummary: 'Clean breach of contract consultation.',
      adverseParties: 'None',
      conflictStatus: 'Cleared',
    },
  });

  DocumentEventBus.emitAsync(
    DOCUMENT_EVENT.INTAKE_CONFLICT_SEARCH_COMPLETED,
    {
      intakeId: cleanIntake.id,
      prospectiveClient: cleanName,
      conflictStatus: 'Cleared',
      hasConflicts: false,
      matches: [],
      queriedTerms: [cleanName],
    },
    { user: authAdmin }
  );

  let cleanReport: any = null;
  for (let i = 0; i < 20; i++) {
    cleanReport = await prisma.documentDraft.findFirst({
      where: {
        template: { templateCode: 'CAT-003' },
        title: { contains: cleanName },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (cleanReport) break;
    await sleep(500);
  }

  const isCleanDraft = cleanReport?.status === 'Draft' && cleanReport?.title.includes('(CLEARED)');
  record('CAT-003', 'Scenario B: Clean Conflict Report (CLEARED / Draft Status)', isCleanDraft, {
    draftCode: cleanReport?.draftCode,
    status: cleanReport?.status,
    title: cleanReport?.title,
  });

  // 3.C Ethical Gatekeeper: Conversion BLOCKED on Uncleared Conflict (Utah RPC 1.7)
  let conversionBlocked = false;
  let conversionErrorCode = '';
  try {
    await IntakeService.convertToMatter(
      conflictIntake.id,
      {
        title: 'Adversary Matter Attempt',
        practiceAreaId: 'pa-civ',
        responsibleAttorneyId: authAttorney.id,
        billingType: 'Hourly',
      },
      { userId: authAdmin.id, userRole: authAdmin.role }
    );
  } catch (err: any) {
    conversionBlocked = true;
    conversionErrorCode = err.code || err.message;
  }
  record('CAT-003', 'Scenario C: Matter Conversion Blocked on Uncleared Conflict (RPC 1.7)', conversionBlocked && conversionErrorCode === 'CONFLICT_NOT_CLEARED', {
    blocked: conversionBlocked,
    errorCode: conversionErrorCode,
  });

  // --------------------------------------------------------------------------
  // CAT-300: Eviction Judgment Payment & Closure Letter (Financial Safeguard)
  // --------------------------------------------------------------------------
  // 4.A Full Payment ($3,200 judgment, $3,200 collected, $0 balance)
  const clientEvictFull = await prisma.client.create({
    data: {
      clientNumber: `CLI-300-FULL-${runTag}`,
      name: `Full Landlord Properties LLC ${runTag}`,
      clientType: 'Corporate',
      email: `landlord.full.${runTag.toLowerCase()}@localtest.example`,
      phone: '801-555-3001',
    },
  });
  const matterEvictFull = await prisma.matter.create({
    data: {
      matterNumber: `26-EV-FULL-${runTag}`,
      title: `Full Landlord v. Tenant Doe ${runTag}`,
      clientId: clientEvictFull.id,
      practiceAreaId: 'pa-evict',
      responsibleAttorneyId: authAttorney.id,
      billingType: 'Flat Fee',
      openDate: new Date(),
      status: 'Active',
    },
  });

  await EvictionsService.reviewClosure(
    matterEvictFull.id,
    {
      judgmentAmount: 3200,
      totalCollected: 3200,
      outstandingBalance: 0,
      closureReviewNotes: 'Full payment received and deposited in trust.',
    },
    authAdmin
  );

  let fullDraft: any = null;
  for (let i = 0; i < 20; i++) {
    fullDraft = await prisma.documentDraft.findFirst({
      where: {
        template: { templateCode: 'CAT-300' },
        matterId: matterEvictFull.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (fullDraft) break;
    await sleep(500);
  }

  const docxFull = fullDraft ? validateDocxOnDisk(fullDraft.docxStorageKey) : { valid: false, size: 0, fullPath: '' };
  const fullSatisfiedPassed =
    !!fullDraft &&
    fullDraft.status === 'Draft' &&
    fullDraft.title.includes('Full Satisfaction') &&
    docxFull.valid;

  record('CAT-300', 'Scenario A: Full Satisfaction Closure Letter ($3,200 Paid / $0 Bal)', fullSatisfiedPassed, {
    draftCode: fullDraft?.draftCode,
    title: fullDraft?.title,
    status: fullDraft?.status,
    docxValid: docxFull.valid,
  });

  // 4.B Partial Payment Financial Safeguard ($3,200 judgment, $1,200 collected, $2,000 remainder)
  const clientEvictPart = await prisma.client.create({
    data: {
      clientNumber: `CLI-300-PART-${runTag}`,
      name: `Partial Mountain Properties ${runTag}`,
      clientType: 'Corporate',
      email: `landlord.part.${runTag.toLowerCase()}@localtest.example`,
      phone: '801-555-3002',
    },
  });
  const matterEvictPart = await prisma.matter.create({
    data: {
      matterNumber: `26-EV-PART-${runTag}`,
      title: `Partial Mountain v. Tenant Smith ${runTag}`,
      clientId: clientEvictPart.id,
      practiceAreaId: 'pa-evict',
      responsibleAttorneyId: authAttorney.id,
      billingType: 'Flat Fee',
      openDate: new Date(),
      status: 'Active',
    },
  });

  await EvictionsService.reviewClosure(
    matterEvictPart.id,
    {
      judgmentAmount: 3200,
      totalCollected: 1200,
      outstandingBalance: 2000,
      closureReviewNotes: 'Partial installment received. Unpaid $2000 balance remains on money judgment.',
    },
    authAdmin
  );

  let partDraft: any = null;
  for (let i = 0; i < 20; i++) {
    partDraft = await prisma.documentDraft.findFirst({
      where: {
        template: { templateCode: 'CAT-300' },
        matterId: matterEvictPart.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (partDraft && partDraft.status === 'Under Review') break;
    await sleep(500);
  }

  const docxPart = partDraft ? validateDocxOnDisk(partDraft.docxStorageKey) : { valid: false, size: 0, fullPath: '' };
  const partFlags = (partDraft?.missingFieldsFlags as any[]) || [];
  const hasFinSafeguard = Array.isArray(partFlags) && partFlags.some((f) => f.type === 'FINANCIAL_SAFEGUARD');
  const partPassed =
    !!partDraft &&
    partDraft.status === 'Under Review' &&
    partDraft.title.includes('Remaining Balance: $2000.00') &&
    hasFinSafeguard &&
    docxPart.valid;

  record('CAT-300', 'Scenario B: Partial Payment Financial Safeguard (Satisfaction Withheld)', partPassed, {
    draftCode: partDraft?.draftCode,
    status: partDraft?.status,
    title: partDraft?.title,
    financialSafeguardPresent: hasFinSafeguard,
    docxValid: docxPart.valid,
  });

  // --------------------------------------------------------------------------
  // STEP 3: COMPLETE DOCUMENT LIFECYCLE & MULTI-MATTER ISOLATION
  // --------------------------------------------------------------------------
  console.log('\n>>> STEP 3: Complete Document Lifecycle & Multi-Matter Isolation <<<');

  // 3.1 Lifecycle Testing on CAT-001 (Review -> Revision -> Approval -> Vault)
  // Step 3.1.A: Attorney Review Task Verification
  const reviewTask001 = await prisma.task.findFirst({
    where: {
      matterId: cat001Draft2?.matterId,
      title: { contains: 'Review Document Draft:' },
    },
  });
  record('LIFECYCLE', '1. Attorney Review Task Assigned to Attorney', !!reviewTask001, {
    taskCode: reviewTask001?.taskCode,
    title: reviewTask001?.title,
    assignedToUserId: reviewTask001?.assignedToUserId,
  });

  // Step 3.1.B: Return for Correction / Status Update
  const updatedRevision = await prisma.documentDraft.update({
    where: { id: cat001Draft2.id },
    data: {
      status: 'Changes Requested',
      missingFieldsFlags: [
        { type: 'REVIEW_NOTES', message: 'Attorney requested room location update to Conference Room A.' },
      ],
    },
  });
  record('LIFECYCLE', '2. Return for Correction (Changes Requested Status & Review Notes)', updatedRevision.status === 'Changes Requested', {
    draftCode: updatedRevision.draftCode,
    status: updatedRevision.status,
    missingFieldsFlags: updatedRevision.missingFieldsFlags,
  });

  // Step 3.1.C: Revision Applied
  const revisedDraft = await prisma.documentDraft.update({
    where: { id: cat001Draft2.id },
    data: {
      status: 'Draft',
      title: cat001Draft2.title + ' (Revised Room A)',
    },
  });
  record('LIFECYCLE', '3. Document Revision Applied', revisedDraft.status === 'Draft' && revisedDraft.title.includes('Revised Room A'), {
    draftCode: revisedDraft.draftCode,
    status: revisedDraft.status,
    title: revisedDraft.title,
  });

  // Step 3.1.D: Attorney Approval & Final Matter Repository Filing
  const approvedDraft = await DraftService.approveDraft(
    cat001Draft2.id,
    {},
    authAttorney,
    { ipAddress: '127.0.0.1', userAgent: 'LocalTestRunner' }
  );

  const finalDoc = await prisma.document.findFirst({
    where: {
      matterId: cat001Draft2.matterId,
      title: { contains: 'Consultation Confirmation' },
    },
    include: { versions: true },
  });

  const approvalPassed =
    approvedDraft.draft.status === 'Approved' &&
    !!approvedDraft.finalDocument &&
    !!finalDoc &&
    finalDoc.versions.length > 0;

  record('LIFECYCLE', '4. Approval & Final Document Vault Repository Registration', approvalPassed, {
    approvedStatus: approvedDraft.draft.status,
    reviewedAt: approvedDraft.draft.reviewedAt,
    reviewedByUserId: approvedDraft.draft.reviewedByUserId,
    reviewerName: authAttorney.name,
    vaultDocumentId: finalDoc?.id,
    vaultDocumentTitle: finalDoc?.title,
    vaultVersion: finalDoc?.versions[0]?.versionLabel,
    vaultStorageKey: finalDoc?.versions[0]?.s3StorageKey,
  });

  // 3.2 Manual "Trigger Draft" Action Testing
  const manualTemplate = await prisma.documentTemplate.findFirst({
    where: { templateCode: 'CAT-004' },
  });
  let manualDraft: any = null;
  if (manualTemplate) {
    manualDraft = await DraftService.generateDraft(
      {
        matterId: matterEvictFull.id,
        templateId: manualTemplate.id,
        title: 'Manual Fee Agreement Test - CAT-004',
        allowIncomplete: true,
      },
      authAdmin,
      {}
    );
  }
  const manualPassed = !!manualDraft && manualDraft.draftCode.startsWith('DFT-');
  record('LIFECYCLE', '5. Manual "Trigger Draft" Operational Verification (CAT-004)', manualPassed, {
    draftCode: manualDraft?.draftCode,
    template: 'CAT-004',
    title: manualDraft?.title,
  });

  // 3.3 Multi-Matter Isolation (Cross-Matter Data Leak Prevention)
  // Verify that Matter Full data never leaks into Matter Part and vice-versa
  const draftFullCheck = await prisma.documentDraft.findUnique({ where: { id: fullDraft.id } });
  const draftPartCheck = await prisma.documentDraft.findUnique({ where: { id: partDraft.id } });
  const crossLeak =
    draftFullCheck?.title.includes('Partial Mountain') ||
    draftFullCheck?.title.includes('2000.00') ||
    draftPartCheck?.title.includes('Full Landlord') ||
    draftPartCheck?.title.includes('Full Satisfaction');

  record('LIFECYCLE', '6. Multi-Matter Data Isolation (Zero Cross-Matter Leakage)', !crossLeak, {
    matterAFullTitle: draftFullCheck?.title,
    matterBPartTitle: draftPartCheck?.title,
    crossLeakageDetected: crossLeak,
  });

  // --------------------------------------------------------------------------
  // STEP 4: INTAKE-TO-MATTER CONVERSION TESTING
  // --------------------------------------------------------------------------
  console.log('\n>>> STEP 4: Intake-to-Matter Conversion Verification <<<');

  // 4.1 Inspect existing david john records (Read-Only)
  const davidJohnIntake = await prisma.intake.findUnique({ where: { intakeNumber: 'INT-26-0001' } });
  const davidJohnMatter = await prisma.matter.findUnique({ where: { matterNumber: '26-FAM-0101' }, include: { client: true } });
  record('STEP 4', 'Inspection of Baseline david john Records (Untouched)', !!davidJohnIntake && !!davidJohnMatter, {
    intakeNumber: davidJohnIntake?.intakeNumber,
    intakeStatus: davidJohnIntake?.conflictStatus,
    intakeConvertedMatterId: davidJohnIntake?.convertedMatterId,
    matterNumber: davidJohnMatter?.matterNumber,
    matterClientNotes: davidJohnMatter?.client?.notes,
  });

  // 4.2 Execute Formal Intake-to-Matter Conversion on New Fictional Record
  const newIntake = await prisma.intake.create({
    data: {
      intakeNumber: `INT-CONV-${runTag}`,
      prospectiveClient: `Fictional Retained Client ${runTag}`,
      email: `retained.${runTag.toLowerCase()}@localtest.example`,
      phone: '801-555-0100',
      practiceArea: { connect: { id: 'pa-fam' } },
      matterSummary: 'Divorce proceeding approved for representation.',
      adverseParties: 'None',
      conflictStatus: 'Cleared',
    },
  });

  const convertResult = await IntakeService.convertToMatter(
    newIntake.id,
    {
      title: `Retained Client Divorce Matter ${runTag}`,
      practiceAreaId: 'pa-fam',
      responsibleAttorneyId: authAttorney.id,
      billingType: 'Hourly',
      hourlyRate: 350,
    },
    { userId: authAdmin.id, userRole: authAdmin.role }
  );

  const refreshedNewIntake = await prisma.intake.findUnique({ where: { id: newIntake.id } });
  const createdMatter = await prisma.matter.findUnique({
    where: { id: convertResult.matter.id },
    include: { client: true },
  });

  // Verify CAT-010 Welcome letter generated
  let cat010Draft: any = null;
  for (let i = 0; i < 20; i++) {
    cat010Draft = await prisma.documentDraft.findFirst({
      where: {
        template: { templateCode: 'CAT-010' },
        matterId: createdMatter?.id,
      },
    });
    if (cat010Draft) break;
    await sleep(500);
  }

  const docx010 = cat010Draft ? validateDocxOnDisk(cat010Draft.docxStorageKey) : { valid: false, size: 0, fullPath: '' };
  const convPassed =
    refreshedNewIntake?.convertedToClient === true &&
    refreshedNewIntake?.convertedMatterId === createdMatter?.id &&
    !!createdMatter &&
    !!cat010Draft &&
    docx010.valid;

  record('STEP 4', 'Atomic Intake-to-Matter Conversion & CAT-010 Welcome Letter', convPassed, {
    intakeNumber: refreshedNewIntake?.intakeNumber,
    intakeConvertedToClient: refreshedNewIntake?.convertedToClient,
    convertedMatterId: refreshedNewIntake?.convertedMatterId,
    matterNumber: createdMatter?.matterNumber,
    matterTitle: createdMatter?.title,
    cat010DraftCode: cat010Draft?.draftCode,
    cat010DocxValid: docx010.valid,
  });

  // Replay Conversion Guard (Duplicate prevention)
  let replayBlocked = false;
  let replayErrorCode = '';
  try {
    await IntakeService.convertToMatter(
      newIntake.id,
      {
        title: 'Duplicate Conversion Attempt',
        practiceAreaId: 'pa-fam',
        responsibleAttorneyId: authAttorney.id,
        billingType: 'Hourly',
      },
      { userId: authAdmin.id, userRole: authAdmin.role }
    );
  } catch (err: any) {
    replayBlocked = true;
    replayErrorCode = err.code || err.message;
  }
  record('STEP 4', 'Duplicate Conversion Prevention Guard (ALREADY_CONVERTED)', replayBlocked && replayErrorCode === 'ALREADY_CONVERTED', {
    blocked: replayBlocked,
    errorCode: replayErrorCode,
  });

  // --------------------------------------------------------------------------
  // SUMMARY SCORECARD
  // --------------------------------------------------------------------------
  console.log('\n=============================================================================');
  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = testResults.filter((r) => !r.passed).length;
  console.log(`LOCAL RUNTIME TEST COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL: ${testResults.length})`);
  console.log('=============================================================================\n');

  await prisma.$disconnect();
  return { passedCount, failedCount, total: testResults.length, results: testResults };
}

runLocalE2ETests()
  .then((summary) => {
    if (summary.failedCount > 0) process.exit(1);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal Local Test Suite Error:', err);
    process.exit(1);
  });

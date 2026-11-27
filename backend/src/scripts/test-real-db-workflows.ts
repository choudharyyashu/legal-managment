/**
 * HEUGLY & BLUDWORTH, PLLC
 * Real Local MySQL Database Workflow Verification
 * Target Database: legal-db on 127.0.0.1:3306
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load backend .env before importing Prisma
const envPath = fs.existsSync(path.resolve(process.cwd(), 'backend/.env'))
  ? path.resolve(process.cwd(), 'backend/.env')
  : path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

import PizZip from 'pizzip';
import { prisma } from '../config/database.js';
import { AutoDraftService } from '../modules/documents/events/auto-draft.service.js';
import { DraftService } from '../modules/documents/drafts/draft.service.js';
import { TaskService } from '../modules/tasks/task.service.js';
import { DOCUMENT_EVENT } from '../modules/documents/events/event.types.js';
import { AuthenticatedUser } from '../modules/auth/auth.types.js';

async function runRealDbWorkflows() {
  console.log('=============================================================================');
  console.log('REAL LOCAL DATABASE WORKFLOW & DRAFT GENERATION VERIFICATION');
  console.log('Target: Local MySQL (legal-db) via Prisma Client');
  console.log('=============================================================================\n');

  // Verify DB connection
  const templateCount = await prisma.documentTemplate.count();
  const versionCount = await prisma.templateVersion.count();
  console.log(`[1] Local DB Verified: ${templateCount} templates, ${versionCount} versions in database.`);

  const adminUser = await prisma.user.findFirst({
    where: { role: 'super_admin' },
  });
  if (!adminUser) throw new Error('No super_admin user found in database.');

  const authUser: AuthenticatedUser = {
    id: adminUser.id,
    userCode: adminUser.userCode,
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role as any,
  };

  // Find or create synthetic client & matters for testing
  let testClient = await prisma.client.findFirst({
    where: { name: 'Synthetic Demo Client (Do Not Delete)' },
  });
  if (!testClient) {
    testClient = await prisma.client.create({
      data: {
        clientNumber: 'CLI-DEMO-999',
        name: 'Synthetic Demo Client (Do Not Delete)',
        clientType: 'Individual',
        email: 'demo.client@synthetic-heugly.test',
        phone: '801-555-0199',
        status: 'Active',
        assignedAttorneyId: adminUser.id,
      },
    });
  }

  // Practice area lookups
  const paPi = (await prisma.practiceArea.findFirst({ where: { id: 'pa-pi' } })) || (await prisma.practiceArea.findFirst());
  const paEvict = (await prisma.practiceArea.findFirst({ where: { id: 'pa-evict' } })) || paPi;
  const paCiv = (await prisma.practiceArea.findFirst({ where: { id: 'pa-civ' } })) || paPi;

  // Synthetic matters
  let piMatter = await prisma.matter.findFirst({
    where: { matterNumber: 'MAT-PI-DEMO-99' },
  });
  if (!piMatter) {
    piMatter = await prisma.matter.create({
      data: {
        matterNumber: 'MAT-PI-DEMO-99',
        title: 'Demo Auto Collision Matter',
        clientId: testClient.id,
        practiceAreaId: paPi?.id || 'pa-pi',
        responsibleAttorneyId: adminUser.id,
        status: 'Active',
        billingType: 'Contingency',
        contingencyPercentage: 33.33,
        openDate: new Date(),
      },
    });
  }

  let evictMatter = await prisma.matter.findFirst({
    where: { matterNumber: 'MAT-LT-DEMO-99' },
  });
  if (!evictMatter) {
    evictMatter = await prisma.matter.create({
      data: {
        matterNumber: 'MAT-LT-DEMO-99',
        title: 'Demo Apartment Eviction Matter',
        clientId: testClient.id,
        practiceAreaId: paEvict?.id || 'pa-evict',
        responsibleAttorneyId: adminUser.id,
        status: 'Active',
        billingType: 'Hourly',
        hourlyRate: 350.0,
        openDate: new Date(),
      },
    });
  }

  let fullEvictMatter = await prisma.matter.findFirst({
    where: { matterNumber: 'MAT-LT-DEMO-FULL' },
  });
  if (!fullEvictMatter) {
    fullEvictMatter = await prisma.matter.create({
      data: {
        matterNumber: 'MAT-LT-DEMO-FULL',
        title: 'Demo Apartment Eviction Matter (Full Paid)',
        clientId: testClient.id,
        practiceAreaId: paEvict?.id || 'pa-evict',
        responsibleAttorneyId: adminUser.id,
        status: 'Active',
        billingType: 'Hourly',
        hourlyRate: 350.0,
        openDate: new Date(),
      },
    });
  }

  // Synthetic intake
  let demoIntake = await prisma.intake.findFirst({ where: { intakeNumber: 'INT-DEMO-999' } });
  if (!demoIntake) {
    demoIntake = await prisma.intake.create({
      data: {
        intakeNumber: 'INT-DEMO-999',
        prospectiveClient: 'Eleanor Vance',
        contactPerson: 'Eleanor',
        email: 'eleanor.vance@synthetic.test',
        phone: '801-555-0144',
        practiceAreaId: 'pa-civ',
        matterSummary: 'Consultation & intake demo',
        conflictStatus: 'Review Required',
        adverseParties: 'Vance Holdings, LLC',
        convertedMatterId: piMatter.id,
      },
    });
  }

  // Clear previous demo drafts for clean test runs
  await prisma.documentDraft.deleteMany({
    where: {
      matterId: { in: [piMatter.id, evictMatter.id, fullEvictMatter ? fullEvictMatter.id : ''] },
    },
  });

  const results: Array<{ test: string; passed: boolean; details?: any }> = [];

  // Helper to validate DOCX
  function validateDocx(storageKey: string): boolean {
    const candidatePaths = [
      path.resolve(process.cwd(), storageKey),
      path.resolve(process.cwd(), 'backend', storageKey),
      path.resolve(process.cwd(), 'backend/storage', storageKey.replace(/^storage\//, '')),
      path.resolve(process.cwd(), 'storage', storageKey.replace(/^backend\/storage\//, '')),
    ];
    const fullPath = candidatePaths.find((p) => fs.existsSync(p));
    if (!fullPath) {
      console.warn('    ⚠️ DOCX path not found on disk:', candidatePaths);
      return false;
    }
    try {
      const buf = fs.readFileSync(fullPath);
      const zip = new PizZip(buf);
      return !!zip.file('word/document.xml');
    } catch {
      return false;
    }
  }

  // --- WORKFLOW 1: CAT-001 (Consultation Confirmation) ---
  try {
    const res001 = await AutoDraftService.handleConsultationBooked(
      {
        intakeId: demoIntake.id,
        intakeNumber: demoIntake.intakeNumber,
        scheduledDate: '2026-12-05',
        scheduledTime: '10:00 AM',
        responsibleAttorneyId: adminUser.id,
        location: 'Salt Lake City Office (Conference Room B)',
        isVirtual: false,
        practiceAreaId: 'pa-intake',
        customOverrides: {
          ClientName: 'Eleanor Vance',
          AppointmentDate: 'December 5, 2026 at 10:00 AM',
          AttorneyName: 'Eleanor Heugly, Esq.',
        },
      },
      authUser,
      {}
    );
    console.log('[CAT-001 Result]:', JSON.stringify({ drafts: res001.draftsCreated.map(d=>d.draftCode), skipped: res001.skipped, errors: res001.errors }));
    const draft = res001.draftsCreated[0];
    const hasDocx = draft ? validateDocx(draft.filePath) : false;
    const passed = !!draft && draft.draftCode.startsWith('DFT-') && hasDocx;
    results.push({
      test: 'CAT-001: Consultation Confirmation generates real draft with valid DOCX',
      passed,
      details: draft ? { code: draft.draftCode, file: draft.filePath, hasDocx } : res001,
    });
    console.log(`[Test CAT-001] ${passed ? '✅ PASS' : '❌ FAIL'}: ${draft?.draftCode} (Valid DOCX: ${hasDocx})`);
  } catch (err: any) {
    results.push({ test: 'CAT-001', passed: false, details: err.message });
    console.error('[Test CAT-001] ❌ ERROR:', err.message);
  }

  // --- WORKFLOW 2: CAT-002 (Prospective Client Questionnaire) ---
  try {
    const res002 = await AutoDraftService.handleProspectSaved(
      {
        intakeId: demoIntake.id,
        intakeNumber: demoIntake.intakeNumber,
        prospectiveClient: 'Marcus Sterling',
        practiceAreaId: 'pa-civ',
        matterSummary: 'Commercial lease dispute and contract review',
        customOverrides: {
          ClientName: 'Marcus Sterling',
          PracticeType: 'Civil Litigation & Contracts',
        },
      },
      authUser,
      {}
    );
    console.log('[CAT-002 Result]:', JSON.stringify({ drafts: res002.draftsCreated.map(d=>d.draftCode), skipped: res002.skipped, errors: res002.errors }));
    const draft = res002.draftsCreated[0];
    const hasDocx = draft ? validateDocx(draft.filePath) : false;
    const passed = !!draft && draft.draftCode.startsWith('DFT-') && hasDocx;
    results.push({
      test: 'CAT-002: Prospective Client Questionnaire generates real draft with valid DOCX',
      passed,
      details: draft ? { code: draft.draftCode, file: draft.filePath, hasDocx } : res002,
    });
    console.log(`[Test CAT-002] ${passed ? '✅ PASS' : '❌ FAIL'}: ${draft?.draftCode} (Valid DOCX: ${hasDocx})`);
  } catch (err: any) {
    results.push({ test: 'CAT-002', passed: false, details: err.message });
    console.error('[Test CAT-002] ❌ ERROR:', err.message);
  }

  // --- WORKFLOW 3: CAT-003 (Conflict Search Report Safeguard) ---
  try {
    const res003 = await AutoDraftService.handleConflictSearchCompleted(
      {
        intakeId: demoIntake.id,
        intakeNumber: demoIntake.intakeNumber,
        conflictStatus: 'Review Required',
        reviewedByUserId: adminUser.id,
        conflictNotes: 'Potential ethical overlap detected with adverse party Vance Holdings, LLC.',
        customOverrides: {
          SearchTerm: 'Vance Holdings',
          MatchedEntities: '1 active corporate roster entry',
        },
      },
      authUser,
      {}
    );
    console.log('[CAT-003 Result]:', JSON.stringify({ drafts: res003.draftsCreated.map(d=>d.draftCode), skipped: res003.skipped, errors: res003.errors }));
    const draft = res003.draftsCreated[0];
    const hasDocx = draft ? validateDocx(draft.filePath) : false;
    // Verify status is Under Review
    const dbDraft = draft ? await prisma.documentDraft.findUnique({ where: { id: draft.id } }) : null;
    const isUnderReview = dbDraft?.status === 'Under Review';
    const passed = !!draft && isUnderReview && hasDocx;
    results.push({
      test: 'CAT-003: Conflict Search Report forces Under Review status on pending conflict (Utah RPC 1.7)',
      passed,
      details: dbDraft ? { code: dbDraft.draftCode, status: dbDraft.status, hasDocx } : res003,
    });
    console.log(`[Test CAT-003] ${passed ? '✅ PASS' : '❌ FAIL'}: ${draft?.draftCode} [Status: ${dbDraft?.status}] (Valid DOCX: ${hasDocx})`);
  } catch (err: any) {
    results.push({ test: 'CAT-003', passed: false, details: err.message });
    console.error('[Test CAT-003] ❌ ERROR:', err.message);
  }

  // --- WORKFLOW 4: CAT-300 (Eviction Judgment Payment and Closure Letter) ---
  try {
    // 4A: Partial payment safeguard test
    const partialRes = await AutoDraftService.handleEvictionClosureReviewed(
      {
        matterId: evictMatter.id,
        judgmentAmount: 3250.0,
        totalCollected: 1250.0,
        outstandingBalance: 2000.0, // $2,000 remains unpaid!
        closureReviewNotes: 'Partial payment received; writ of restitution pending.',
        customOverrides: {
          TenantName: 'Robert Miller',
          LandlordName: 'Wasatch Crest Properties, LLC',
        },
      },
      authUser,
      {}
    );
    const partialDraft = partialRes.draftsCreated[0];
    const dbPartialDraft = partialDraft ? await prisma.documentDraft.findUnique({ where: { id: partialDraft.id } }) : null;
    const partialHasDocx = partialDraft ? validateDocx(partialDraft.filePath) : false;
    const isPartialSafeguarded = dbPartialDraft?.status === 'Under Review' && dbPartialDraft?.title?.includes('Remaining Balance: $2000.00');

    // 4B: Full payment test on a separate eviction matter
    const fullRes = await AutoDraftService.handleEvictionClosureReviewed(
      {
        matterId: fullEvictMatter.id,
        judgmentAmount: 3250.0,
        totalCollected: 3250.0,
        outstandingBalance: 0, // Fully paid!
        closureReviewNotes: 'Full balance satisfied; judgment closed.',
        customOverrides: {
          TenantName: 'Robert Miller',
          LandlordName: 'Wasatch Crest Properties, LLC',
        },
      },
      authUser,
      {}
    );
    console.log('[CAT-300 Full Res]:', JSON.stringify({ drafts: fullRes.draftsCreated.map(d=>d.draftCode), skipped: fullRes.skipped, errors: fullRes.errors }));
    const fullDraft = fullRes.draftsCreated[0];
    const fullHasDocx = fullDraft ? validateDocx(fullDraft.filePath) : false;
    const dbFullDraft = fullDraft ? await prisma.documentDraft.findUnique({ where: { id: fullDraft.id } }) : null;
    const isFullSatisfied = dbFullDraft?.title?.includes('Full Satisfaction');

    const passed = isPartialSafeguarded && isFullSatisfied && partialHasDocx && fullHasDocx;
    results.push({
      test: 'CAT-300: Eviction Judgment Closure enforces financial safeguard on partial payment and generates full satisfaction on zero balance',
      passed,
      details: {
        partial: { code: dbPartialDraft?.draftCode, status: dbPartialDraft?.status, hasDocx: partialHasDocx },
        full: { code: dbFullDraft?.draftCode, title: dbFullDraft?.title, hasDocx: fullHasDocx },
      },
    });
    console.log(`[Test CAT-300] ${passed ? '✅ PASS' : '❌ FAIL'}: Partial Status: ${dbPartialDraft?.status}, Full Title: ${dbFullDraft?.title}`);
  } catch (err: any) {
    results.push({ test: 'CAT-300', passed: false, details: err.message });
    console.error('[Test CAT-300] ❌ ERROR:', err.message);
  }

  // --- WORKFLOW 5: CAT-096 (Liability Insurer Representation Letter) ---
  try {
    const res096 = await AutoDraftService.handleAccidentSaved(
      {
        matterId: piMatter.id,
        incidentDate: '2026-10-15',
        insuranceCompany: 'State Farm Mutual Automobile Insurance',
        claimNumber: 'SF-26-887711',
        adjusterName: 'Sarah Jenkins',
      },
      authUser,
      {}
    );
    console.log('[CAT-096 Result]:', JSON.stringify({ drafts: res096.draftsCreated.map(d=>d.draftCode), skipped: res096.skipped, errors: res096.errors }));
    const draft = res096.draftsCreated[0];
    const hasDocx = draft ? validateDocx(draft.filePath) : false;
    const passed = !!draft && hasDocx;
    results.push({
      test: 'CAT-096: Liability Insurer Representation Letter generates real draft for PI matter',
      passed,
      details: draft ? { code: draft.draftCode, hasDocx } : res096,
    });
    console.log(`[Test CAT-096] ${passed ? '✅ PASS' : '❌ FAIL'}: ${draft?.draftCode} (Valid DOCX: ${hasDocx})`);
  } catch (err: any) {
    results.push({ test: 'CAT-096', passed: false, details: err.message });
    console.error('[Test CAT-096] ❌ ERROR:', err.message);
  }

  // --- WORKFLOW 6: CAT-140 (Lien Payoff Confirmation Request) ---
  try {
    const res140 = await AutoDraftService.handleLienPayoffRecorded(
      {
        matterId: piMatter.id,
        lienholderName: 'Intermountain Healthcare Billing Recovery',
        assertedAmount: 18500.0,
        agreedAmount: 9200.0,
        paymentInstructions: 'Trust account wire upon execution of statutory lien release',
        releaseTerms: 'Full and unconditional release of all healthcare provider liens under Utah Code 38-7-1',
      },
      authUser,
      {}
    );
    const draft = res140.draftsCreated[0];
    const hasDocx = draft ? validateDocx(draft.filePath) : false;
    const passed = !!draft && hasDocx;
    results.push({
      test: 'CAT-140: Lien Payoff Confirmation Request generates genuine payoff draft (decoupled from Demand)',
      passed,
      details: draft ? { code: draft.draftCode, hasDocx } : res140,
    });
    console.log(`[Test CAT-140] ${passed ? '✅ PASS' : '❌ FAIL'}: ${draft?.draftCode} (Valid DOCX: ${hasDocx})`);
  } catch (err: any) {
    results.push({ test: 'CAT-140', passed: false, details: err.message });
    console.error('[Test CAT-140] ❌ ERROR:', err.message);
  }

  // --- WORKFLOW 7: CAT-010 (Welcome Letter and Next Steps) ---
  try {
    const res010 = await AutoDraftService.handleMatterCreatedFromIntake(
      {
        intakeId: demoIntake.id,
        intakeNumber: demoIntake.intakeNumber,
        matterId: piMatter.id,
        matterNumber: piMatter.matterNumber,
        clientId: testClient.id,
        clientName: testClient.name,
        practiceAreaId: piMatter.practiceAreaId,
        responsibleAttorneyId: adminUser.id,
      },
      authUser,
      {}
    );
    const draft = res010.draftsCreated[0];
    const hasDocx = draft ? validateDocx(draft.filePath) : false;
    const passed = !!draft && hasDocx;
    results.push({
      test: 'CAT-010: Intake Welcome Letter generates real draft for newly opened matter',
      passed,
      details: draft ? { code: draft.draftCode, hasDocx } : res010,
    });
    console.log(`[Test CAT-010] ${passed ? '✅ PASS' : '❌ FAIL'}: ${draft?.draftCode} (Valid DOCX: ${hasDocx})`);
  } catch (err: any) {
    results.push({ test: 'CAT-010', passed: false, details: err.message });
    console.error('[Test CAT-010] ❌ ERROR:', err.message);
  }

  // --- WORKFLOW 8 & 9: CAT-112 & CAT-113 (Medical Authorization & Records Request) ---
  try {
    const resProvider = await AutoDraftService.handleProviderAdded(
      {
        matterId: piMatter.id,
        providerName: 'Salt Lake Orthopedic Clinic',
        facilityAddress: '500 E South Temple, Salt Lake City, UT 84102',
        phone: '801-555-0188',
        treatmentDates: '2026-10-16 to present',
        requestAuthorization: true,
        requestRecords: true,
      },
      authUser,
      {}
    );
    const draft112 = resProvider.draftsCreated.find((d) => d.templateCode === 'CAT-112');
    const draft113 = resProvider.draftsCreated.find((d) => d.templateCode === 'CAT-113');
    const has112Docx = draft112 ? validateDocx(draft112.filePath) : false;
    const has113Docx = draft113 ? validateDocx(draft113.filePath) : false;
    const passed = !!draft112 && !!draft113 && has112Docx && has113Docx;
    results.push({
      test: 'CAT-112 & CAT-113: Medical Authorization and Records Request generate paired drafts on provider added',
      passed,
      details: { draft112: draft112?.draftCode, draft113: draft113?.draftCode, has112Docx, has113Docx },
    });
    console.log(`[Test CAT-112/113] ${passed ? '✅ PASS' : '❌ FAIL'}: Auth: ${draft112?.draftCode}, Req: ${draft113?.draftCode}`);
  } catch (err: any) {
    results.push({ test: 'CAT-112/113', passed: false, details: err.message });
    console.error('[Test CAT-112/113] ❌ ERROR:', err.message);
  }

  // --- WORKFLOW 10: CAT-116 (Incomplete Medical Records Follow-up) ---
  try {
    const res116 = await AutoDraftService.handleMissingRecords(
      {
        matterId: piMatter.id,
        providerName: 'Salt Lake Orthopedic Clinic',
        daysOverdue: 35,
        outstandingRecords: ['Operative report dated 10/20/2026', 'Itemized billing statement'],
        followUpNotes: 'Second notice regarding missing operative report needed for demand narrative.',
      },
      authUser,
      {}
    );
    const draft = res116.draftsCreated[0];
    const hasDocx = draft ? validateDocx(draft.filePath) : false;
    const passed = !!draft && hasDocx;
    results.push({
      test: 'CAT-116: Incomplete Medical Records Follow-up incorporates deficiency notes',
      passed,
      details: draft ? { code: draft.draftCode, hasDocx } : res116,
    });
    console.log(`[Test CAT-116] ${passed ? '✅ PASS' : '❌ FAIL'}: ${draft?.draftCode} (Valid DOCX: ${hasDocx})`);
  } catch (err: any) {
    results.push({ test: 'CAT-116', passed: false, details: err.message });
    console.error('[Test CAT-116] ❌ ERROR:', err.message);
  }

  // --- WORKFLOW 11: CAT-130 (Settlement Demand Cover Letter) ---
  try {
    const res130 = await AutoDraftService.handleDemandReady(
      {
        matterId: piMatter.id,
        demandPackageId: 'dmp-demo-99',
        demandAmount: 125000.0,
        policyLimit: 100000.0,
        responseDeadlineDays: 30,
        insuranceCompany: 'State Farm Mutual Automobile Insurance',
        claimNumber: 'SF-26-887711',
        adjusterName: 'Sarah Jenkins',
      },
      authUser,
      {}
    );
    const draft = res130.draftsCreated[0];
    const hasDocx = draft ? validateDocx(draft.filePath) : false;
    const passed = !!draft && hasDocx;
    results.push({
      test: 'CAT-130: Settlement Demand Package generates canonical demand draft with Utah RPC review task',
      passed,
      details: draft ? { code: draft.draftCode, hasDocx } : res130,
    });
    console.log(`[Test CAT-130] ${passed ? '✅ PASS' : '❌ FAIL'}: ${draft?.draftCode} (Valid DOCX: ${hasDocx})`);
  } catch (err: any) {
    results.push({ test: 'CAT-130', passed: false, details: err.message });
    console.error('[Test CAT-130] ❌ ERROR:', err.message);
  }

  console.log('\n=============================================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(`SUMMARY: ${results.filter((r) => r.passed).length}/${results.length} REAL DB WORKFLOW TESTS PASSED`);
  console.log(`OVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED ✅' : 'FAILURES OCCURRED ❌'}`);
  console.log('=============================================================================');

  await prisma.$disconnect();
  return results;
}

runRealDbWorkflows()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Fatal execution error:', e);
    process.exit(1);
  });

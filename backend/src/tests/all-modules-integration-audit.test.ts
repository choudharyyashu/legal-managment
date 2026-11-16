/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Master Database & API Integration Verification Audit Suite
 *
 * Covers all 10 modules:
 * 1. Personal Injury (Remaining: Liens, Damages, Settlements, Vendors, Dashboard Metrics)
 * 2. Communications & Unmatched Queue
 * 3. Litigation Practice
 * 4. Bankruptcy Practice
 * 5. Immigration & Nationality
 * 6. Probate & Estate Administration
 * 7. Family Law & Domestic Relations
 * 8. Criminal Defense
 * 9. Appellate Practice
 * 10. Evictions & Unlawful Detainer
 */

import fs from 'fs';
import path from 'path';
import { app } from '../app.js';
import { prisma } from '../config/database.js';
import { AppError } from '../errors/AppError.js';

// Services
import { PersonalInjuryService } from '../modules/personal-injury/pi.service.js';
import { CommunicationService } from '../modules/communications/communication.service.js';
import { LitigationService } from '../modules/litigation/litigation.service.js';
import { BankruptcyService } from '../modules/bankruptcy/bankruptcy.service.js';
import { ImmigrationService } from '../modules/immigration/immigration.service.js';
import { ProbateService } from '../modules/probate/probate.service.js';
import { FamilyLawService } from '../modules/family-law/family-law.service.js';
import { CriminalService } from '../modules/criminal/criminal.service.js';
import { AppealsService } from '../modules/appeals/appeals.service.js';
import { EvictionsService } from '../modules/evictions/evictions.service.js';
import { AuthenticatedUser } from '../modules/auth/auth.types.js';

interface AuditAssertion {
  category: string;
  module: string;
  test: string;
  passed: boolean;
  details?: string;
}

const auditLog: AuditAssertion[] = [];

function assert(category: string, module: string, test: string, condition: boolean, details?: string) {
  auditLog.push({ category, module, test, passed: Boolean(condition), details });
  const icon = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`[${category}] [${module}] ${icon}: ${test}`);
  if (!condition && details) {
    console.error(`      Failure details: ${details}`);
  }
}

async function runMasterAudit() {
  console.log('=============================================================================');
  console.log('HEUGLY & BLUDWORTH LEGAL PRACTICE MANAGEMENT API');
  console.log('MASTER DATABASE & API INTEGRATION AUDIT SUITE');
  console.log('Target: 10 Practice Modules (PI, Comm, Lit, Bnk, Imm, Prob, Fam, Crim, App, Evict)');
  console.log('=============================================================================\n');

  // -------------------------------------------------------------------------
  // 1. PRISMA SCHEMA & GENERATED CLIENT VERIFICATION
  // -------------------------------------------------------------------------
  console.log('--- 1. PRISMA SCHEMA & GENERATED CLIENT VERIFICATION ---');

  const schemaPath = path.resolve('backend/prisma/schema.prisma');
  const clientDtsPath = path.resolve('backend/node_modules/.prisma/client/index.d.ts');

  const schemaExists = fs.existsSync(schemaPath);
  assert('Prisma', 'Schema', 'schema.prisma exists on disk', schemaExists);

  const schemaContent = schemaExists ? fs.readFileSync(schemaPath, 'utf8') : '';
  const dtsExists = fs.existsSync(clientDtsPath);
  assert('Prisma', 'Client', 'Generated Prisma Client index.d.ts exists on disk', dtsExists);

  const dtsContent = dtsExists ? fs.readFileSync(clientDtsPath, 'utf8') : '';

  const requiredModels = [
    { name: 'PILien', delegate: 'pILien', module: 'Personal Injury' },
    { name: 'PIDamagesRecord', delegate: 'pIDamagesRecord', module: 'Personal Injury' },
    { name: 'PISettlementDisbursement', delegate: 'pISettlementDisbursement', module: 'Personal Injury' },
    { name: 'PIVendor', delegate: 'pIVendor', module: 'Personal Injury' },
    { name: 'PIVendorAssignment', delegate: 'pIVendorAssignment', module: 'Personal Injury' },
    { name: 'Communication', delegate: 'communication', module: 'Communications' },
    { name: 'UnmatchedCommunication', delegate: 'unmatchedCommunication', module: 'Communications' },
    { name: 'LitigationCase', delegate: 'litigationCase', module: 'Litigation' },
    { name: 'CourtHearing', delegate: 'courtHearing', module: 'Litigation' },
    { name: 'DiscoveryRequest', delegate: 'discoveryRequest', module: 'Litigation' },
    { name: 'PleadingRecord', delegate: 'pleadingRecord', module: 'Litigation' },
    { name: 'TrialNotebookItem', delegate: 'trialNotebookItem', module: 'Litigation' },
    { name: 'BankruptcyCase', delegate: 'bankruptcyCase', module: 'Bankruptcy' },
    { name: 'BankruptcyCreditor', delegate: 'bankruptcyCreditor', module: 'Bankruptcy' },
    { name: 'BankruptcyScheduleItem', delegate: 'bankruptcyScheduleItem', module: 'Bankruptcy' },
    { name: 'ImmigrationCase', delegate: 'immigrationCase', module: 'Immigration' },
    { name: 'USCISReceiptRecord', delegate: 'uSCISReceiptRecord', module: 'Immigration' },
    { name: 'ImmigrationParty', delegate: 'immigrationParty', module: 'Immigration' },
    { name: 'ProbateCase', delegate: 'probateCase', module: 'Probate' },
    { name: 'ProbateBeneficiary', delegate: 'probateBeneficiary', module: 'Probate' },
    { name: 'ProbateAsset', delegate: 'probateAsset', module: 'Probate' },
    { name: 'FamilyLawCase', delegate: 'familyLawCase', module: 'Family Law' },
    { name: 'FamilyLawOrder', delegate: 'familyLawOrder', module: 'Family Law' },
    { name: 'CriminalCase', delegate: 'criminalCase', module: 'Criminal Defense' },
    { name: 'CriminalCharge', delegate: 'criminalCharge', module: 'Criminal Defense' },
    { name: 'AppealsCase', delegate: 'appealsCase', module: 'Appeals' },
    { name: 'EvictionsCase', delegate: 'evictionsCase', module: 'Evictions' },
  ];

  for (const item of requiredModels) {
    const inSchema = schemaContent.includes(`model ${item.name} {`);
    assert('Prisma', item.module, `Model ${item.name} defined in schema.prisma`, inSchema);

    const inClient = dtsContent.includes(`${item.name}Delegate<`) || dtsContent.includes(`export type ${item.name}`);
    assert('Prisma', item.module, `Model ${item.name} compiled in .prisma/client`, inClient);

    const hasDelegateOnPrisma = typeof (prisma as any)[item.delegate] !== 'undefined';
    assert('Prisma', item.module, `prisma.${item.delegate} delegate exposed on PrismaClient`, hasDelegateOnPrisma);
  }

  // Verify foreign key relations & matter links
  assert('Prisma', 'Litigation', 'LitigationCase holds unique matterId foreign key', schemaContent.includes('matterId            String    @unique @map("matter_id")'));
  assert('Prisma', 'Bankruptcy', 'BankruptcyCase holds unique matterId foreign key', schemaContent.includes('matterId           String                   @unique @map("matter_id")'));
  assert('Prisma', 'Immigration', 'ImmigrationCase holds unique matterId foreign key', schemaContent.includes('matterId                 String               @unique @map("matter_id")'));
  assert('Prisma', 'Probate', 'ProbateCase holds unique matterId foreign key', schemaContent.includes('matterId           String               @unique @map("matter_id")'));
  assert('Prisma', 'Family Law', 'FamilyLawCase holds unique matterId foreign key', schemaContent.includes('matterId            String           @unique @map("matter_id")'));
  assert('Prisma', 'Criminal', 'CriminalCase holds unique matterId foreign key', schemaContent.includes('matterId               String           @unique @map("matter_id")'));
  assert('Prisma', 'Appeals', 'AppealsCase holds unique matterId foreign key', schemaContent.includes('matterId               String    @unique @map("matter_id")'));
  assert('Prisma', 'Evictions', 'EvictionsCase holds unique matterId foreign key', schemaContent.includes('matterId             String    @unique @map("matter_id")'));

  // -------------------------------------------------------------------------
  // 2. BACKEND API ROUTE REGISTRATION IN app.ts
  // -------------------------------------------------------------------------
  console.log('\n--- 2. EXPRESS ROUTE REGISTRATION AUDIT IN app.ts ---');

  const appFilePath = path.resolve('backend/src/app.ts');
  const appFileContent = fs.readFileSync(appFilePath, 'utf8');

  const registeredRoutes = [
    { prefix: '/api/v1/pi', router: 'piRouter', module: 'Personal Injury' },
    { prefix: '/api/v1/communications', router: 'communicationRouter', module: 'Communications' },
    { prefix: '/api/v1/litigation', router: 'litigationRouter', module: 'Litigation' },
    { prefix: '/api/v1/bankruptcy', router: 'bankruptcyRouter', module: 'Bankruptcy' },
    { prefix: '/api/v1/immigration', router: 'immigrationRouter', module: 'Immigration' },
    { prefix: '/api/v1/probate', router: 'probateRouter', module: 'Probate' },
    { prefix: '/api/v1/family-law', router: 'familyLawRouter', module: 'Family Law' },
    { prefix: '/api/v1/criminal', router: 'criminalRouter', module: 'Criminal Defense' },
    { prefix: '/api/v1/appeals', router: 'appealsRouter', module: 'Appeals' },
    { prefix: '/api/v1/evictions', router: 'evictionsRouter', module: 'Evictions' },
  ];

  for (const r of registeredRoutes) {
    const isImported = appFileContent.includes(r.router);
    const isMounted = appFileContent.includes(`app.use('${r.prefix}', ${r.router})`);
    assert('Express', r.module, `Router ${r.router} imported in app.ts`, isImported);
    assert('Express', r.module, `Route prefix ${r.prefix} mounted on app`, isMounted);
  }

  // -------------------------------------------------------------------------
  // 3. AUTHENTICATION & SECURITY MIDDLEWARE VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- 3. AUTHENTICATION & SECURITY MIDDLEWARE VERIFICATION ---');

  const routeFiles = [
    { path: 'backend/src/modules/communications/communication.routes.ts', module: 'Communications' },
    { path: 'backend/src/modules/litigation/litigation.routes.ts', module: 'Litigation' },
    { path: 'backend/src/modules/bankruptcy/bankruptcy.routes.ts', module: 'Bankruptcy' },
    { path: 'backend/src/modules/immigration/immigration.routes.ts', module: 'Immigration' },
    { path: 'backend/src/modules/probate/probate.routes.ts', module: 'Probate' },
    { path: 'backend/src/modules/family-law/family-law.routes.ts', module: 'Family Law' },
    { path: 'backend/src/modules/criminal/criminal.routes.ts', module: 'Criminal Defense' },
    { path: 'backend/src/modules/appeals/appeals.routes.ts', module: 'Appeals' },
    { path: 'backend/src/modules/evictions/evictions.routes.ts', module: 'Evictions' },
  ];

  for (const rf of routeFiles) {
    const content = fs.readFileSync(path.resolve(rf.path), 'utf8');
    const hasRequireAuth = content.includes('requireAuth');
    const appliesMiddleware = content.includes('.use(requireAuth)');
    assert('Security', rf.module, `${rf.module} routes protected with requireAuth middleware`, hasRequireAuth && appliesMiddleware);
  }

  // -------------------------------------------------------------------------
  // 4. SERVICE METHODS & CRUD VALIDATION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- 4. SERVICE METHODS & DATABASE CRUD LOGIC AUDIT ---');

  const testUser: AuthenticatedUser = {
    id: 'usr-audit-001',
    userCode: 'AUDIT01',
    email: 'audit@heuglylaw.com',
    role: 'ADMIN',
    permissions: ['*'],
  };

  // Verify PersonalInjuryService methods
  assert('Service', 'Personal Injury', 'PersonalInjuryService.getLiens exists', typeof PersonalInjuryService.getLiens === 'function');
  assert('Service', 'Personal Injury', 'PersonalInjuryService.createLien exists', typeof PersonalInjuryService.createLien === 'function');
  assert('Service', 'Personal Injury', 'PersonalInjuryService.getDamages exists', typeof PersonalInjuryService.getDamages === 'function');
  assert('Service', 'Personal Injury', 'PersonalInjuryService.createDamage exists', typeof PersonalInjuryService.createDamage === 'function');
  assert('Service', 'Personal Injury', 'PersonalInjuryService.getSettlements exists', typeof PersonalInjuryService.getSettlements === 'function');
  assert('Service', 'Personal Injury', 'PersonalInjuryService.createSettlement exists', typeof PersonalInjuryService.createSettlement === 'function');
  assert('Service', 'Personal Injury', 'PersonalInjuryService.getVendors exists', typeof PersonalInjuryService.getVendors === 'function');
  assert('Service', 'Personal Injury', 'PersonalInjuryService.getPIDashboardMetrics exists', typeof PersonalInjuryService.getPIDashboardMetrics === 'function');

  // Verify Communications service
  assert('Service', 'Communications', 'CommunicationService.getCommunications exists', typeof CommunicationService.getCommunications === 'function');
  assert('Service', 'Communications', 'CommunicationService.createCommunication exists', typeof CommunicationService.createCommunication === 'function');
  assert('Service', 'Communications', 'CommunicationService.getUnmatchedQueue exists', typeof CommunicationService.getUnmatchedQueue === 'function');
  assert('Service', 'Communications', 'CommunicationService.matchCommunication exists', typeof CommunicationService.matchCommunication === 'function');

  // Check required validation on CommunicationService.createCommunication
  try {
    await CommunicationService.createCommunication({} as any, testUser);
    assert('Service', 'Communications', 'createCommunication validates required fields', false, 'Did not reject empty payload');
  } catch (err: any) {
    assert('Service', 'Communications', 'createCommunication validates required fields', err instanceof AppError && err.statusCode === 400);
  }

  // Verify Litigation service
  assert('Service', 'Litigation', 'LitigationService.getLitigationCase exists', typeof LitigationService.getLitigationCase === 'function');
  assert('Service', 'Litigation', 'LitigationService.saveLitigationCase exists', typeof LitigationService.saveLitigationCase === 'function');
  assert('Service', 'Litigation', 'LitigationService.getHearings exists', typeof LitigationService.getHearings === 'function');
  assert('Service', 'Litigation', 'LitigationService.createHearing exists', typeof LitigationService.createHearing === 'function');
  assert('Service', 'Litigation', 'LitigationService.getDiscovery exists', typeof LitigationService.getDiscovery === 'function');
  assert('Service', 'Litigation', 'LitigationService.createDiscovery exists', typeof LitigationService.createDiscovery === 'function');
  assert('Service', 'Litigation', 'LitigationService.getPleadings exists', typeof LitigationService.getPleadings === 'function');
  assert('Service', 'Litigation', 'LitigationService.createPleading exists', typeof LitigationService.createPleading === 'function');
  assert('Service', 'Litigation', 'LitigationService.getTrialNotebook exists', typeof LitigationService.getTrialNotebook === 'function');
  assert('Service', 'Litigation', 'LitigationService.createTrialNotebookItem exists', typeof LitigationService.createTrialNotebookItem === 'function');

  // Check required validation on LitigationService
  try {
    await LitigationService.createHearing('mat-test', {} as any, testUser);
    assert('Service', 'Litigation', 'createHearing validates required hearingType and hearingDate', false);
  } catch (err: any) {
    assert('Service', 'Litigation', 'createHearing validates required hearingType and hearingDate', err instanceof AppError && err.statusCode === 400);
  }

  // Verify Bankruptcy service
  assert('Service', 'Bankruptcy', 'BankruptcyService.getBankruptcyCase exists', typeof BankruptcyService.getBankruptcyCase === 'function');
  assert('Service', 'Bankruptcy', 'BankruptcyService.saveBankruptcyCase exists', typeof BankruptcyService.saveBankruptcyCase === 'function');
  assert('Service', 'Bankruptcy', 'BankruptcyService.getCreditors exists', typeof BankruptcyService.getCreditors === 'function');
  assert('Service', 'Bankruptcy', 'BankruptcyService.createCreditor exists', typeof BankruptcyService.createCreditor === 'function');
  assert('Service', 'Bankruptcy', 'BankruptcyService.getSchedules exists', typeof BankruptcyService.getSchedules === 'function');
  assert('Service', 'Bankruptcy', 'BankruptcyService.createScheduleItem exists', typeof BankruptcyService.createScheduleItem === 'function');

  // Verify Immigration service
  assert('Service', 'Immigration', 'ImmigrationService.getImmigrationCase exists', typeof ImmigrationService.getImmigrationCase === 'function');
  assert('Service', 'Immigration', 'ImmigrationService.saveImmigrationCase exists', typeof ImmigrationService.saveImmigrationCase === 'function');
  assert('Service', 'Immigration', 'ImmigrationService.getReceipts exists', typeof ImmigrationService.getReceipts === 'function');
  assert('Service', 'Immigration', 'ImmigrationService.createReceipt exists', typeof ImmigrationService.createReceipt === 'function');
  assert('Service', 'Immigration', 'ImmigrationService.getParties exists', typeof ImmigrationService.getParties === 'function');
  assert('Service', 'Immigration', 'ImmigrationService.createParty exists', typeof ImmigrationService.createParty === 'function');

  // Verify Probate service
  assert('Service', 'Probate', 'ProbateService.getProbateCase exists', typeof ProbateService.getProbateCase === 'function');
  assert('Service', 'Probate', 'ProbateService.saveProbateCase exists', typeof ProbateService.saveProbateCase === 'function');
  assert('Service', 'Probate', 'ProbateService.getBeneficiaries exists', typeof ProbateService.getBeneficiaries === 'function');
  assert('Service', 'Probate', 'ProbateService.createBeneficiary exists', typeof ProbateService.createBeneficiary === 'function');
  assert('Service', 'Probate', 'ProbateService.getAssets exists', typeof ProbateService.getAssets === 'function');
  assert('Service', 'Probate', 'ProbateService.createAsset exists', typeof ProbateService.createAsset === 'function');

  // Verify Family Law service
  assert('Service', 'Family Law', 'FamilyLawService.getFamilyLawCase exists', typeof FamilyLawService.getFamilyLawCase === 'function');
  assert('Service', 'Family Law', 'FamilyLawService.saveFamilyLawCase exists', typeof FamilyLawService.saveFamilyLawCase === 'function');
  assert('Service', 'Family Law', 'FamilyLawService.getOrders exists', typeof FamilyLawService.getOrders === 'function');
  assert('Service', 'Family Law', 'FamilyLawService.createOrder exists', typeof FamilyLawService.createOrder === 'function');

  // Verify Criminal service
  assert('Service', 'Criminal Defense', 'CriminalService.getCriminalCase exists', typeof CriminalService.getCriminalCase === 'function');
  assert('Service', 'Criminal Defense', 'CriminalService.saveCriminalCase exists', typeof CriminalService.saveCriminalCase === 'function');
  assert('Service', 'Criminal Defense', 'CriminalService.getCharges exists', typeof CriminalService.getCharges === 'function');
  assert('Service', 'Criminal Defense', 'CriminalService.createCharge exists', typeof CriminalService.createCharge === 'function');

  // Verify Appeals service
  assert('Service', 'Appeals', 'AppealsService.getAppealsCase exists', typeof AppealsService.getAppealsCase === 'function');
  assert('Service', 'Appeals', 'AppealsService.saveAppealsCase exists', typeof AppealsService.saveAppealsCase === 'function');

  // Verify Evictions service
  assert('Service', 'Evictions', 'EvictionsService.getEvictionsCase exists', typeof EvictionsService.getEvictionsCase === 'function');
  assert('Service', 'Evictions', 'EvictionsService.saveEvictionsCase exists', typeof EvictionsService.saveEvictionsCase === 'function');

  // -------------------------------------------------------------------------
  // 5. FRONTEND INTEGRATION & SERVICE CLIENT VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- 5. FRONTEND API SERVICES & COMPONENT WIRING AUDIT ---');

  const frontendServices = [
    { file: 'frontend/src/services/piService.js', module: 'Personal Injury', methods: ['getLiens', 'createLien', 'getDamages', 'createDamage', 'getSettlements', 'createSettlement', 'getVendors', 'getDashboardMetrics'] },
    { file: 'frontend/src/services/communicationService.js', module: 'Communications', methods: ['getCommunications', 'createCommunication', 'getUnmatchedQueue', 'matchCommunication'] },
    { file: 'frontend/src/services/litigationService.js', module: 'Litigation', methods: ['getLitigationCase', 'saveLitigationCase', 'getHearings', 'createHearing', 'getDiscovery', 'createDiscovery', 'getPleadings', 'createPleading', 'getTrialNotebook', 'createTrialNotebookItem'] },
    { file: 'frontend/src/services/bankruptcyService.js', module: 'Bankruptcy', methods: ['getBankruptcyCase', 'saveBankruptcyCase', 'getCreditors', 'createCreditor', 'getSchedules', 'createScheduleItem'] },
    { file: 'frontend/src/services/immigrationService.js', module: 'Immigration', methods: ['getImmigrationCase', 'saveImmigrationCase', 'getReceipts', 'createReceipt', 'getParties', 'createParty'] },
    { file: 'frontend/src/services/probateService.js', module: 'Probate', methods: ['getProbateCase', 'saveProbateCase', 'getBeneficiaries', 'createBeneficiary', 'getAssets', 'createAsset'] },
    { file: 'frontend/src/services/familyLawService.js', module: 'Family Law', methods: ['getFamilyLawCase', 'saveFamilyLawCase', 'getOrders', 'createOrder'] },
    { file: 'frontend/src/services/criminalService.js', module: 'Criminal Defense', methods: ['getCriminalCase', 'saveCriminalCase', 'getCharges', 'createCharge'] },
    { file: 'frontend/src/services/appealsService.js', module: 'Appeals', methods: ['getAppealsCase', 'saveAppealsCase'] },
    { file: 'frontend/src/services/evictionsService.js', module: 'Evictions', methods: ['getEvictionsCase', 'saveEvictionsCase'] },
  ];

  for (const s of frontendServices) {
    const sPath = path.resolve(s.file);
    const exists = fs.existsSync(sPath);
    assert('Frontend Service', s.module, `Service file ${path.basename(s.file)} exists`, exists);
    if (exists) {
      const content = fs.readFileSync(sPath, 'utf8');
      for (const m of s.methods) {
        assert('Frontend Service', s.module, `${path.basename(s.file)} implements ${m}()`, content.includes(m));
      }
    }
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n=============================================================================');
  const total = auditLog.length;
  const passedCount = auditLog.filter(a => a.passed).length;
  const failedCount = total - passedCount;

  console.log(`TOTAL AUDIT ASSERTIONS: ${total} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log(`OVERALL STATUS: ${failedCount === 0 ? 'ALL AUDIT CHECKS PASSED (100%)' : 'AUDIT REGRESSION DETECTED'}`);
  console.log('=============================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runMasterAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});

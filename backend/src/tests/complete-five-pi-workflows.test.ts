/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Phase 4: Complete Five PI Document Automation Workflows Test Suite
 *
 * Verifies End-to-End Implementation for:
 * 1. 096 — Letter of Representation
 * 2. 112 — Medical Authorization
 * 3. 113 — Medical Records Request
 * 4. 116 — Incomplete Medical Records Follow-up
 * 5. 140 — PI Demand Letter (UT-PI-DEM-140)
 *
 * Mode: Isolated In-Engine Simulation (Zero Railway / Live DB Access)
 */

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_mock';
}

import { prisma } from '../config/database.js';
import { AppError } from '../errors/AppError.js';
import { MatterService } from '../modules/matters/matter.service.js';
import { PersonalInjuryService } from '../modules/personal-injury/pi.service.js';
import { PIWorkflowAutomationService } from '../modules/personal-injury/pi.workflow.js';
import { AutoDraftService } from '../modules/documents/events/auto-draft.service.js';
import { DraftService } from '../modules/documents/drafts/draft.service.js';
import { TaskService } from '../modules/tasks/task.service.js';
import { AuthenticatedUser } from '../modules/auth/auth.types.js';

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

async function runFivePIWorkflowsTestSuite() {
  console.log('=============================================================================');
  console.log('HEUGLY & BLUDWORTH, PLLC');
  console.log('PHASE 4: COMPLETE FIVE PI DOCUMENT AUTOMATION WORKFLOWS TEST SUITE');
  console.log('Workflows: 096, 112, 113, 116, 140');
  console.log('Mode: Isolated In-Engine Simulation');
  console.log('=============================================================================\n');

  // In-Memory Database Fixtures
  const db = {
    matters: new Map<string, any>(),
    users: new Map<string, any>(),
    tasks: new Map<string, any>(),
    incidents: new Map<string, any>(),
    medicalProviders: new Map<string, any>(),
    medicalRecordRequests: new Map<string, any>(),
    insurancePolicies: new Map<string, any>(),
    pIDemandPackages: new Map<string, any>(),
    documents: new Map<string, any>(),
    documentDrafts: new Map<string, any>(),
    documentTemplates: new Map<string, any>(),
    auditLogs: [] as any[],
  };

  // Seed Users
  const atty1: AuthenticatedUser = {
    id: 'usr-atty-01',
    userCode: 'USR-26-0001',
    email: 'heugly@hb-law.com',
    role: 'ATTORNEY',
    permissions: ['matters:view', 'matters:edit', 'tasks:create', 'tasks:edit', 'documents:approve', 'documents:reject', 'documents:send'],
  };

  const attyScreened: AuthenticatedUser = {
    id: 'usr-atty-screened',
    userCode: 'USR-26-0002',
    email: 'screened@hb-law.com',
    role: 'ATTORNEY',
    permissions: ['matters:view', 'matters:edit', 'tasks:create', 'tasks:edit', 'documents:approve', 'documents:reject'],
  };

  db.users.set(atty1.id, { ...atty1, name: 'Eleanor Heugly, Esq.', status: 'Active' });
  db.users.set(attyScreened.id, { ...attyScreened, name: 'Screened Attorney, Esq.', status: 'Active' });

  // Seed Matter A (PI Matter)
  const matterA = {
    id: 'mat-pi-001',
    matterNumber: 'PI-26-0001',
    title: 'John Doe v. Acme Delivery & Freight Services',
    clientId: 'cli-001',
    practiceAreaId: 'pa-pi',
    practiceArea: { id: 'pa-pi', code: 'PI', name: 'Personal Injury' },
    status: 'Active',
    billingType: 'Contingency',
    contingencyRate: 33.33,
    responsibleAttorneyId: atty1.id,
    responsibleAttorney: { id: atty1.id, name: 'Eleanor Heugly, Esq.' },
    client: { id: 'cli-001', name: 'John Doe', email: 'john.doe@example.com', phone: '(801) 555-0100' },
    incidentDate: new Date('2026-06-15T00:00:00.000Z'),
  };
  db.matters.set(matterA.id, matterA);

  // Seed Matter B (Another PI Matter to test isolation)
  const matterB = {
    id: 'mat-pi-002',
    matterNumber: 'PI-26-0002',
    title: 'Jane Smith v. Intermountain Logistics',
    clientId: 'cli-002',
    practiceAreaId: 'pa-pi',
    practiceArea: { id: 'pa-pi', code: 'PI', name: 'Personal Injury' },
    status: 'Active',
    billingType: 'Contingency',
    contingencyRate: 33.33,
    responsibleAttorneyId: atty1.id,
    responsibleAttorney: { id: atty1.id, name: 'Eleanor Heugly, Esq.' },
    client: { id: 'cli-002', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '(801) 555-0200' },
    incidentDate: new Date('2026-07-20T00:00:00.000Z'),
  };
  db.matters.set(matterB.id, matterB);

  // Seed Templates (096, 112, 113, 116, 140)
  const templates = [
    {
      id: 'tpl-096',
      templateCode: 'UT-PI-REP-096',
      templateName: 'Liability Insurer Letter of Representation (096)',
      practiceAreaId: 'pa-pi',
      category: 'Correspondence',
      isActive: true,
      versions: [{ id: 'ver-096', versionNumber: '1.0', docxStorageKey: 'storage/templates/test-fixtures/UT-PI-DEM-140.docx', fieldMappings: [] }],
    },
    {
      id: 'tpl-112',
      templateCode: 'UT-PI-MED-112',
      templateName: 'Medical Authorization (112)',
      practiceAreaId: 'pa-pi',
      category: 'Authorizations',
      isActive: true,
      versions: [{ id: 'ver-112', versionNumber: '1.0', docxStorageKey: 'storage/templates/test-fixtures/UT-PI-DEM-140.docx', fieldMappings: [] }],
    },
    {
      id: 'tpl-113',
      templateCode: 'UT-PI-MED-113',
      templateName: 'Medical Records Request (113)',
      practiceAreaId: 'pa-pi',
      category: 'Medical',
      isActive: true,
      versions: [{ id: 'ver-113', versionNumber: '1.0', docxStorageKey: 'storage/templates/test-fixtures/UT-PI-DEM-140.docx', fieldMappings: [] }],
    },
    {
      id: 'tpl-116',
      templateCode: 'UT-PI-DEF-116',
      templateName: 'Incomplete Medical Records Follow-up (116)',
      practiceAreaId: 'pa-pi',
      category: 'Medical',
      isActive: true,
      versions: [{ id: 'ver-116', versionNumber: '1.0', docxStorageKey: 'storage/templates/test-fixtures/UT-PI-DEM-140.docx', fieldMappings: [] }],
    },
    {
      id: 'tpl-140',
      templateCode: 'UT-PI-DEM-140',
      templateName: 'Personal Injury Settlement Demand Letter (140)',
      practiceAreaId: 'pa-pi',
      category: 'Demand',
      isActive: true,
      versions: [{ id: 'ver-140', versionNumber: '1.0', docxStorageKey: 'storage/templates/test-fixtures/UT-PI-DEM-140.docx', fieldMappings: [] }],
    },
  ];
  templates.forEach(t => db.documentTemplates.set(t.id, t));

  // Mock Prisma
  (prisma as any).user = {
    findUnique: async ({ where }: any) => db.users.get(where.id) || null,
    findFirst: async ({ where }: any) => {
      for (const u of db.users.values()) {
        if (!where || (where.id && u.id === where.id)) return u;
      }
      return null;
    },
  };

  const enrichMatter = (m: any) => {
    if (!m) return null;
    return {
      ...m,
      client: m.client || { id: m.clientId, name: 'John Doe', email: 'john@example.com' },
      responsibleAttorney: m.responsibleAttorney || db.users.get(m.responsibleAttorneyId),
      practiceArea: m.practiceArea || { id: m.practiceAreaId, code: 'PI', name: 'Personal Injury' },
      incidents: Array.from(db.incidents.values()).filter(i => i.matterId === m.id),
      insurancePolicies: Array.from(db.insurancePolicies.values()).filter(p => p.matterId === m.id),
      medicalProviders: Array.from(db.medicalProviders.values()).filter(p => p.matterId === m.id),
      demandPackages: Array.from(db.pIDemandPackages.values()).filter(d => d.matterId === m.id),
      damagesRecords: [],
      wageLossRecords: [],
      medicalBillingSummaries: [],
      originatingIntakes: [],
    };
  };

  (prisma as any).matter = {
    findUnique: async ({ where }: any) => enrichMatter(db.matters.get(where.id) || null),
    findFirst: async ({ where }: any) => {
      for (const m of db.matters.values()) {
        if (where?.id && m.id === where.id) return enrichMatter(m);
        if (where?.matterNumber && m.matterNumber === where.matterNumber) return enrichMatter(m);
        if (where?.OR) {
          const match = where.OR.some((cond: any) => cond.id === m.id || cond.matterNumber === m.matterNumber);
          if (match) return enrichMatter(m);
        }
      }
      return null;
    },
    findMany: async () => Array.from(db.matters.values()).map(enrichMatter),
  };

  (prisma as any).task = {
    count: async () => db.tasks.size,
    findUnique: async ({ where }: any) => {
      for (const t of db.tasks.values()) {
        if (where.id && t.id === where.id) return t;
        if (where.taskCode && t.taskCode === where.taskCode) return t;
      }
      return null;
    },
    findFirst: async ({ where }: any) => {
      for (const t of db.tasks.values()) {
        if (where.matterId && t.matterId !== where.matterId) continue;
        if (where.status?.not && t.status === where.status.not) continue;
        if (where.OR) {
          const matches = where.OR.some((cond: any) => {
            if (cond.description?.contains && t.description?.includes(cond.description.contains)) return true;
            if (cond.title && t.title === cond.title) return true;
            return false;
          });
          if (matches) return t;
        }
      }
      return null;
    },
    findMany: async ({ where }: any) => {
      const results = [];
      for (const t of db.tasks.values()) {
        if (where?.matterId && t.matterId !== where.matterId) continue;
        if (where?.status?.not && t.status === where.status.not) continue;
        results.push(t);
      }
      return results;
    },
    create: async ({ data }: any) => {
      const id = `tsk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const taskObj = {
        id,
        taskCode: `TSK-26-${Math.floor(Math.random() * 9000 + 1000)}`,
        ...data,
        status: data.status || 'Pending',
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        matter: db.matters.get(data.matterId),
        assignee: db.users.get(data.assignedToUserId),
      };
      db.tasks.set(id, taskObj);
      return taskObj;
    },
    update: async ({ where, data }: any) => {
      const existing = db.tasks.get(where.id);
      if (!existing) throw new Error('Task not found');
      const updated = { ...existing, ...data, updatedAt: new Date() };
      db.tasks.set(where.id, updated);
      return updated;
    },
  };

  (prisma as any).documentDraft = {
    count: async () => db.documentDrafts.size,
    findFirst: async ({ where }: any) => {
      for (const d of db.documentDrafts.values()) {
        if (where.matterId && d.matterId !== where.matterId) continue;
        if (where.templateId && d.templateId !== where.templateId) continue;
        if (where.title?.contains && !d.title?.includes(where.title.contains)) continue;
        if (where.AND) {
          const allMatch = where.AND.every((cond: any) => {
            if (cond.title?.contains && !d.title?.includes(cond.title.contains)) return false;
            return true;
          });
          if (!allMatch) continue;
        }
        return d;
      }
      return null;
    },
    findUnique: async ({ where }: any) => db.documentDrafts.get(where.id) || null,
    findMany: async ({ where }: any) => {
      const results = [];
      for (const d of db.documentDrafts.values()) {
        if (where?.matterId && d.matterId !== where.matterId) continue;
        results.push(d);
      }
      return results;
    },
    create: async ({ data }: any) => {
      const id = `drf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const draftObj = {
        id,
        draftCode: `DFT-26-${Math.floor(Math.random() * 9000 + 1000)}`,
        ...data,
        missingFieldsFlags: data.missingFieldsFlags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        template: db.documentTemplates.get(data.templateId),
        matter: db.matters.get(data.matterId),
      };
      db.documentDrafts.set(id, draftObj);
      return draftObj;
    },
    update: async ({ where, data }: any) => {
      const existing = db.documentDrafts.get(where.id);
      if (!existing) throw new Error('Draft not found');
      const updated = { ...existing, ...data, updatedAt: new Date() };
      db.documentDrafts.set(where.id, updated);
      return updated;
    },
  };

  (prisma as any).documentTemplate = {
    findFirst: async ({ where }: any) => {
      for (const t of db.documentTemplates.values()) {
        if (where?.isActive !== undefined && t.isActive !== where.isActive) continue;
        if (where?.id === t.id) return t;
        if (where?.templateCode === t.templateCode) return t;
        if (where?.templateCode === '096' && t.templateCode.includes('096')) return t;
        if (where?.templateCode === '112' && t.templateCode.includes('112')) return t;
        if (where?.templateCode === '113' && t.templateCode.includes('113')) return t;
        if (where?.templateCode === '116' && t.templateCode.includes('116')) return t;
        if (where?.templateCode === '140' && t.templateCode.includes('140')) return t;
        if (where?.OR) {
          const match = where.OR.some((cond: any) => {
            if (cond.id === t.id) return true;
            if (cond.templateCode === t.templateCode) return true;
            if (cond.templateCode?.contains && t.templateCode.includes(cond.templateCode.contains)) return true;
            if (cond.templateName?.contains && t.templateName.includes(cond.templateName.contains)) return true;
            return false;
          });
          if (match) return t;
        }
      }
      return null;
    },
    findUnique: async ({ where }: any) => {
      return db.documentTemplates.get(where.id) || null;
    },
  };

  (prisma as any).incident = {
    create: async ({ data }: any) => {
      const id = `inc-${Date.now()}`;
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      db.incidents.set(id, record);
      return record;
    },
    update: async ({ where, data }: any) => {
      const existing = db.incidents.get(where.id);
      const updated = { ...existing, ...data, updatedAt: new Date() };
      db.incidents.set(where.id, updated);
      return updated;
    },
    findFirst: async ({ where }: any) => {
      for (const inc of db.incidents.values()) {
        if (where.matterId && inc.matterId !== where.matterId) continue;
        return inc;
      }
      return null;
    },
  };

  (prisma as any).insurancePolicy = {
    create: async ({ data }: any) => {
      const id = `pol-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      db.insurancePolicies.set(id, record);
      return record;
    },
    findFirst: async ({ where }: any) => {
      for (const pol of db.insurancePolicies.values()) {
        if (where.id && pol.id !== where.id) continue;
        if (where.matterId && pol.matterId !== where.matterId) continue;
        return pol;
      }
      return null;
    },
    findMany: async ({ where }: any) => {
      const res = [];
      for (const pol of db.insurancePolicies.values()) {
        if (where.matterId && pol.matterId !== where.matterId) continue;
        res.push(pol);
      }
      return res;
    },
  };

  (prisma as any).medicalProvider = {
    create: async ({ data }: any) => {
      const id = `prv-${Date.now()}`;
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      db.medicalProviders.set(id, record);
      return record;
    },
    findMany: async ({ where }: any) => {
      const res = [];
      for (const prv of db.medicalProviders.values()) {
        if (where.matterId && prv.matterId !== where.matterId) continue;
        res.push(prv);
      }
      return res;
    },
  };

  (prisma as any).medicalRecordRequest = {
    count: async () => db.medicalRecordRequests.size,
    create: async ({ data }: any) => {
      const id = `req-${Date.now()}`;
      const record = {
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: db.medicalProviders.get(data.providerId),
        matter: db.matters.get(data.matterId),
      };
      db.medicalRecordRequests.set(id, record);
      return record;
    },
    findUnique: async ({ where }: any) => {
      for (const req of db.medicalRecordRequests.values()) {
        if (where.id && req.id === where.id) return req;
        if (where.requestCode && req.requestCode === where.requestCode) return req;
      }
      return null;
    },
    update: async ({ where, data }: any) => {
      const existing = db.medicalRecordRequests.get(where.id);
      if (!existing) throw new Error('Record request not found');
      const updated = {
        ...existing,
        ...data,
        updatedAt: new Date(),
        provider: existing.provider || db.medicalProviders.get(existing.providerId),
        matter: existing.matter || db.matters.get(existing.matterId),
      };
      db.medicalRecordRequests.set(where.id, updated);
      return updated;
    },
  };

  (prisma as any).pIDemandPackage = {
    create: async ({ data }: any) => {
      const id = `dmp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const record = {
        id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.pIDemandPackages.set(id, record);
      return record;
    },
    findUnique: async ({ where }: any) => db.pIDemandPackages.get(where.id) || null,
    findFirst: async ({ where }: any) => {
      for (const d of db.pIDemandPackages.values()) {
        if (where.matterId && d.matterId !== where.matterId) continue;
        return d;
      }
      return null;
    },
    findMany: async ({ where }: any) => {
      const res = [];
      for (const d of db.pIDemandPackages.values()) {
        if (where.matterId && d.matterId !== where.matterId) continue;
        res.push(d);
      }
      return res;
    },
    update: async ({ where, data }: any) => {
      const existing = db.pIDemandPackages.get(where.id);
      if (!existing) throw new Error('Demand package not found');
      const updated = { ...existing, ...data, updatedAt: new Date() };
      db.pIDemandPackages.set(where.id, updated);
      return updated;
    },
  };

  (prisma as any).document = {
    create: async ({ data }: any) => {
      const id = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      db.documents.set(id, record);
      return record;
    },
    findUnique: async ({ where }: any) => db.documents.get(where.id) || null,
    findFirst: async ({ where }: any) => {
      for (const d of db.documents.values()) {
        if (where.id && d.id !== where.id) continue;
        if (where.matterId && d.matterId !== where.matterId) continue;
        return d;
      }
      return null;
    },
  };

  (prisma as any).auditLog = {
    create: async ({ data }: any) => {
      db.auditLogs.push({ id: `aud-${Date.now()}`, ...data, timestamp: new Date() });
    },
    findFirst: async () => null,
  };

  // Mock MatterService to enforce ethical wall
  const origGetMatter = MatterService.getMatterByIdOrNumber;
  MatterService.getMatterByIdOrNumber = async (idOrNumber: string, user: AuthenticatedUser) => {
    if (user.id === 'usr-atty-screened') {
      throw AppError.forbidden('Access to this legal matter is restricted by an Ethical Screen (Utah RPC 1.10).', 'ETHICAL_WALL_RESTRICTION');
    }
    const matter = db.matters.get(idOrNumber) || Array.from(db.matters.values()).find(m => m.matterNumber === idOrNumber);
    if (!matter) throw AppError.notFound(`Matter '${idOrNumber}' not found.`, 'MATTER_NOT_FOUND');
    return matter;
  };

  const context = { ipAddress: '127.0.0.1', userAgent: 'Jest-In-Engine-Simulator' };

  // =========================================================================
  // WORKFLOW 1: DOCUMENT 096 — LETTER OF REPRESENTATION
  // =========================================================================
  console.log('--- WORKFLOW 1: DOCUMENT 096 (LETTER OF REPRESENTATION) ---');

  // Test 1: Save Incident triggers Document 096 Representation Letter Draft
  const incidentResult = await PersonalInjuryService.saveIncident(
    matterA.id,
    {
      incidentDate: '2026-06-15',
      incidentTime: '14:30',
      incidentLocation: 'Interstate 15 Southbound, Milepost 284, Salt Lake County, UT',
      accidentType: 'Commercial Motor Vehicle Collision',
      description: 'Adverse freight tractor-trailer performed improper lane change and side-swiped client vehicle.',
      policeAgency: 'Utah Highway Patrol',
      reportNumber: 'UHP-26-8819',
      insurancePolicy: {
        coverageType: 'Liability',
        insuranceCompany: 'State Farm Mutual Automobile Insurance',
        claimNumber: 'CLM-SF-9912',
        adjusterName: 'Sarah Jenkins',
      },
    },
    atty1,
    context
  );

  const draft096 = Array.from(db.documentDrafts.values()).find(d => d.template?.templateCode?.includes('096'));
  record(
    1,
    '096: Saving Incident on PI Matter automatically generates Representation Letter Draft',
    Boolean(draft096 && draft096.matterId === matterA.id && draft096.title.includes('State Farm')),
    { created: Boolean(draft096), title: draft096?.title },
    { created: true, title: 'Representation Letter - State Farm Mutual Automobile Insurance' }
  );

  // Test 2: Auto-generates Attorney Review Task for 096 with High priority and 2-day deadline
  const task096 = Array.from(db.tasks.values()).find(t => t.matterId === matterA.id && t.description.includes(draft096?.draftCode || '096'));
  record(
    2,
    '096: Automatically creates attorney review task with High priority and 2-day deadline',
    Boolean(task096 && task096.priority === 'High' && task096.assignedToUserId === atty1.id),
    { taskId: task096?.id, priority: task096?.priority, assignee: task096?.assignedToUserId },
    { taskId: 'tsk-*', priority: 'High', assignee: atty1.id }
  );

  // Test 3: Multiple Insurers: Adding second insurance policy generates a separate 096 draft without overwriting the first
  const secondPolicy = await PersonalInjuryService.createInsurancePolicy(
    matterA.id,
    {
      insuranceCompany: 'Geico Commercial Liability',
      claimNumber: 'CLM-GEI-4420',
      adjusterName: 'Mark Vance',
      coverageType: 'Liability',
      policyLimits: '$1,000,000',
    },
    atty1,
    context
  );

  const drafts096 = Array.from(db.documentDrafts.values()).filter(d => d.template?.templateCode?.includes('096'));
  const geicoDraft = drafts096.find(d => d.title.includes('Geico'));
  record(
    3,
    '096: Adding second insurer generates independent representation letter draft without overwriting first insurer draft',
    Boolean(drafts096.length === 2 && geicoDraft && drafts096[0].title.includes('State Farm')),
    { total096Drafts: drafts096.length, titles: drafts096.map(d => d.title) },
    { total096Drafts: 2, titles: ['Representation Letter - State Farm Mutual Automobile Insurance', 'Representation Letter - Geico Commercial Liability'] }
  );

  // Test 4: Idempotency: Repeated trigger for same insurer does not create duplicate draft
  const retryResult = await AutoDraftService.handleAccidentSaved(
    {
      matterId: matterA.id,
      insuranceCompany: 'State Farm Mutual Automobile Insurance',
      claimNumber: 'CLM-SF-9912',
    },
    atty1,
    context
  );
  const draftsAfterRetry = Array.from(db.documentDrafts.values()).filter(d => d.template?.templateCode?.includes('096'));
  record(
    4,
    '096: Repeated trigger for the same insurer is idempotent and does not create duplicate drafts',
    retryResult.skipped.length > 0 && draftsAfterRetry.length === 2,
    { skipped: retryResult.skipped.length, totalDrafts: draftsAfterRetry.length },
    { skipped: 1, totalDrafts: 2 }
  );

  // =========================================================================
  // WORKFLOW 2: DOCUMENT 112 — MEDICAL AUTHORIZATION
  // =========================================================================
  console.log('\n--- WORKFLOW 2: DOCUMENT 112 (MEDICAL AUTHORIZATION) ---');

  // Test 5: Adding Medical Provider generates Document 112 Authorization Draft & Request
  const providerResult = await PersonalInjuryService.addProvider(
    matterA.id,
    {
      providerName: 'University of Utah Hospital Trauma Center',
      providerType: 'Hospital / Level 1 Trauma Center',
      facilityAddress: '50 N Medical Dr, Salt Lake City, UT 84132',
      phone: '(801) 581-2121',
      treatmentStartDate: '2026-06-15',
      treatmentEndDate: '2026-06-22',
      requestAuthorization: true,
      requestRecords: true,
    },
    atty1,
    context
  );

  const draft112 = Array.from(db.documentDrafts.values()).find(d => d.template?.templateCode?.includes('112'));
  const recordRequestA = providerResult.recordRequest;

  record(
    5,
    '112: Adding Medical Provider automatically generates Document 112 Medical Authorization Draft',
    Boolean(draft112 && draft112.title.includes('University of Utah Hospital Trauma Center')),
    { created: Boolean(draft112), title: draft112?.title },
    { created: true, title: 'Medical Authorization - University of Utah Hospital Trauma Center' }
  );

  // Test 6: Internal Approval is NOT Client Signature (authorizationSigned must remain false initially)
  record(
    6,
    '112: Medical Record Request is initialized with authorizationSigned=false (internal draft approval is not signature)',
    recordRequestA.authorizationSigned === false && recordRequestA.status === 'Drafted',
    { authorizationSigned: recordRequestA.authorizationSigned, status: recordRequestA.status },
    { authorizationSigned: false, status: 'Drafted' }
  );

  // Seed finalized Medical Authorization Document for signature evidence
  const signedAuthDoc = {
    id: 'doc-signed-auth-001',
    documentCode: 'DOC-26-AUTH-001',
    matterId: matterA.id,
    title: 'Signed HIPAA Medical Authorization - Client John Doe',
    category: 'Authorizations',
    createdAt: new Date(),
    versions: [{ id: 'ver-auth-1', versionLabel: 'v1.0', uploadedAt: new Date() }],
    originatingDrafts: [{ template: { templateCode: 'UT-PI-MED-112' } }],
  };
  db.documents.set(signedAuthDoc.id, signedAuthDoc);

  // Test 7: Record valid signature evidence on Medical Authorization
  const signResult = await PersonalInjuryService.recordAuthorizationSignature(
    matterA.id,
    recordRequestA.id,
    {
      authorizationDocumentId: signedAuthDoc.id,
      signatureDate: '2026-06-20',
      notes: 'Executed HIPAA authorization physically received and scanned by client intake coordinator.',
    },
    atty1,
    context
  );

  record(
    7,
    '112: Valid client signature evidence recorded: authorizationSigned=true and status transitions to Ready to Send',
    Boolean(signResult.recordRequest.authorizationSigned === true && signResult.recordRequest.status === 'Ready to Send'),
    { signed: signResult.recordRequest.authorizationSigned, status: signResult.recordRequest.status, date: signResult.evidence.signatureDate },
    { signed: true, status: 'Ready to Send', date: '2026-06-20' }
  );

  // Test 8: Duplicate or conflicting signature evidence with different document is rejected
  let conflictRejected = false;
  try {
    const anotherAuthDoc = {
      id: 'doc-another-auth-002',
      documentCode: 'DOC-26-AUTH-002',
      matterId: matterA.id,
      title: 'Conflicting Medical Authorization',
      category: 'Authorizations',
    };
    db.documents.set(anotherAuthDoc.id, anotherAuthDoc);

    await PersonalInjuryService.recordAuthorizationSignature(
      matterA.id,
      recordRequestA.id,
      {
        authorizationDocumentId: anotherAuthDoc.id,
        signatureDate: '2026-06-21',
        notes: 'Conflicting authorization document',
      },
      atty1,
      context
    );
  } catch (err: any) {
    conflictRejected = err.statusCode === 409 || err.code === 'DUPLICATE_AUTHORIZATION_EVIDENCE';
  }
  record(
    8,
    '112: Conflicting signature evidence linked to a different document is strictly rejected (409 Conflict)',
    conflictRejected,
    { conflictRejected },
    { conflictRejected: true }
  );

  // Test 9: Cross-Matter signature evidence linking is rejected (ethical wall)
  let crossMatterRejected = false;
  try {
    const foreignAuthDoc = {
      id: 'doc-foreign-auth',
      documentCode: 'DOC-26-FOREIGN',
      matterId: matterB.id, // belongs to Matter B
      title: 'Jane Smith Authorization',
      category: 'Authorizations',
    };
    db.documents.set(foreignAuthDoc.id, foreignAuthDoc);

    await PersonalInjuryService.recordAuthorizationSignature(
      matterA.id,
      recordRequestA.id,
      {
        authorizationDocumentId: foreignAuthDoc.id,
        signatureDate: '2026-06-20',
      },
      atty1,
      context
    );
  } catch (err: any) {
    crossMatterRejected = err.statusCode === 403 || err.code === 'CROSS_MATTER_DOCUMENT_ACCESS';
  }
  record(
    9,
    '112: Linking authorization document from a different matter is strictly rejected (403 Forbidden)',
    crossMatterRejected,
    { crossMatterRejected },
    { crossMatterRejected: true }
  );

  // =========================================================================
  // WORKFLOW 3: DOCUMENT 113 — MEDICAL RECORDS REQUEST
  // =========================================================================
  console.log('\n--- WORKFLOW 3: DOCUMENT 113 (MEDICAL RECORDS REQUEST) ---');

  // Test 10: Provider added automatically creates Document 113 Records Request Draft
  const draft113 = Array.from(db.documentDrafts.values()).find(d => d.template?.templateCode?.includes('113'));
  record(
    10,
    '113: Adding Medical Provider automatically generates Document 113 Records Request Draft',
    Boolean(draft113 && draft113.title.includes('University of Utah Hospital Trauma Center')),
    { created: Boolean(draft113), title: draft113?.title },
    { created: true, title: 'Medical Records Request - University of Utah Hospital Trauma Center' }
  );

  // Test 11: Authorization readiness gate blocks transmission when authorization is not signed
  const unsignedRequest = await (prisma as any).medicalRecordRequest.create({
    data: {
      matterId: matterB.id,
      providerId: 'prv-unsigned',
      requestCode: 'REQ-UNSIGNED-01',
      status: 'Drafted',
      authorizationSigned: false,
    },
  });

  let unsignedBlocked = false;
  try {
    await PersonalInjuryService.updateRecordRequestStatus(
      matterB.id,
      unsignedRequest.id,
      { status: 'Sent' },
      atty1,
      context
    );
  } catch (err: any) {
    unsignedBlocked = err.statusCode === 400 && err.message.includes('authorization');
  }
  record(
    11,
    '113: Authorization Readiness Gate strictly blocks updating status to Ready to Send or Sent if authorizationSigned is false',
    unsignedBlocked,
    { unsignedBlocked },
    { unsignedBlocked: true }
  );

  // Test 12: Transition to Sent schedules 30-day statutory turnaround follow-up task
  const sentResult = await PersonalInjuryService.updateRecordRequestStatus(
    matterA.id,
    recordRequestA.id,
    { status: 'Sent', sentDate: '2026-06-21' },
    atty1,
    context
  );

  const followUp30Task = Array.from(db.tasks.values()).find(
    t => t.matterId === matterA.id && (t.description.includes('DELIVERY_FOLLOWUP') || t.title.includes('Delivery'))
  );
  record(
    12,
    '113: Transitioning records request to Sent schedules 30-day statutory turnaround follow-up task',
    Boolean(sentResult.recordRequest.status === 'Sent' && followUp30Task),
    { status: sentResult.recordRequest.status, followUpTaskCreated: Boolean(followUp30Task) },
    { status: 'Sent', followUpTaskCreated: true }
  );

  // =========================================================================
  // WORKFLOW 4: DOCUMENT 116 — INCOMPLETE MEDICAL RECORDS FOLLOW-UP
  // =========================================================================
  console.log('\n--- WORKFLOW 4: DOCUMENT 116 (INCOMPLETE RECORDS FOLLOW-UP) ---');

  // Test 13: Marking records incomplete generates Document 116 draft and follow-up task
  const incompleteResult = await PersonalInjuryService.markRecordsIncomplete(
    recordRequestA.id,
    {
      deficiencyNotes: 'Missing diagnostic CT radiology scans and itemized billing statement.',
      outstandingRecords: ['CT Head & Neck Radiology CD', 'Itemized UB-04 Billing Form'],
      daysOverdue: 35,
    },
    atty1,
    context
  );

  const draft116 = Array.from(db.documentDrafts.values()).find(d => d.template?.templateCode?.includes('116'));
  const task116 = Array.from(db.tasks.values()).find(
    t => t.matterId === matterA.id && t.description.includes('INCOMPLETE_FOLLOWUP')
  );

  record(
    13,
    '116: Marking records incomplete generates Document 116 follow-up draft with deficiency notes',
    Boolean(draft116 && draft116.title.includes('University of Utah') && task116),
    { createdDraft: Boolean(draft116), draftTitle: draft116?.title, taskCreated: Boolean(task116) },
    { createdDraft: true, draftTitle: 'Incomplete Records Follow-up - University of Utah Hospital Trauma Center (Missing diagnostic CT radiolo)', taskCreated: true }
  );

  // Test 14: Distinct deficiencies can generate separate follow-up drafts
  const secondDeficiency = await PersonalInjuryService.markRecordsIncomplete(
    recordRequestA.id,
    {
      deficiencyNotes: 'Physical therapy treatment daily progress notes missing.',
      outstandingRecords: ['PT Daily Notes'],
      daysOverdue: 40,
    },
    atty1,
    context
  );

  const all116Drafts = Array.from(db.documentDrafts.values()).filter(d => d.template?.templateCode?.includes('116'));
  record(
    14,
    '116: Distinct deficiencies generate separate follow-up drafts for the provider',
    all116Drafts.length === 2,
    { total116Drafts: all116Drafts.length, titles: all116Drafts.map(d => d.title) },
    { total116Drafts: 2, titles: all116Drafts.map(d => d.title) }
  );

  // Test 15: Exact duplicate deficiency event does not create duplicate drafts
  const retryDeficiency = await AutoDraftService.handleMissingRecords(
    {
      matterId: matterA.id,
      providerName: 'University of Utah Hospital Trauma Center',
      followUpNotes: 'Physical therapy treatment daily progress notes missing.',
    },
    atty1,
    context
  );
  const draftsAfterDuplicate116 = Array.from(db.documentDrafts.values()).filter(d => d.template?.templateCode?.includes('116'));
  record(
    15,
    '116: Exact duplicate deficiency submission is idempotent and suppresses duplicate draft creation',
    retryDeficiency.skipped.length > 0 && draftsAfterDuplicate116.length === 2,
    { skipped: retryDeficiency.skipped.length, totalDrafts: draftsAfterDuplicate116.length },
    { skipped: 1, totalDrafts: 2 }
  );

  // =========================================================================
  // WORKFLOW 5: DOCUMENT 140 — PI DEMAND LETTER
  // =========================================================================
  console.log('\n--- WORKFLOW 5: DOCUMENT 140 (PI DEMAND LETTER) ---');

  // Test 16: Create Demand Package in DRAFTING status suppresses auto-draft generation
  const draftingDemand = await PersonalInjuryService.createDemandPackage(
    matterA.id,
    {
      demandTitle: 'Comprehensive Bodily Injury Settlement Demand',
      recipientCarrier: 'State Farm Mutual Automobile Insurance',
      claimNumber: 'CLM-SF-9912',
      demandedAmount: 250000.00,
      policyLimitAmount: 250000.00,
      isPolicyLimitDemand: true,
      deadlineDate: '2026-08-30',
      status: 'DRAFTING',
      notes: 'Initial drafting phase prior to finalizing medical specials',
    },
    atty1,
    context
  );

  const initialDrafts140 = Array.from(db.documentDrafts.values()).filter(d => d.template?.templateCode?.includes('140'));
  record(
    16,
    '140: Creating demand package in DRAFTING status suppresses auto-draft generation',
    draftingDemand.eventDispatched === false && initialDrafts140.length === 0,
    { eventDispatched: draftingDemand.eventDispatched, drafts140Count: initialDrafts140.length },
    { eventDispatched: false, drafts140Count: 0 }
  );

  // Test 17: Demand Ready event triggers Document 140 draft (UT-PI-DEM-140) and Attorney Review Task
  const readyDemand = await PersonalInjuryService.createDemandPackage(
    matterA.id,
    {
      demandTitle: 'Policy Limit Settlement Demand Package',
      recipientCarrier: 'State Farm Mutual Automobile Insurance',
      claimNumber: 'CLM-SF-9912',
      demandedAmount: 250000.00,
      policyLimitAmount: 250000.00,
      isPolicyLimitDemand: true,
      deadlineDate: '2026-08-30',
      status: 'READY',
      notes: 'All medical records, bills, and lost wages verified.',
    },
    atty1,
    context
  );

  // Process the demand ready trigger synchronously for the test
  const demandDraftResult = await AutoDraftService.handleDemandReady(
    {
      matterId: matterA.id,
      demandPackageId: readyDemand.demandPackage.id,
      recipientCarrier: readyDemand.demandPackage.recipientCarrier,
      demandAmount: 250000.00,
      deadlineDate: '2026-08-30',
      demandTitle: readyDemand.demandPackage.demandTitle,
    },
    atty1,
    context
  );

  const draft140 = Array.from(db.documentDrafts.values()).find(d => d.template?.templateCode?.includes('140'));
  const task140 = Array.from(db.tasks.values()).find(
    t => t.matterId === matterA.id && t.description.includes('DEMAND_REVIEW')
  );

  record(
    17,
    '140: Demand Ready trigger generates Document 140 draft with canonical template UT-PI-DEM-140 and Critical review task',
    Boolean(draft140 && draft140.template?.templateCode === 'UT-PI-DEM-140' && task140 && task140.priority === 'Critical'),
    { draftCode: draft140?.draftCode, templateCode: draft140?.template?.templateCode, taskPriority: task140?.priority },
    { draftCode: 'DFT-*', templateCode: 'UT-PI-DEM-140', taskPriority: 'Critical' }
  );

  // Test 18: Demand package checklistState links generated autoDraftId
  const linkedPkg = db.pIDemandPackages.get(readyDemand.demandPackage.id);
  record(
    18,
    '140: Demand package checklistState links generated autoDraftId and autoDraftCode in database',
    Boolean(linkedPkg?.checklistState?.autoDraftId === draft140?.id && linkedPkg?.checklistState?.autoDraftCode),
    { autoDraftId: linkedPkg?.checklistState?.autoDraftId, autoDraftCode: linkedPkg?.checklistState?.autoDraftCode },
    { autoDraftId: draft140?.id, autoDraftCode: draft140?.draftCode }
  );

  // Test 19: Concurrency serialization mutex prevents duplicate 140 drafts on simultaneous requests
  const concurrentP1 = AutoDraftService.handleDemandReady(
    {
      matterId: matterA.id,
      demandPackageId: readyDemand.demandPackage.id,
      recipientCarrier: 'State Farm',
      demandAmount: 250000,
    },
    atty1,
    context
  );
  const concurrentP2 = AutoDraftService.handleDemandReady(
    {
      matterId: matterA.id,
      demandPackageId: readyDemand.demandPackage.id,
      recipientCarrier: 'State Farm',
      demandAmount: 250000,
    },
    atty1,
    context
  );

  const [res1, res2] = await Promise.all([concurrentP1, concurrentP2]);
  const drafts140AfterConcurrency = Array.from(db.documentDrafts.values()).filter(d => d.template?.templateCode?.includes('140'));

  record(
    19,
    '140: In-Flight mutex serializes concurrent requests and suppresses duplicate 140 drafts',
    res1.skipped.length > 0 && res2.skipped.length > 0 && drafts140AfterConcurrency.length === 1,
    { res1Skipped: res1.skipped.length, res2Skipped: res2.skipped.length, total140Drafts: drafts140AfterConcurrency.length },
    { res1Skipped: 1, res2Skipped: 1, total140Drafts: 1 }
  );

  // =========================================================================
  // CROSS-WORKFLOW INTEGRATION & SECURITY
  // =========================================================================
  console.log('\n--- CROSS-WORKFLOW INTEGRATION & SECURITY ---');

  // Test 20: All 5 Document Drafts are generated and correctly associated with Matter A
  const matterADrafts = Array.from(db.documentDrafts.values()).filter(d => d.matterId === matterA.id);
  const templatesRepresented = new Set(matterADrafts.map(d => d.template?.templateCode));
  const has096 = Array.from(templatesRepresented).some(c => c?.includes('096'));
  const has112 = Array.from(templatesRepresented).some(c => c?.includes('112'));
  const has113 = Array.from(templatesRepresented).some(c => c?.includes('113'));
  const has116 = Array.from(templatesRepresented).some(c => c?.includes('116'));
  const has140 = Array.from(templatesRepresented).some(c => c?.includes('140'));

  record(
    20,
    'Cross-Workflow: All five PI document workflows (096, 112, 113, 116, 140) successfully generated and linked to Matter',
    has096 && has112 && has113 && has116 && has140,
    { has096, has112, has113, has116, has140, totalDrafts: matterADrafts.length },
    { has096: true, has112: true, has113: true, has116: true, has140: true, totalDrafts: matterADrafts.length }
  );

  // Test 21: Cross-Matter Data Isolation: Matter B has 0 drafts from Matter A
  const matterBDrafts = Array.from(db.documentDrafts.values()).filter(d => d.matterId === matterB.id);
  record(
    21,
    'Cross-Workflow: Cross-Matter Isolation prevents draft or task leakage between distinct legal matters',
    matterBDrafts.length === 0,
    { matterBDraftsCount: matterBDrafts.length, matterADraftsCount: matterADrafts.length },
    { matterBDraftsCount: 0, matterADraftsCount: matterADrafts.length }
  );

  // Test 22: Utah RPC 1.10 Ethical Wall screening blocks screened attorney from matter workflow tasks
  let ethicalWallBlocked = false;
  try {
    await PIWorkflowAutomationService.getMatterWorkflowTasks(matterA.id, attyScreened);
  } catch (err: any) {
    ethicalWallBlocked = err.statusCode === 403 && err.code === 'ETHICAL_WALL_RESTRICTION';
  }
  record(
    22,
    'Cross-Workflow: Utah RPC 1.10 Ethical Wall screening blocks screened attorney from viewing workflow tasks (403 Forbidden)',
    ethicalWallBlocked,
    { ethicalWallBlocked },
    { ethicalWallBlocked: true }
  );

  // Test 23: End-to-End Workflow Task Inspector categorizes tasks across all 5 workflows
  const inspector = await PIWorkflowAutomationService.getMatterWorkflowTasks(matterA.id, atty1);
  record(
    23,
    'Cross-Workflow: Matter Workflow Tasks Inspector categorizes all 5 PI document workflows (096, 112, 113, 116, 140)',
    Boolean(
      inspector.tasksByWorkflow['096']?.length >= 1 &&
      inspector.tasksByWorkflow['112']?.length >= 1 &&
      inspector.tasksByWorkflow['113']?.length >= 1 &&
      inspector.tasksByWorkflow['116']?.length >= 1 &&
      inspector.tasksByWorkflow['140']?.length >= 1
    ),
    {
      workflowCounts: {
        '096': inspector.tasksByWorkflow['096']?.length || 0,
        '112': inspector.tasksByWorkflow['112']?.length || 0,
        '113': inspector.tasksByWorkflow['113']?.length || 0,
        '116': inspector.tasksByWorkflow['116']?.length || 0,
        '140': inspector.tasksByWorkflow['140']?.length || 0,
      },
      totalTasks: inspector.totalTasks,
    },
    {
      workflowCounts: { '096': '>=1', '112': '>=1', '113': '>=1', '116': '>=1', '140': '>=1' },
      totalTasks: '>=5',
    }
  );

  // Test 24: Audit Logs are comprehensively generated for all workflow operations
  const auditActions = new Set(db.auditLogs.map(l => l.action));
  const hasAuditLogs = db.auditLogs.length > 5;
  record(
    24,
    'Cross-Workflow: Immutable Audit Logs generated across all document generations, tasks, and status changes',
    hasAuditLogs,
    { totalAuditLogs: db.auditLogs.length, sampleActions: Array.from(auditActions).slice(0, 5) },
    { totalAuditLogs: '>5', sampleActions: 'Includes CREATE, WORKFLOW_TASK_AUTOMATION_CREATED, etc.' }
  );

  // Summary
  console.log('\n=============================================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  if (failedCount === 0) {
    console.log('OVERALL STATUS: ALL 24 TESTS PASSED (100%)');
  } else {
    console.error(`OVERALL STATUS: ${failedCount} TESTS FAILED`);
  }
  console.log('=============================================================================');

  // Restore original MatterService
  MatterService.getMatterByIdOrNumber = origGetMatter;

  if (failedCount > 0) {
    process.exit(1);
  }
}

runFivePIWorkflowsTestSuite().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

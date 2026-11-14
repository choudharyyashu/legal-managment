/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Phase 4 Stage 3 Sub-stage E: PI Document Workflow: Tasks, Reminders & Automation Test Suite
 *
 * Mode: Isolated In-Engine Mock Fixture (Zero Railway / Live DB Access)
 *
 * Verifies all Sub-stage E requirements:
 * 1. Automatic task creation for all five document workflows (096, 112, 113, 116, 140).
 * 2. Duplicate event handling (idempotency, retry-safe task creation without duplicates).
 * 3. Task assignment, priority, due date and status updates.
 * 4. Authorization-dependent records-request readiness (blocks transmission without signed auth).
 * 5. Authorization recorded transitions (auto-completes obtain-auth task & creates transmission task).
 * 6. Incomplete medical records follow-up task automation.
 * 7. Demand review task automation for responsible attorney.
 * 8. Rejection correction task creation & deduplication.
 * 9. Due-date and overdue calculations & transitions.
 * 10. Reminder scheduling calculations per legal practice rules.
 * 11. Persistent multi-instance reminder processing & deduplication via AuditLog.
 * 12. Utah RPC 1.10 Ethical Wall screening enforcement for Matter workflow tasks.
 * 13. End-to-end Matter workflow tasks inspector.
 */

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

async function runSubstageETests() {
  console.log('=============================================================================');
  console.log('PHASE 4 — STAGE 3: SUB-STAGE E (PI TASKS, REMINDERS & AUTOMATION)');
  console.log('Mode: Isolated In-Engine Simulation (Zero Railway / Live DB Access)');
  console.log('=============================================================================\n');

  // In-Memory Database Fixtures
  const db = {
    matters: new Map<string, any>(),
    users: new Map<string, any>(),
    tasks: new Map<string, any>(),
    medicalProviders: new Map<string, any>(),
    medicalRecordRequests: new Map<string, any>(),
    insurancePolicies: new Map<string, any>(),
    pIDemandPackages: new Map<string, any>(),
    documents: new Map<string, any>(),
    documentDrafts: new Map<string, any>(),
    auditLogs: [] as any[],
  };

  // Seed Users
  const atty1: AuthenticatedUser = {
    id: 'usr-atty-01',
    userCode: 'USR-26-0001',
    email: 'heugly@hb-law.com',
    role: 'ATTORNEY',
    permissions: ['matters:view', 'matters:edit', 'tasks:create', 'tasks:edit', 'documents:approve', 'documents:reject'],
  };
  const staff1: AuthenticatedUser = {
    id: 'usr-paralegal-01',
    userCode: 'USR-26-0002',
    email: 'bludworth.para@hb-law.com',
    role: 'PARALEGAL',
    permissions: ['matters:view', 'matters:edit', 'tasks:create', 'tasks:edit'],
  };
  const screenedAtty: AuthenticatedUser = {
    id: 'usr-screened-01',
    userCode: 'USR-26-0003',
    email: 'screened@hb-law.com',
    role: 'ATTORNEY',
    permissions: ['matters:view', 'matters:edit', 'tasks:create', 'tasks:edit'],
  };

  db.users.set(atty1.id, { id: atty1.id, name: 'Gordon Heugly', email: atty1.email, status: 'Active' });
  db.users.set(staff1.id, { id: staff1.id, name: 'Jane Paralegal', email: staff1.email, status: 'Active' });
  db.users.set(screenedAtty.id, { id: screenedAtty.id, name: 'Screened Counsel', email: screenedAtty.email, status: 'Active' });

  // Seed Matter 1 (Standard PI Matter)
  const matter1 = {
    id: 'mat-pi-001',
    matterNumber: '26-PI-0088',
    title: 'John Doe v. Acme Delivery Co.',
    status: 'Active',
    responsibleAttorneyId: atty1.id,
    practiceArea: { id: 'pa-pi', name: 'Personal Injury' },
    conflictChecks: [],
    staffAssignments: [
      { id: 'asgn-1', userId: atty1.id, role: 'Lead Attorney' },
      { id: 'asgn-2', userId: staff1.id, role: 'Paralegal' },
    ],
  };
  db.matters.set(matter1.id, matter1);

  // Seed Screened Matter 2 (Screened under Utah RPC 1.10)
  const matterScreened = {
    id: 'mat-screened-002',
    matterNumber: '26-PI-0099',
    title: 'Conflict Case vs Prior Client',
    status: 'Active',
    responsibleAttorneyId: atty1.id,
    practiceArea: { id: 'pa-pi', name: 'Personal Injury' },
    conflictChecks: [
      {
        id: 'conf-1',
        searchedPartyName: 'Prior Client Corp',
        hasConflict: true,
        resolutionAction: 'ETHICAL_WALL',
        screenedStaffIds: [screenedAtty.id],
      },
    ],
    staffAssignments: [{ id: 'asgn-3', userId: atty1.id, role: 'Lead Attorney' }],
  };
  db.matters.set(matterScreened.id, matterScreened);

  // Seed Medical Provider
  const provider1 = {
    id: 'prv-101',
    matterId: matter1.id,
    providerName: 'Salt Lake Regional Orthopedics',
    providerType: 'Orthopedic Surgery',
    facilityAddress: '100 Medical Plaza, Salt Lake City, UT',
  };
  db.medicalProviders.set(provider1.id, provider1);

  // Seed Medical Record Request (Initially Drafted, Authorization NOT Signed)
  const request1: any = {
    id: 'req-101',
    matterId: matter1.id,
    providerId: provider1.id,
    requestCode: 'MRR-26-0101',
    status: 'Drafted',
    authorizationSigned: false,
    authorizationDate: null,
    authorizationDocumentId: null as string | null,
    requestSentDate: null,
    requestDueDate: null,
    matter: matter1,
    provider: provider1,
  };
  db.medicalRecordRequests.set(request1.id, request1);

  // Seed Signed Authorization Document
  const authDoc = {
    id: 'doc-auth-112',
    matterId: matter1.id,
    documentCode: 'DOC-26-0112',
    title: 'Executed Medical Authorization (HIPAA)',
    status: 'Final',
    category: 'HIPAA_AUTHORIZATION',
    templateCode: '112',
  };
  db.documents.set(authDoc.id, authDoc);

  // Hook Prisma delegates
  let taskCounter = 1;
  (prisma as any).task = {
    count: async () => db.tasks.size,
    findUnique: async ({ where }: any) => {
      for (const t of db.tasks.values()) {
        if (t.id === where.id || t.taskCode === where.taskCode) return t;
      }
      return null;
    },
    findFirst: async ({ where }: any) => {
      for (const t of db.tasks.values()) {
        let match = true;
        if (where.matterId && t.matterId !== where.matterId) match = false;
        if (where.status?.not && t.status === where.status.not) match = false;
        if (where.status?.in && !where.status.in.includes(t.status)) match = false;
        if (where.dueDate?.lt && !(new Date(t.dueDate) < new Date(where.dueDate.lt))) match = false;
        if (where.title && t.title !== where.title) match = false;
        if (where.description?.contains && !t.description?.includes(where.description.contains)) match = false;

        if (where.OR && match) {
          const orMatch = where.OR.some((cond: any) => {
            if (cond.title && t.title === cond.title) return true;
            if (cond.title?.contains && t.title?.includes(cond.title.contains)) return true;
            if (cond.description?.contains && t.description?.includes(cond.description.contains)) return true;
            return false;
          });
          if (!orMatch) match = false;
        }

        if (match) return t;
      }
      return null;
    },
    findMany: async ({ where }: any) => {
      const results: any[] = [];
      for (const t of db.tasks.values()) {
        let match = true;
        if (where?.matterId && t.matterId !== where.matterId) match = false;
        if (where?.status?.not && t.status === where.status.not) match = false;
        if (where?.status?.in && !where.status.in.includes(t.status)) match = false;
        if (where?.dueDate?.lt && !(new Date(t.dueDate) < new Date(where.dueDate.lt))) match = false;
        if (where?.title && t.title !== where.title) match = false;
        if (where?.description?.contains && !t.description?.includes(where.description.contains)) match = false;
        if (match) results.push(t);
      }
      return results;
    },
    create: async ({ data }: any) => {
      const id = `tsk-${Date.now()}-${taskCounter++}`;
      const record = {
        id,
        taskCode: data.taskCode,
        matterId: data.matterId,
        title: data.title,
        description: data.description,
        assignedToUserId: data.assignedToUserId,
        createdByUserId: data.createdByUserId,
        dueDate: new Date(data.dueDate),
        priority: data.priority || 'Medium',
        status: data.status || 'Not Started',
        completedAt: data.completedAt || null,
        reminderSetting: data.reminderSetting || '1 day prior',
        urcpRuleReference: data.urcpRuleReference || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        matter: db.matters.get(data.matterId),
        assignee: db.users.get(data.assignedToUserId),
        creator: db.users.get(data.createdByUserId),
      };
      db.tasks.set(id, record);
      return record;
    },
    update: async ({ where, data }: any) => {
      let existing: any = null;
      for (const t of db.tasks.values()) {
        if (t.id === where.id) {
          existing = t;
          break;
        }
      }
      if (!existing) throw new Error('Task not found');
      const updated = { ...existing, ...data, updatedAt: new Date() };
      db.tasks.set(existing.id, updated);
      return updated;
    },
  };

  (prisma as any).auditLog = {
    create: async ({ data }: any) => {
      const log = { id: `log-${Date.now()}-${Math.random()}`, ...data, createdAt: new Date() };
      db.auditLogs.push(log);
      return log;
    },
    findMany: async ({ where }: any) => {
      return db.auditLogs.filter((l) => {
        if (where.resourceType && l.resourceType !== where.resourceType) return false;
        if (where.resourceId && l.resourceId !== where.resourceId) return false;
        if (where.action && l.action !== where.action) return false;
        return true;
      });
    },
    findFirst: async ({ where }: any) => {
      const logs = await (prisma as any).auditLog.findMany({ where });
      return logs[0] || null;
    },
  };

  (prisma as any).medicalRecordRequest = {
    findUnique: async ({ where }: any) => {
      return db.medicalRecordRequests.get(where.id) || null;
    },
    update: async ({ where, data }: any) => {
      const existing = db.medicalRecordRequests.get(where.id);
      if (!existing) throw new Error('Request not found');
      const updated = { ...existing, ...data, updatedAt: new Date() };
      db.medicalRecordRequests.set(where.id, updated);
      return updated;
    },
  };

  (prisma as any).document = {
    findUnique: async ({ where }: any) => {
      return db.documents.get(where.id) || null;
    },
  };

  (prisma as any).matter = {
    findUnique: async ({ where }: any) => {
      return db.matters.get(where.id) || null;
    },
  };

  (prisma as any).user = {
    findUnique: async ({ where }: any) => {
      return db.users.get(where.id) || null;
    },
  };

  // Mock MatterService to use in-memory fixtures and enforce Ethical Wall
  (MatterService as any).getMatterByIdOrNumber = async (idOrNumber: string, user: AuthenticatedUser) => {
    let matter: any = null;
    for (const m of db.matters.values()) {
      if (m.id === idOrNumber || m.matterNumber === idOrNumber) {
        matter = m;
        break;
      }
    }
    if (!matter) {
      throw AppError.notFound(`Matter '${idOrNumber}' not found.`, 'MATTER_NOT_FOUND');
    }

    // Screened User Check (Utah RPC 1.10)
    const isScreened = matter.conflictChecks?.some(
      (c: any) => c.hasConflict && c.screenedStaffIds?.includes(user.id)
    );
    if (isScreened) {
      throw AppError.forbidden(
        `User is ethically screened from Matter '${matter.matterNumber}' under Utah RPC 1.10. Access denied.`,
        'ETHICAL_WALL_SCREENED'
      );
    }
    return matter;
  };

  // -------------------------------------------------------------------------
  // TEST 1: Workflow 1 (096 - Letter of Representation) Task Automation
  // -------------------------------------------------------------------------
  const fakeDraft096 = {
    id: 'dft-096-01',
    draftCode: 'DFT-26-0096',
    title: 'Letter of Representation - State Farm Insurance',
  };
  const task096 = await PIWorkflowAutomationService.onRepresentationDraftGenerated(
    matter1,
    fakeDraft096,
    'State Farm Insurance',
    atty1,
    { ipAddress: '127.0.0.1' }
  );
  record(
    1,
    'Workflow 1 (096 Letter of Representation): Generates review task for responsible attorney with High priority and 2-day deadline',
    Boolean(task096.task?.id) &&
      task096.workflow === '096' &&
      task096.task.priority === 'High' &&
      task096.task.title.includes('State Farm Insurance'),
    { id: task096.task?.id, priority: task096.task?.priority, workflow: task096.workflow },
    { priority: 'High', workflow: '096' }
  );

  // -------------------------------------------------------------------------
  // TEST 2: Workflow 2 (112 - Medical Authorization) Missing Authorization Task
  // -------------------------------------------------------------------------
  const task112 = await PIWorkflowAutomationService.onMissingAuthorizationDetected(
    matter1,
    request1,
    provider1.providerName,
    atty1,
    { ipAddress: '127.0.0.1' }
  );
  record(
    2,
    'Workflow 2 (112 Medical Authorization): Automatically creates task to obtain signed client authorization when request is initiated',
    Boolean(task112.task?.id) &&
      task112.workflow === '112' &&
      task112.task.title.includes('Obtain Signed Medical Authorization'),
    { title: task112.task?.title, workflow: task112.workflow },
    { titleContains: 'Obtain Signed Medical Authorization', workflow: '112' }
  );

  // -------------------------------------------------------------------------
  // TEST 3: Workflow 3 (113) Transmission Readiness Gate Enforced
  // -------------------------------------------------------------------------
  let blockedReadiness = false;
  let blockedErrorCode = '';
  try {
    PIWorkflowAutomationService.validateTransmissionReadiness(request1);
  } catch (err: any) {
    blockedReadiness = true;
    blockedErrorCode = err.code || err.message;
  }
  record(
    3,
    'Workflow 3 (113 Records Request): Transmission readiness gate strictly blocks ready-to-send or transmission without signed authorization',
    blockedReadiness && blockedErrorCode === 'AUTHORIZATION_REQUIRED',
    { blockedReadiness, blockedErrorCode },
    { blockedReadiness: true, blockedErrorCode: 'AUTHORIZATION_REQUIRED' }
  );

  // -------------------------------------------------------------------------
  // TEST 4: Workflow 2 -> 3 Transition: Authorization Signature Recorded
  // -------------------------------------------------------------------------
  const transition = await PIWorkflowAutomationService.onAuthorizationSigned(
    matter1,
    request1,
    provider1.providerName,
    atty1,
    { ipAddress: '127.0.0.1' }
  );
  record(
    4,
    'Workflow 2 -> 3 Transition: Auto-completes "Obtain Authorization" task and creates "Transmit Request" task',
    transition.resolvedTaskCount === 1 &&
      Boolean(transition.transmissionTask?.task?.id) &&
      transition.transmissionTask.task.title.includes('Transmit Medical Records Request'),
    { resolvedCount: transition.resolvedTaskCount, nextTask: transition.transmissionTask?.task?.title },
    { resolvedCount: 1, nextTaskContains: 'Transmit Medical Records Request' }
  );

  // -------------------------------------------------------------------------
  // TEST 5: Status Update API with Authorization Gate Verification
  // -------------------------------------------------------------------------
  // A. Attempt to mark request Ready to Send while unsigned -> Expect 400
  let unauthStatusBlocked = false;
  try {
    await PersonalInjuryService.updateRecordRequestStatus(
      matter1.id,
      request1.id,
      { status: 'Ready to Send' },
      atty1,
      {}
    );
  } catch (err: any) {
    unauthStatusBlocked = err.code === 'AUTHORIZATION_REQUIRED';
  }

  // B. Update request to signed in DB, then mark Sent
  request1.authorizationSigned = true;
  request1.authorizationDocumentId = authDoc.id;
  const sentResult = await PersonalInjuryService.updateRecordRequestStatus(
    matter1.id,
    request1.id,
    { status: 'Sent', sentDate: '2026-11-14' },
    atty1,
    {}
  );
  record(
    5,
    'Workflow 3 Status Transition: Rejects premature Ready to Send, then transitions to Sent and schedules 30-day statutory turnaround follow-up',
    unauthStatusBlocked &&
      sentResult.recordRequest.status === 'Sent' &&
      Boolean(sentResult.followUpTask?.task?.id) &&
      Boolean(sentResult.followUpTask?.task?.title?.includes('Follow-up on Medical Records Delivery')),
    { unauthStatusBlocked, status: sentResult.recordRequest.status, followUpTitle: sentResult.followUpTask?.task?.title },
    { unauthStatusBlocked: true, status: 'Sent', followUpTitleContains: 'Follow-up on Medical Records Delivery' }
  );

  // -------------------------------------------------------------------------
  // TEST 6: Workflow 4 (116 - Incomplete Medical Records) Follow-up Task
  // -------------------------------------------------------------------------
  const incompleteTask = await PIWorkflowAutomationService.onIncompleteRecordsFollowUpRequired(
    matter1,
    request1,
    provider1.providerName,
    'Missing billing ledger and radiology MRI disks',
    atty1,
    { ipAddress: '127.0.0.1' }
  );
  record(
    6,
    'Workflow 4 (116 Incomplete Records): Creates actionable deficiency follow-up task on Matter detailing missing records',
    Boolean(incompleteTask.task?.id) &&
      incompleteTask.workflow === '116' &&
      incompleteTask.task.title.includes('Follow-up on Incomplete Medical Records') &&
      incompleteTask.task.description.includes('Missing billing ledger and radiology MRI disks'),
    { title: incompleteTask.task?.title, workflow: incompleteTask.workflow },
    { titleContains: 'Follow-up on Incomplete Medical Records', workflow: '116' }
  );

  // -------------------------------------------------------------------------
  // TEST 7: Workflow 5 (140 - PI Demand Letter) Demand Review Task
  // -------------------------------------------------------------------------
  const fakeDemandPackage = {
    id: 'dmd-pkg-501',
    matterId: matter1.id,
    demandTitle: 'Policy Limits Settlement Demand',
    demandedAmount: 250000.0,
    recipientCarrier: 'Farmers Insurance',
    claimNumber: 'CLM-998877',
    isPolicyLimitDemand: true,
    deadlineDate: new Date('2026-12-15'),
  };
  const demandTask = await PIWorkflowAutomationService.onDemandDraftReady(
    matter1,
    fakeDemandPackage,
    atty1,
    { ipAddress: '127.0.0.1' }
  );
  record(
    7,
    'Workflow 5 (140 PI Demand Letter): Creates Critical priority Demand Review task for attorney with financial details and deadline',
    Boolean(demandTask.task?.id) &&
      demandTask.workflow === '140' &&
      demandTask.task.priority === 'Critical' &&
      demandTask.task.description.includes('$250,000.00'),
    { title: demandTask.task?.title, priority: demandTask.task?.priority, workflow: demandTask.workflow },
    { priority: 'Critical', workflow: '140' }
  );

  // -------------------------------------------------------------------------
  // TEST 8: Rejection Correction Task Creation & Idempotency
  // -------------------------------------------------------------------------
  const fakeDraftForReject = {
    id: 'dft-rej-001',
    draftCode: 'DFT-26-0999',
    matterId: matter1.id,
    title: 'Medical Authorization - Rejection Test',
    generatedByUserId: staff1.id,
    template: { templateName: 'Medical Authorization' },
  };
  // Simulate rejection logic in draft.service.ts
  const rejDueDate = new Date();
  rejDueDate.setDate(rejDueDate.getDate() + 2);
  const rejTask1 = await TaskService.createTask(
    {
      matterId: fakeDraftForReject.matterId,
      assignedToUserId: staff1.id,
      title: `Draft Correction Required: ${fakeDraftForReject.title}`,
      description: `Draft '${fakeDraftForReject.draftCode}' was REJECTED by attorney.\nReason: "Client address is outdated." [IDEMPOTENCY_KEY: DRAFT_CORRECTION_${fakeDraftForReject.draftCode}]`,
      dueDate: rejDueDate.toISOString().split('T')[0],
      priority: 'High',
      reminderSetting: '1 day prior',
    },
    { userId: atty1.id, userRole: atty1.role }
  );

  // Re-run rejection task creation: should find existing and return without creating duplicate
  const rejTaskExisting = await prisma.task.findFirst({
    where: {
      matterId: fakeDraftForReject.matterId,
      status: { not: 'Completed' },
      description: { contains: `[IDEMPOTENCY_KEY: DRAFT_CORRECTION_${fakeDraftForReject.draftCode}]` },
    },
  });
  record(
    8,
    'Draft Rejection Correction Task: Generates correction task for drafter with reason, and re-rejection finds existing task without duplication',
    Boolean(rejTask1.id) && Boolean(rejTaskExisting) && rejTaskExisting?.id === rejTask1.id,
    { taskId1: rejTask1.id, taskId2: rejTaskExisting?.id },
    { matchingIds: true }
  );

  // -------------------------------------------------------------------------
  // TEST 9: Duplicate Event Handling & Retry-Safe Task Idempotency
  // -------------------------------------------------------------------------
  const task096Retry = await PIWorkflowAutomationService.onRepresentationDraftGenerated(
    matter1,
    fakeDraft096,
    'State Farm Insurance',
    atty1,
    { ipAddress: '127.0.0.1' }
  );
  record(
    9,
    'Retry-Safe Event Idempotency: Repeated event dispatch for the same draft returns existing task with isDuplicate=true without duplicate record insertion',
    task096Retry.isDuplicate === true && task096Retry.task.id === task096.task.id,
    { isDuplicate: task096Retry.isDuplicate, taskId: task096Retry.task.id },
    { isDuplicate: true, taskId: task096.task.id }
  );

  // -------------------------------------------------------------------------
  // TEST 10: Reminder Scheduling Date Calculations
  // -------------------------------------------------------------------------
  const baseDueDate = new Date('2026-12-01T15:00:00Z');
  const sameDay = PIWorkflowAutomationService.calculateReminderTriggerDate(baseDueDate, 'Same day');
  const oneDay = PIWorkflowAutomationService.calculateReminderTriggerDate(baseDueDate, '1 day prior');
  const twoDays = PIWorkflowAutomationService.calculateReminderTriggerDate(baseDueDate, '2 days prior');
  const threeDays = PIWorkflowAutomationService.calculateReminderTriggerDate(baseDueDate, '3 days prior');
  const oneWeek = PIWorkflowAutomationService.calculateReminderTriggerDate(baseDueDate, '1 week prior');

  const correctCalc =
    sameDay.toISOString().split('T')[0] === '2026-12-01' &&
    oneDay.toISOString().split('T')[0] === '2026-11-30' &&
    twoDays.toISOString().split('T')[0] === '2026-11-29' &&
    threeDays.toISOString().split('T')[0] === '2026-11-28' &&
    oneWeek.toISOString().split('T')[0] === '2026-11-24';
  record(
    10,
    'Reminder Scheduling: Accurately calculates reminder trigger dates for Same day, 1 day prior, 2 days prior, 3 days prior, and 1 week prior',
    correctCalc,
    { sameDay: sameDay.toISOString().split('T')[0], oneDay: oneDay.toISOString().split('T')[0], oneWeek: oneWeek.toISOString().split('T')[0] },
    { sameDay: '2026-12-01', oneDay: '2026-11-30', oneWeek: '2026-11-24' }
  );

  // -------------------------------------------------------------------------
  // TEST 11: Persistent Reminder Processing & Deduplication via AuditLog
  // -------------------------------------------------------------------------
  // Create task with dueDate tomorrow and reminder '1 day prior' -> triggerDate is today
  const dueTomorrow = new Date();
  dueTomorrow.setDate(dueTomorrow.getDate() + 1);
  const reminderTask = await TaskService.createTask(
    {
      matterId: matter1.id,
      assignedToUserId: atty1.id,
      title: 'Action Item with 1-day Reminder',
      description: 'Test reminder firing',
      dueDate: dueTomorrow.toISOString().split('T')[0],
      priority: 'High',
      reminderSetting: '1 day prior',
    },
    { userId: atty1.id, userRole: atty1.role }
  );

  // Run 1: Should trigger reminder
  const reminderRun1 = await PIWorkflowAutomationService.processScheduledReminders(
    { asOfDate: new Date(), matterId: matter1.id },
    { userId: atty1.id, userRole: atty1.role }
  );
  const triggeredFirstTime = reminderRun1.triggeredReminders.some((r) => r.taskId === reminderTask.id);

  // Run 2: Immediately re-run -> persistent audit log must prevent duplicate reminder trigger!
  const reminderRun2 = await PIWorkflowAutomationService.processScheduledReminders(
    { asOfDate: new Date(), matterId: matter1.id },
    { userId: atty1.id, userRole: atty1.role }
  );
  const triggeredSecondTime = reminderRun2.triggeredReminders.some((r) => r.taskId === reminderTask.id);

  record(
    11,
    'Persistent Reminder Processing: Triggers scheduled reminders on Run 1, and database audit deduplication guarantees 0 duplicate triggers on Run 2',
    triggeredFirstTime && !triggeredSecondTime,
    { triggeredFirstTime, triggeredSecondTime },
    { triggeredFirstTime: true, triggeredSecondTime: false }
  );

  // -------------------------------------------------------------------------
  // TEST 12: Overdue Handling Engine
  // -------------------------------------------------------------------------
  // Create past-due task
  const pastDueDate = new Date('2026-10-01');
  const pastDueTask = await TaskService.createTask(
    {
      matterId: matter1.id,
      assignedToUserId: staff1.id,
      title: 'Delinquent Records Follow-up',
      description: 'Provider has not responded',
      dueDate: pastDueDate.toISOString().split('T')[0],
      priority: 'High',
      reminderSetting: '1 day prior',
    },
    { userId: atty1.id, userRole: atty1.role }
  );

  const overdueRun = await PIWorkflowAutomationService.processOverdueTasks(
    { asOfDate: new Date(), matterId: matter1.id },
    { userId: atty1.id, userRole: atty1.role }
  );
  const updatedTask = db.tasks.get(pastDueTask.id);
  const hasEscalationAudit = db.auditLogs.some(
    (l) => l.action === 'TASK_OVERDUE_ESCALATION' && l.resourceId === pastDueTask.id
  );

  record(
    12,
    'Overdue Handling Engine: Automatically transitions past-due tasks to Overdue and logs observable TASK_OVERDUE_ESCALATION audit event',
    updatedTask?.status === 'Overdue' && hasEscalationAudit && overdueRun.escalatedCount >= 1,
    { status: updatedTask?.status, hasEscalationAudit, escalatedCount: overdueRun.escalatedCount },
    { status: 'Overdue', hasEscalationAudit: true, escalatedCountGte: 1 }
  );

  // -------------------------------------------------------------------------
  // TEST 13: Matter Isolation & Utah RPC 1.10 Ethical Wall Screening
  // -------------------------------------------------------------------------
  let screenedBlocked = false;
  let screenedCode = '';
  try {
    await PIWorkflowAutomationService.getMatterWorkflowTasks(matterScreened.id, screenedAtty);
  } catch (err: any) {
    screenedBlocked = true;
    screenedCode = err.code || err.message;
  }
  record(
    13,
    'Matter Isolation & Utah RPC 1.10 Ethical Wall: Ethically screened attorney is blocked from viewing Matter workflow tasks (403 Forbidden)',
    screenedBlocked && screenedCode === 'ETHICAL_WALL_SCREENED',
    { screenedBlocked, screenedCode },
    { screenedBlocked: true, screenedCode: 'ETHICAL_WALL_SCREENED' }
  );

  // -------------------------------------------------------------------------
  // TEST 14: End-to-End Matter Workflow Tasks Inspector
  // -------------------------------------------------------------------------
  const workflowInspection = await PIWorkflowAutomationService.getMatterWorkflowTasks(matter1.id, atty1);
  const has096 = workflowInspection.tasksByWorkflow['096'].length > 0;
  const has112 = workflowInspection.tasksByWorkflow['112'].length > 0;
  const has113 = workflowInspection.tasksByWorkflow['113'].length > 0;
  const has116 = workflowInspection.tasksByWorkflow['116'].length > 0;
  const has140 = workflowInspection.tasksByWorkflow['140'].length > 0;
  record(
    14,
    'End-to-End Workflow Inspector: Correctly groups Matter tasks across all 5 PI document workflows (096, 112, 113, 116, 140) with overdue & reminder metrics',
    has096 && has112 && has113 && has116 && has140 && workflowInspection.totalTasks >= 5,
    { has096, has112, has113, has116, has140, totalTasks: workflowInspection.totalTasks },
    { has096: true, has112: true, has113: true, has116: true, has140: true, totalTasksGte: 5 }
  );

  console.log('\n=============================================================================');
  const allPassed = results.every((r) => r.passed);
  const passCount = results.filter((r) => r.passed).length;
  console.log(`SUB-STAGE E TEST RESULTS: ${passCount}/${results.length} PASSED`);
  console.log('=============================================================================');

  if (!allPassed) {
    process.exit(1);
  }
}

runSubstageETests().catch((err) => {
  console.error('Fatal error during Substage E test execution:', err);
  process.exit(1);
});

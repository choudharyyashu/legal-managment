/**
 * TASK-04 Automated Verification Suite:
 * Intake Conversion, Client Isolation, Conflict Checking & Related Parties
 *
 * Strictly isolated: mocks Prisma delegates in memory (zero live DB reads or writes).
 */
import assert from 'node:assert/strict';
import { prisma } from '../config/database.js';
import { IntakeService } from '../modules/intakes/intake.service.js';
import { ClientService } from '../modules/clients/client.service.js';
import { MatterService } from '../modules/matters/matter.service.js';
import { RelatedPartyService } from '../modules/related-parties/related-party.service.js';
import { UserService } from '../modules/users/user.service.js';
import { normalizePracticeAreaId } from '../utils/practiceAreaCanonical.js';

interface TestCase {
  name: string;
  fn: () => Promise<void> | void;
}

const tests: TestCase[] = [];
function it(name: string, fn: () => Promise<void> | void) {
  tests.push({ name, fn });
}

function createInMemoryPrismaMock() {
  let seq = 1;
  const uid = (prefix: string) => {
    const hex = String(seq++).padStart(12, '0');
    return `11111111-1111-4111-8111-${hex}`;
  };

  const practiceAreas = [
    { id: 'pa-civ', name: 'Civil/Commercial Litigation', code: 'CIV', brandColor: '#06244B' },
    { id: 'pa-fam', name: 'Family Law', code: 'FAM', brandColor: '#A4432B' },
    { id: 'pa-pi', name: 'Personal Injury', code: 'PI', brandColor: '#B42318' },
    { id: 'pa-bk', name: 'Bankruptcy', code: 'BK', brandColor: '#0284c7' },
    { id: 'pa-imm', name: 'Immigration', code: 'IMM', brandColor: '#059669' },
  ];

  const users = [
    {
      id: '22222222-2222-4222-8222-000000000001',
      userCode: 'USR-001',
      name: 'Eleanor Heugly, Esq.',
      email: 'eheugly@firm.test',
      role: 'attorney',
      title: 'Managing Partner',
      initials: 'EH',
      department: 'Litigation',
      status: 'Active',
    },
    {
      id: '22222222-2222-4222-8222-000000000002',
      userCode: 'USR-002',
      name: 'Alex Paralegal',
      email: 'alex@firm.test',
      role: 'paralegal',
      title: 'Senior Paralegal',
      initials: 'AP',
      department: 'Personal Injury',
      status: 'Active',
    },
  ];

  const clients: any[] = [];
  const intakes: any[] = [];
  const matters: any[] = [];
  const staffAssignments: any[] = [];
  const relatedParties: any[] = [];
  const conflictSearchLogs: any[] = [];
  const auditLogs: any[] = [];
  const communications: any[] = [];
  const documents: any[] = [];
  const invoices: any[] = [];
  const trustSubLedgers: any[] = [];
  const overviewPanels: any[] = [];
  const incidentParties: any[] = [
    {
      id: 'pip-1',
      fullName: 'Ronald Miller',
      partyType: 'At-Fault Driver',
      phone: '(801) 555-0199',
      insuranceCarrier: 'Mountain West Casualty',
      incidentId: 'inc-1',
      incident: { matterId: 'mat-existing-pi' },
    },
  ];
  const immigrationParties: any[] = [
    {
      id: 'imp-1',
      name: 'Carlos Mendez',
      relationshipRole: 'Petitioner',
      email: 'cmendez@imm.test',
      phone: '8015557700',
      immigrationCaseId: 'imm-case-1',
      immigrationCase: { matterId: 'mat-existing-imm' },
    },
  ];
  const bankruptcyCreditors: any[] = [
    {
      id: 'bkc-1',
      creditorName: 'Wasatch Credit Union',
      claimType: 'Secured',
      accountNumber: '4490',
      bankruptcyCaseId: 'bk-case-1',
      bankruptcyCase: { matterId: 'mat-existing-bk' },
    },
  ];

  const state = {
    simulateRelatedPartiesMissing: false,
    simulateOverviewPanelsMissing: false,
    clients,
    intakes,
    matters,
    relatedParties,
    conflictSearchLogs,
    auditLogs,
    communications,
    documents,
    invoices,
    trustSubLedgers,
  };

  const attachClientRelations = (c: any) => ({
    ...c,
    assignedAttorney: users.find((u) => u.id === c.assignedAttorneyId) || null,
    _count: { matters: matters.filter((m) => m.clientId === c.id).length },
  });

  const attachIntakeRelations = (i: any) => ({
    ...i,
    practiceArea: practiceAreas.find((p) => p.id === i.practiceAreaId) || null,
    reviewedByUser: users.find((u) => u.id === i.reviewedByUserId) || null,
    convertedClient: clients.find((c) => c.id === i.convertedClientId) || null,
    convertedMatter: matters.find((m) => m.id === i.convertedMatterId) || null,
  });

  const attachMatterRelations = (m: any) => ({
    ...m,
    client: clients.find((c) => c.id === m.clientId) || null,
    practiceArea: practiceAreas.find((p) => p.id === m.practiceAreaId) || null,
    responsibleAttorney: users.find((u) => u.id === m.responsibleAttorneyId) || null,
    staffAssignments: staffAssignments
      .filter((sa) => sa.matterId === m.id)
      .map((sa) => ({ ...sa, user: users.find((u) => u.id === sa.userId) || null })),
    _count: {
      tasks: 0,
      documents: documents.filter((d) => d.matterId === m.id).length,
      timeEntries: 0,
    },
  });

  const mock = {
    $transaction: async (fn: any) => fn(mock),
    practiceArea: {
      findUnique: async ({ where }: any) => practiceAreas.find((p) => p.id === where.id) || null,
    },
    user: {
      findUnique: async ({ where }: any) => users.find((u) => u.id === where.id) || null,
      findMany: async () => users,
    },
    client: {
      count: async () => clients.length,
      findFirst: async ({ where }: any) => {
        if (where?.id) return attachClientRelations(clients.find((c) => c.id === where.id));
        if (where?.clientNumber && typeof where.clientNumber === 'string') {
          const hit = clients.find((c) => c.clientNumber === where.clientNumber);
          return hit ? attachClientRelations(hit) : null;
        }
        const sorted = [...clients].reverse();
        return sorted[0] ? attachClientRelations(sorted[0]) : null;
      },
      findUnique: async ({ where }: any) => {
        const hit = clients.find((c) => c.id === where.id || c.clientNumber === where.clientNumber || (where.email && c.email === where.email));
        return hit ? attachClientRelations(hit) : null;
      },
      findMany: async ({ where }: any) => {
        return clients
          .filter((c) => !where?.id?.not || c.id !== where.id.not)
          .map(attachClientRelations);
      },
      create: async ({ data }: any) => {
        const rec = {
          id: uid('cli'),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        clients.push(rec);
        return attachClientRelations(rec);
      },
      update: async ({ where, data }: any) => {
        const rec = clients.find((c) => c.id === where.id);
        Object.assign(rec, data, { updatedAt: new Date() });
        return attachClientRelations(rec);
      },
    },
    intake: {
      count: async () => intakes.length,
      findUnique: async ({ where }: any) => {
        const hit = intakes.find((i) => i.id === where.id || i.intakeNumber === where.intakeNumber);
        return hit ? attachIntakeRelations(hit) : null;
      },
      findFirst: async ({ where }: any) => {
        const orList = where?.OR || [];
        const hit = intakes.find((i) =>
          orList.some((cond: any) => (cond.id && i.id === cond.id) || (cond.intakeNumber && i.intakeNumber === cond.intakeNumber))
        );
        return hit ? attachIntakeRelations(hit) : null;
      },
      findMany: async ({ where }: any) => {
        return intakes
          .filter((i) => {
            if (where?.convertedClientId && i.convertedClientId !== where.convertedClientId) return false;
            if (where?.id?.not && i.id === where.id.not) return false;
            return true;
          })
          .map(attachIntakeRelations);
      },
      create: async ({ data }: any) => {
        const rec = {
          id: uid('int'),
          convertedToClient: false,
          convertedClientId: null,
          convertedMatterId: null,
          reviewedByUserId: null,
          reviewedAt: null,
          conflictNotes: null,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        intakes.push(rec);
        return attachIntakeRelations(rec);
      },
      update: async ({ where, data }: any) => {
        const rec = intakes.find((i) => i.id === where.id);
        Object.assign(rec, data, { updatedAt: new Date() });
        return attachIntakeRelations(rec);
      },
    },
    matter: {
      count: async () => matters.length,
      findUnique: async ({ where }: any) => {
        const hit = matters.find((m) => m.id === where.id || m.matterNumber === where.matterNumber);
        return hit ? attachMatterRelations(hit) : null;
      },
      findFirst: async ({ where }: any) => {
        if (where?.id) {
          const hit = matters.find((m) => m.id === where.id);
          return hit ? attachMatterRelations(hit) : null;
        }
        if (where?.matterNumber && typeof where.matterNumber === 'string') {
          const hit = matters.find((m) => m.matterNumber === where.matterNumber);
          return hit ? attachMatterRelations(hit) : null;
        }
        if (where?.OR) {
          const hit = matters.find((m) =>
            where.OR.some((c: any) => (c.id && m.id === c.id) || (c.matterNumber && m.matterNumber === c.matterNumber))
          );
          return hit ? attachMatterRelations(hit) : null;
        }
        return null;
      },
      findMany: async ({ where }: any) => {
        return matters
          .filter((m) => {
            if (where?.clientId && m.clientId !== where.clientId) return false;
            if (where?.practiceAreaId && m.practiceAreaId !== where.practiceAreaId) return false;
            if (where?.id?.not && m.id === where.id.not) return false;
            return true;
          })
          .map(attachMatterRelations);
      },
      create: async ({ data }: any) => {
        const rec = {
          id: uid('mat'),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        matters.push(rec);
        return attachMatterRelations(rec);
      },
      update: async ({ where, data }: any) => {
        const rec = matters.find((m) => m.id === where.id);
        Object.assign(rec, data, { updatedAt: new Date() });
        return attachMatterRelations(rec);
      },
    },
    matterStaffAssignment: {
      create: async ({ data }: any) => {
        const rec = { id: uid('msa'), assignedAt: new Date(), ...data };
        staffAssignments.push(rec);
        return rec;
      },
    },
    matterOverviewPanels: {
      findUnique: async ({ where }: any) => {
        if (state.simulateOverviewPanelsMissing) {
          const err: any = new Error("Table 'matter_overview_panels' doesn't exist");
          err.code = 'P2021';
          throw err;
        }
        return overviewPanels.find((p) => p.matterId === where.matterId) || null;
      },
      upsert: async ({ where, update, create }: any) => {
        if (state.simulateOverviewPanelsMissing) {
          const err: any = new Error("Table 'matter_overview_panels' doesn't exist");
          err.code = 'P2021';
          throw err;
        }
        const existing = overviewPanels.find((p) => p.matterId === where.matterId);
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return existing;
        }
        const rec = { id: uid('mop'), ...create, createdAt: new Date(), updatedAt: new Date() };
        overviewPanels.push(rec);
        return rec;
      },
    },
    relatedParty: {
      findUnique: async ({ where }: any) => {
        if (state.simulateRelatedPartiesMissing) {
          const err: any = new Error("Table 'related_parties' doesn't exist");
          err.code = 'P2021';
          throw err;
        }
        return relatedParties.find((rp) => rp.id === where.id) || null;
      },
      findMany: async ({ where }: any) => {
        if (state.simulateRelatedPartiesMissing) {
          const err: any = new Error("Table 'related_parties' doesn't exist");
          err.code = 'P2021';
          throw err;
        }
        return relatedParties
          .filter((rp) => {
            if (where?.matterId && rp.matterId !== where.matterId) return false;
            if (where?.clientId && rp.clientId !== where.clientId) return false;
            if (where?.intakeId && rp.intakeId !== where.intakeId) return false;
            if (where?.AND) {
              // Respect ClientService.getClient360 client+matter isolation filter
              const orConds = where.AND[0]?.OR || [];
              const matchesOr = orConds.some((c: any) => {
                if (c.clientId && rp.clientId === c.clientId) return true;
                if (c.matterId?.in && c.matterId.in.includes(rp.matterId)) return true;
                return false;
              });
              if (!matchesOr) return false;
            }
            return true;
          })
          .map((rp) => ({
            ...rp,
            matter: matters.find((m) => m.id === rp.matterId) || null,
            client: clients.find((c) => c.id === rp.clientId) || null,
          }));
      },
      create: async ({ data }: any) => {
        if (state.simulateRelatedPartiesMissing) {
          const err: any = new Error("Table 'related_parties' doesn't exist");
          err.code = 'P2021';
          throw err;
        }
        const rec = { id: uid('rp'), ...data, createdAt: new Date(), updatedAt: new Date() };
        relatedParties.push(rec);
        return {
          ...rec,
          matter: matters.find((m) => m.id === rec.matterId) || null,
          client: clients.find((c) => c.id === rec.clientId) || null,
        };
      },
      update: async ({ where, data }: any) => {
        const rec = relatedParties.find((rp) => rp.id === where.id);
        Object.assign(rec, data, { updatedAt: new Date() });
        return {
          ...rec,
          matter: matters.find((m) => m.id === rec.matterId) || null,
          client: clients.find((c) => c.id === rec.clientId) || null,
        };
      },
      delete: async ({ where }: any) => {
        const idx = relatedParties.findIndex((rp) => rp.id === where.id);
        if (idx >= 0) relatedParties.splice(idx, 1);
        return { id: where.id };
      },
    },
    conflictSearchLog: {
      create: async ({ data }: any) => {
        const rec = { id: uid('csl'), searchedAt: new Date(), ...data };
        conflictSearchLogs.push(rec);
        return rec;
      },
      findMany: async ({ where }: any) =>
        conflictSearchLogs
          .filter((l) => !where?.intakeId || l.intakeId === where.intakeId)
          .map((l) => ({ ...l, searchedByUser: users.find((u) => u.id === l.searchedByUserId) || null })),
    },
    incident: {
      findFirst: async () => null,
      create: async ({ data }: any) => ({ id: uid('inc'), ...data, createdAt: new Date(), updatedAt: new Date() }),
      update: async ({ where, data }: any) => ({ id: where.id, ...data }),
    },
    insurancePolicy: {
      create: async ({ data }: any) => ({ id: uid('pol'), ...data, createdAt: new Date(), updatedAt: new Date() }),
    },
    documentTemplate: {
      findFirst: async () => null,
      findMany: async () => [],
    },
    documentDraft: {
      findFirst: async () => null,
      findMany: async () => [],
      create: async ({ data }: any) => ({ id: uid('drf'), ...data }),
    },
    task: {
      count: async () => 0,
      findFirst: async () => null,
      findUnique: async () => null,
      create: async ({ data }: any) => ({ id: uid('tsk'), taskCode: `TSK-${seq}`, ...data }),
    },
    incidentParty: {
      findMany: async () => incidentParties,
    },
    immigrationParty: {
      findMany: async () => immigrationParties,
    },
    bankruptcyCreditor: {
      findMany: async () => bankruptcyCreditors,
    },
    communication: {
      findMany: async ({ where }: any) => {
        return communications.filter((c) => {
          const orConds = where?.AND?.[0]?.OR || [];
          const hitOr = orConds.length === 0 || orConds.some((cond: any) =>
            (cond.clientId && c.clientId === cond.clientId) ||
            (cond.matterId?.in && cond.matterId.in.includes(c.matterId))
          );
          if (!hitOr) return false;
          const excl = where?.AND?.[1]?.OR;
          if (excl) {
            const excludedIds = excl.find((x: any) => x.matterId?.notIn)?.matterId?.notIn || [];
            if (c.matterId && excludedIds.includes(c.matterId)) return false;
          }
          return true;
        });
      },
    },
    document: {
      findMany: async ({ where }: any) => {
        return documents.filter((d) => {
          const orConds = where?.AND?.[0]?.OR || [];
          const hitOr = orConds.length === 0 || orConds.some((cond: any) =>
            (cond.clientId && d.clientId === cond.clientId) ||
            (cond.matterId?.in && cond.matterId.in.includes(d.matterId))
          );
          if (!hitOr) return false;
          const excl = where?.AND?.[1]?.matterId?.notIn;
          if (excl && excl.includes(d.matterId)) return false;
          return true;
        });
      },
    },
    invoice: {
      findMany: async ({ where }: any) => {
        return invoices.filter((inv) => {
          if (where?.clientId && inv.clientId !== where.clientId) return false;
          if (where?.matterId?.notIn && where.matterId.notIn.includes(inv.matterId)) return false;
          return true;
        });
      },
    },
    trustSubLedger: {
      findMany: async ({ where }: any) => {
        return trustSubLedgers.filter((l) => {
          if (where?.clientId && l.clientId !== where.clientId) return false;
          if (where?.matterId?.notIn && where.matterId.notIn.includes(l.matterId)) return false;
          return true;
        });
      },
    },
    auditLog: {
      create: async ({ data }: any) => {
        const rec = { id: uid('aud'), timestamp: new Date(), ...data };
        auditLogs.push(rec);
        return rec;
      },
      findMany: async ({ where }: any) => {
        return auditLogs.filter((a) => {
          if (where?.resourceId && a.resourceId !== where.resourceId) return false;
          if (where?.action?.in && !where.action.in.includes(a.action)) return false;
          return true;
        });
      },
    },
  };

  Object.assign(prisma, mock);
  return state;
}

const attorneyCtx = {
  userId: '22222222-2222-4222-8222-000000000001',
  userName: 'Eleanor Heugly, Esq.',
  userRole: 'attorney',
  ipAddress: '127.0.0.1',
  userAgent: 'Task04TestSuite/1.0',
};

const paralegalUser = {
  id: '22222222-2222-4222-8222-000000000002',
  userCode: 'USR-002',
  email: 'alex@firm.test',
  role: 'paralegal',
  permissions: [],
};

// -----------------------------------------------------------------------------
// TESTS
// -----------------------------------------------------------------------------
it('Normalizes canonical & legacy practice area IDs uniformly', () => {
  assert.equal(normalizePracticeAreaId('pa-lit'), 'pa-civ');
  assert.equal(normalizePracticeAreaId('pa-1'), 'pa-civ');
  assert.equal(normalizePracticeAreaId('pa-bankruptcy'), 'pa-bk');
  assert.equal(normalizePracticeAreaId('pa-immigration'), 'pa-imm');
  assert.equal(normalizePracticeAreaId('pa-7'), 'pa-pi');
  assert.equal(normalizePracticeAreaId('pa-pi'), 'pa-pi');
});

it('User directory returns active staff without requiring admin-only users:view permission', async () => {
  createInMemoryPrismaMock();
  const dir = await UserService.getDirectory();
  assert.equal(dir.length, 2);
  assert.equal(dir[0].name, 'Eleanor Heugly, Esq.');
});

it('Intake creation scans without auto-clearing & blocks conversion until human review', async () => {
  createInMemoryPrismaMock();

  const intake = await IntakeService.createIntake(
    {
      prospectiveClient: 'Jordan Taylor',
      contactPerson: 'Jordan Taylor',
      email: 'jordan.t@example.org',
      phone: '(801) 555-3210',
      practiceAreaId: 'pa-pi',
      adverseParties: 'Acme Logistics LLC',
      matterSummary:
        'Highway collision on I-15.\n\n[PI_INTAKE_DATA:{"accidentDate":"2026-10-01","accidentType":"Auto Collision","atFaultInsurer":"SafeGuard Mutual"}]',
      disputeAmount: 85000,
    },
    attorneyCtx
  );

  // Zero hits should stay 'In Review', NEVER auto-cleared!
  assert.equal(intake.practiceAreaId, 'pa-pi');
  assert.equal(intake.conflictStatus, 'In Review');
  assert.equal(intake.reviewedByUserId, null);

  await assert.rejects(
    () => IntakeService.convertToClient(intake.id, { clientType: 'Individual' }, attorneyCtx),
    (err: any) => err.code === 'CONFLICT_NOT_CLEARED'
  );
});

it('Full Intake -> Conflict Review -> Client -> Matter conversion preserves relationships & blocks duplicates', async () => {
  const state = createInMemoryPrismaMock();

  const intake = await IntakeService.createIntake(
    {
      prospectiveClient: 'Jordan Taylor',
      contactPerson: 'Jordan Taylor',
      email: 'jordan.t@example.org',
      phone: '(801) 555-3210',
      practiceAreaId: 'pa-7', // Legacy PI ID should canonicalize to pa-pi
      adverseParties: 'Apex Transit Inc., SafeGuard Insurance',
      matterSummary: 'Rear-end commercial collision.\n\n[PI_INTAKE_DATA:{"accidentDate":"2026-09-12","atFaultInsurer":"SafeGuard Mutual"}]',
      disputeAmount: 100000,
    },
    attorneyCtx
  );
  assert.equal(intake.practiceAreaId, 'pa-pi');

  // Explicit reviewer clearance
  const reviewed = await IntakeService.clearConflict(
    intake.id,
    { status: 'Review Completed', notes: 'Checked all rosters; zero conflicting representations.' },
    attorneyCtx
  );
  assert.equal(reviewed.conflictStatus, 'Review Completed');
  assert.equal(reviewed.reviewedByUserId, attorneyCtx.userId);

  // Convert to Client
  const clientRes = await IntakeService.convertToClient(
    intake.id,
    { clientType: 'Individual', assignedAttorneyId: attorneyCtx.userId },
    attorneyCtx
  );
  assert.equal(clientRes.intake.convertedToClient, true);
  assert.equal(clientRes.intake.convertedClientId, clientRes.client.id);
  assert.ok(!clientRes.client.notes.includes('[PI_INTAKE_DATA:'), 'Client notes must strip raw PI JSON tag');

  // Reject duplicate client conversion (409)
  await assert.rejects(
    () => IntakeService.convertToClient(intake.id, { clientType: 'Individual' }, attorneyCtx),
    (err: any) => err.statusCode === 409 && err.code === 'ALREADY_CONVERTED'
  );

  // Convert to Matter
  const matterRes = await IntakeService.convertToMatter(
    intake.id,
    {
      clientId: clientRes.client.id,
      responsibleAttorneyId: attorneyCtx.userId,
      billingType: 'Contingency',
      contingencyPercentage: 33.33,
      title: 'Jordan Taylor v. Apex Transit Inc.',
    },
    attorneyCtx
  );
  assert.equal(matterRes.matter.practiceAreaId, 'pa-pi');
  assert.equal(matterRes.matter.clientId, clientRes.client.id);
  assert.ok(!matterRes.matter.description.includes('[PI_INTAKE_DATA:'), 'Matter description must strip raw PI JSON tag');
  assert.equal(matterRes.intake.convertedMatterId, matterRes.matter.id);

  // Verify initial RelatedParty records were seeded from adverseParties + PI insurer
  assert.ok(state.relatedParties.length >= 2, 'Should seed opposing party and insurer into related_parties');
  assert.ok(state.relatedParties.some((rp) => rp.matterId === matterRes.matter.id && rp.clientId === clientRes.client.id));

  // Reject duplicate matter conversion (409)
  await assert.rejects(
    () =>
      IntakeService.convertToMatter(
        intake.id,
        {
          clientId: clientRes.client.id,
          responsibleAttorneyId: attorneyCtx.userId,
          billingType: 'Contingency',
          contingencyPercentage: 33.33,
        },
        attorneyCtx
      ),
    (err: any) => err.statusCode === 409 && err.code === 'ALREADY_CONVERTED'
  );
});

it('Conflict engine matches normalized parentheticals, formatted phones, emails, PI/Imm/BK parties & RelatedParties', async () => {
  const state = createInMemoryPrismaMock();

  // Seed existing related party on another matter
  state.relatedParties.push({
    id: 'rp-seed-1',
    matterId: 'mat-other',
    clientId: 'cli-other',
    name: 'Desert Fleet Carriers Inc.',
    aliases: 'Desert Fleet',
    roleId: 'opposing_party',
    roleLabel: 'Opposing Party',
    email: 'claims@desertfleet.test',
    phone: '8015559988',
  });

  // Match against PIIncidentParty ("Ronald Miller" + parenthetical "(Driver)" and phone "801-555-0199")
  const scanPi = await RelatedPartyService.scanConflicts({
    names: ['Ronald Miller (Driver)', 'Nonexistent Person'],
    phones: ['801-555-0199'],
  });
  assert.equal(scanPi.hasConflicts, true);
  assert.ok(scanPi.matches.some((m) => m.entityType === 'PIIncidentParty' && m.displayName === 'Ronald Miller'));

  // Match against RelatedParty alias/email
  const scanRp = await RelatedPartyService.scanConflicts({
    rawQuery: 'claims@desertfleet.test',
  });
  assert.equal(scanRp.hasConflicts, true);
  assert.ok(scanRp.matches.some((m) => m.entityType === 'RelatedParty' && m.matchedField === 'email'));

  // Match against ImmigrationParty & BankruptcyCreditor
  const scanMulti = await RelatedPartyService.scanConflicts({
    names: ['Carlos Mendez', 'Wasatch Credit Union'],
  });
  assert.ok(scanMulti.matches.some((m) => m.entityType === 'ImmigrationParty'));
  assert.ok(scanMulti.matches.some((m) => m.entityType === 'BankruptcyCreditor'));

  // Creating an intake referencing an adverse party with normalized phone triggers Conflict Identified
  const conflictingIntake = await IntakeService.createIntake(
    {
      prospectiveClient: 'Morgan Ellis',
      email: 'mellis@example.org',
      phone: '801-555-0199', // Matches PIIncidentParty phone despite punctuation difference
      practiceAreaId: 'pa-civ',
      adverseParties: 'Ronald Miller (At-Fault Driver)',
      matterSummary: 'Dispute involving Ronald Miller.',
      disputeAmount: 0,
    },
    attorneyCtx
  );
  assert.equal(conflictingIntake.conflictStatus, 'Conflict Identified');

  const logs = await IntakeService.getConflictLogs(conflictingIntake.id);
  assert.ok(logs.searchLogs.length >= 1);
  assert.ok(logs.auditTrail.length >= 1);
  assert.ok(logs.liveMatches.length >= 1);
});

it('Strict Client 360 isolation prevents cross-client leakage even for identical client names (PI T01/T06, CM01)', async () => {
  const state = createInMemoryPrismaMock();

  const clientA = await ClientService.createClient(
    { name: 'Jordan Taylor', type: 'Individual', email: 'jtaylor1@example.org', phone: '801-555-1111' } as any,
    attorneyCtx as any
  );
  const clientB = await ClientService.createClient(
    { name: 'Jordan Taylor', type: 'Individual', email: 'jtaylor2@example.org', phone: '801-555-2222' } as any,
    attorneyCtx as any
  );

  const matterA = await MatterService.createMatter(
    {
      title: 'Jordan Taylor v. Insured Carrier',
      clientId: clientA.id,
      practiceAreaId: 'pa-pi',
      responsibleAttorneyId: attorneyCtx.userId,
      billingType: 'Contingency',
      contingencyPercentage: 33.33,
      budget: 50000,
      status: 'Active',
      assignedStaffRole: 'paralegal',
      isEthicalWallEnabled: true,
      ethicalWallExcludedRole: 'paralegal',
    } as any,
    attorneyCtx as any
  );

  state.invoices.push({
    id: 'inv-a',
    invoiceNumber: 'INV-1001',
    clientId: clientA.id,
    matterId: matterA.id,
    issueDate: new Date(),
    dueDate: new Date(),
    totalAmount: 15390,
    paidAmount: 5000,
    balanceDue: 10390,
    status: 'Sent',
  });
  state.trustSubLedgers.push({
    id: 'tr-a',
    ledgerCode: 'TR-A',
    clientId: clientA.id,
    matterId: matterA.id,
    balance: 25000,
    lastAuditDate: new Date(),
    transactions: [
      {
        id: 'tx-1',
        transactionType: 'Deposit',
        amount: 25000,
        runningBalance: 25000,
        sourceReference: 'WIRE-1',
        purpose: 'Retainer',
        createdAt: new Date(),
      },
    ],
  });
  state.communications.push({
    id: 'comm-a',
    clientId: clientA.id,
    matterId: matterA.id,
    type: 'Email',
    subject: 'Confidential Update for Client A',
    sender: 'attorney@firm.test',
    recipient: 'jtaylor1@example.org',
    summary: 'Private update',
    direction: 'OUTBOUND',
    date: new Date(),
    status: 'Filed',
  });
  state.documents.push({
    id: 'doc-a',
    documentCode: 'DOC-A1',
    clientId: clientA.id,
    matterId: matterA.id,
    title: 'Client A Demand.pdf',
    category: 'Demand',
    currentVersion: 'v1.0',
    isPrivileged: true,
    versions: [],
    createdAt: new Date(),
  });
  state.relatedParties.push({
    id: 'rp-a',
    matterId: matterA.id,
    clientId: clientA.id,
    name: 'Client A Insurer',
    roleId: 'insurer',
    roleLabel: 'Insurance Carrier / Adjuster',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Client A sees all own data when authorized attorney views
  const resA = await ClientService.getClient360(clientA.id, {
    id: attorneyCtx.userId,
    userCode: 'USR-001',
    email: 'eheugly@firm.test',
    role: 'attorney',
    permissions: [],
  });
  assert.equal(resA.financialSummary.totalBilled, 15390);
  assert.equal(resA.financialSummary.trustBalance, 25000);
  assert.equal(resA.communications.length, 1);
  assert.equal(resA.documents.length, 1);
  assert.equal(resA.relatedParties.length, 1);

  // Client B (same exact name "Jordan Taylor"!) MUST see ZERO data
  const resB = await ClientService.getClient360(clientB.id);
  assert.equal(resB.matters.length, 0);
  assert.equal(resB.invoices.length, 0);
  assert.equal(resB.financialSummary.totalBilled, 0);
  assert.equal(resB.financialSummary.trustBalance, 0);
  assert.equal(resB.communications.length, 0);
  assert.equal(resB.documents.length, 0);
  assert.equal(resB.relatedParties.length, 0);

  // Screened paralegal viewing Client A sees Ethical Wall screened matter/docs/comms filtered out
  const resAScreened = await ClientService.getClient360(clientA.id, paralegalUser as any);
  assert.equal(resAScreened.matters.length, 0);
  assert.equal(resAScreened.documents.length, 0);
  assert.equal(resAScreened.invoices.length, 0);
});

it('RelatedParty CRUD persists cleanly and missing-table P2021 errors never fake write success', async () => {
  const state = createInMemoryPrismaMock();

  const client = await ClientService.createClient(
    { name: 'RP Client', type: 'Organization', email: 'rp@example.org', phone: '801-555-3333' } as any,
    attorneyCtx as any
  );
  const matter = await MatterService.createMatter(
    {
      title: 'RP Client v. Opposing Co',
      clientId: client.id,
      practiceAreaId: 'pa-civ',
      responsibleAttorneyId: attorneyCtx.userId,
      billingType: 'Hourly',
      hourlyRate: 350,
      budget: 10000,
      status: 'Active',
      assignedStaffRole: 'paralegal',
    } as any,
    attorneyCtx as any
  );

  // Normal CRUD
  const created = await RelatedPartyService.createRelatedParty(
    { matterId: matter.id, name: 'Opposing Co LLC', roleId: 'opposing_party', email: 'legal@opposing.test' },
    attorneyCtx
  );
  assert.equal(created.clientId, client.id, 'Automatically links parent clientId from matter');

  const listed = await RelatedPartyService.listRelatedParties({ matterId: matter.id });
  assert.equal(listed.migrationPending, false);
  assert.equal(listed.parties.length, 1);

  const updated = await RelatedPartyService.updateRelatedParty(created.id, { firmName: 'Defense Counsel LLP' }, attorneyCtx);
  assert.equal(updated.firmName, 'Defense Counsel LLP');

  await RelatedPartyService.deleteRelatedParty(created.id, attorneyCtx);
  const afterDelete = await RelatedPartyService.listRelatedParties({ matterId: matter.id });
  assert.equal(afterDelete.parties.length, 0);

  // Simulate unmigrated live DB tables (P2021): reads degrade safely; writes explicitly fail 503 MIGRATION_PENDING
  state.simulateRelatedPartiesMissing = true;
  state.simulateOverviewPanelsMissing = true;

  const missingRpList = await RelatedPartyService.listRelatedParties({ matterId: matter.id });
  assert.equal(missingRpList.migrationPending, true);
  assert.deepEqual(missingRpList.parties, []);

  await assert.rejects(
    () => RelatedPartyService.createRelatedParty({ matterId: matter.id, name: 'Test', roleId: 'opposing_party' }, attorneyCtx),
    (err: any) => err.statusCode === 503 && err.code === 'MIGRATION_PENDING'
  );

  const panels = await MatterService.getOverviewPanels(matter.id, {
    id: attorneyCtx.userId,
    userCode: 'USR-001',
    email: 'eheugly@firm.test',
    role: 'attorney',
    permissions: [],
  });
  assert.equal(panels, null);

  await assert.rejects(
    () =>
      MatterService.saveOverviewPanels(matter.id, { nextActions: [] }, {
        id: attorneyCtx.userId,
        userCode: 'USR-001',
        email: 'eheugly@firm.test',
        role: 'attorney',
        permissions: [],
      }),
    (err: any) => err.statusCode === 503 && err.code === 'MIGRATION_PENDING'
  );
});

async function main() {
  let passed = 0;
  let failed = 0;
  for (const t of tests) {
    try {
      await t.fn();
      passed++;
      console.log(`PASS: ${t.name}`);
    } catch (err) {
      failed++;
      console.error(`FAIL: ${t.name}`);
      console.error(err);
    }
  }
  console.log(`\nTASK-04 Test Summary: ${passed}/${tests.length} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();

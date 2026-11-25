import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { MatterService } from '../matters/matter.service.js';

export const RELATED_PARTY_ROLE_LABELS: Record<string, string> = {
  opposing_party: 'Opposing Party',
  opposing_counsel: 'Opposing Counsel',
  co_counsel: 'Co-Counsel / Local Counsel',
  expert_witness: 'Expert Witness',
  fact_witness: 'Fact Witness',
  judge: 'Presiding Judge / Magistrate',
  insurer: 'Insurance Carrier / Adjuster',
  lienholder: 'Medical / Statutory Lienholder',
  registered_agent: 'Corporate Registered Agent',
  witness: 'Witness',
  other: 'Other Related Party',
};

export interface ConflictMatchEvidence {
  entityType:
    | 'Client'
    | 'Matter'
    | 'Intake'
    | 'RelatedParty'
    | 'PIIncidentParty'
    | 'ImmigrationParty'
    | 'BankruptcyCreditor';
  recordId: string;
  recordCode?: string;
  displayName: string;
  roleOrType: string;
  queriedTerm: string;
  matchedField: string;
  matchedValue: string;
  matterId?: string | null;
  clientId?: string | null;
  intakeId?: string | null;
}

export interface ConflictCategoryStatus {
  category: string;
  status: 'searched' | 'skipped_unmigrated' | 'unavailable';
  scannedCount: number;
}

export interface ConflictScanResult {
  matches: ConflictMatchEvidence[];
  queriedTerms: string[];
  searchedCategories: ConflictCategoryStatus[];
  hasConflicts: boolean;
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'inc',
  'llc',
  'llp',
  'corp',
  'ltd',
  'esq',
  'none',
  'n/a',
  'unknown',
  'pending',
  'tbd',
]);

export function canonicalizeRoleLabel(roleId: string, providedLabel?: string): string {
  if (providedLabel && providedLabel.trim()) return providedLabel.trim();
  return RELATED_PARTY_ROLE_LABELS[roleId] || 'Related Party';
}

export function isMissingTableError(err: unknown, tableHint?: string): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as { code?: string; message?: string; meta?: { table?: string } };
  if (anyErr.code === 'P2021') {
    if (!tableHint) return true;
    const msg = `${anyErr.message || ''} ${anyErr.meta?.table || ''}`.toLowerCase();
    return msg.includes(tableHint.toLowerCase());
  }
  const msg = String(anyErr.message || '').toLowerCase();
  if (msg.includes("doesn't exist") || msg.includes('1146')) {
    return tableHint ? msg.includes(tableHint.toLowerCase()) : true;
  }
  return false;
}

export function stripPiMetadataBlock(text: string | null | undefined): {
  cleanSummary: string;
  piData: Record<string, any> | null;
} {
  const raw = String(text || '');
  const match = raw.match(/\[PI_INTAKE_DATA:(\{[\s\S]*\})\]\s*$/);
  if (!match) {
    return { cleanSummary: raw.trim(), piData: null };
  }
  const cleanSummary = raw.replace(match[0], '').trim();
  try {
    const parsed = JSON.parse(match[1]);
    return { cleanSummary, piData: parsed && typeof parsed === 'object' ? parsed : null };
  } catch {
    return { cleanSummary, piData: null };
  }
}

export function parsePartyTokens(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const pieces = String(raw)
    .split(/[,;\n/|]+|\bvs\.?\b|\bv\.?\b/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const tokens = new Set<string>();
  for (const piece of pieces) {
    const stripped = piece.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
    for (const candidate of [piece, stripped]) {
      const normalized = candidate.trim();
      if (normalized.length >= 2 && !STOP_WORDS.has(normalized.toLowerCase())) {
        tokens.add(normalized);
      }
    }
  }
  return Array.from(tokens);
}

function digitsOnly(val: string | null | undefined): string {
  return String(val || '').replace(/\D+/g, '');
}

function buildSearchTerms(input: {
  rawQuery?: string;
  additionalStrings?: Array<string | null | undefined>;
  emails?: Array<string | null | undefined>;
  phones?: Array<string | null | undefined>;
}): { textTerms: string[]; emailTerms: string[]; phoneDigits: string[] } {
  const textSet = new Set<string>();
  const emailSet = new Set<string>();
  const phoneSet = new Set<string>();

  const collectText = (val?: string | null) => {
    if (!val) return;
    for (const token of parsePartyTokens(val)) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(token)) {
        emailSet.add(token.toLowerCase());
      } else {
        textSet.add(token);
      }
    }
  };

  collectText(input.rawQuery);
  for (const s of input.additionalStrings || []) collectText(s);

  for (const em of input.emails || []) {
    const clean = String(em || '').trim().toLowerCase();
    if (clean.length >= 3) emailSet.add(clean);
  }

  for (const ph of input.phones || []) {
    const digits = digitsOnly(ph);
    if (digits.length >= 7) phoneSet.add(digits);
  }

  if (input.rawQuery) {
    const rawDigits = digitsOnly(input.rawQuery);
    if (rawDigits.length >= 7) phoneSet.add(rawDigits);
  }

  return {
    textTerms: Array.from(textSet),
    emailTerms: Array.from(emailSet),
    phoneDigits: Array.from(phoneSet),
  };
}

function matchFields(
  fields: Array<{ field: string; value: string | null | undefined; isPhone?: boolean }>,
  terms: { textTerms: string[]; emailTerms: string[]; phoneDigits: string[] }
): { queriedTerm: string; matchedField: string; matchedValue: string } | null {
  for (const { field, value, isPhone } of fields) {
    if (!value) continue;
    const rawVal = String(value).trim();
    if (!rawVal) continue;
    const lowerVal = rawVal.toLowerCase();

    for (const email of terms.emailTerms) {
      if (lowerVal === email || lowerVal.includes(email)) {
        return { queriedTerm: email, matchedField: field, matchedValue: rawVal };
      }
    }

    if (isPhone) {
      const valDigits = digitsOnly(rawVal);
      if (valDigits.length >= 7) {
        for (const qDigits of terms.phoneDigits) {
          if (valDigits === qDigits || valDigits.includes(qDigits) || qDigits.includes(valDigits)) {
            return { queriedTerm: qDigits, matchedField: field, matchedValue: rawVal };
          }
        }
      }
    }

    for (const term of terms.textTerms) {
      const lowerTerm = term.toLowerCase();
      if (lowerTerm.length < 2) continue;
      if (lowerVal.includes(lowerTerm)) {
        return { queriedTerm: term, matchedField: field, matchedValue: rawVal };
      }
    }
  }
  return null;
}

export class RelatedPartyService {
  static async scanConflicts(options: {
    rawQuery?: string;
    names?: Array<string | null | undefined>;
    emails?: Array<string | null | undefined>;
    phones?: Array<string | null | undefined>;
    excludeIntakeId?: string;
    excludeClientId?: string;
    excludeMatterId?: string;
  }): Promise<ConflictScanResult> {
    const terms = buildSearchTerms({
      rawQuery: options.rawQuery,
      additionalStrings: options.names,
      emails: options.emails,
      phones: options.phones,
    });

    const queriedTerms = Array.from(
      new Set([...terms.textTerms, ...terms.emailTerms, ...terms.phoneDigits])
    );

    if (queriedTerms.length === 0) {
      return {
        matches: [],
        queriedTerms: [],
        searchedCategories: [],
        hasConflicts: false,
      };
    }

    const matches: ConflictMatchEvidence[] = [];
    const seenKeys = new Set<string>();
    const searchedCategories: ConflictCategoryStatus[] = [];

    const addMatch = (m: ConflictMatchEvidence) => {
      const key = `${m.entityType}:${m.recordId}:${m.matchedField}:${m.matchedValue.toLowerCase()}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        matches.push(m);
      }
    };

    const orFiltersFor = (columns: string[], phoneCols: string[] = []) => {
      const or: Array<Record<string, unknown>> = [];
      for (const t of [...terms.textTerms, ...terms.emailTerms]) {
        for (const col of columns) {
          or.push({ [col]: { contains: t } });
        }
      }
      for (const ph of terms.phoneDigits) {
        const tail = ph.slice(-4);
        for (const pCol of phoneCols) {
          or.push({ [pCol]: { contains: tail } });
        }
      }
      return or;
    };

    // 1. Clients
    const clientDelegate = (prisma as any).client;
    if (clientDelegate?.findMany) {
      try {
        const clientOr = orFiltersFor(['name', 'email', 'primaryContact', 'notes'], ['phone']);
        const clients = await clientDelegate.findMany({
          where: {
            ...(options.excludeClientId ? { id: { not: options.excludeClientId } } : {}),
            ...(clientOr.length ? { OR: clientOr } : {}),
          },
          select: {
            id: true,
            clientNumber: true,
            name: true,
            email: true,
            phone: true,
            primaryContact: true,
            status: true,
            notes: true,
          },
          take: 500,
        });
        searchedCategories.push({ category: 'Clients', status: 'searched', scannedCount: clients.length });
        for (const c of clients) {
          if (options.excludeClientId && c.id === options.excludeClientId) continue;
          const hit = matchFields(
            [
              { field: 'name', value: c.name },
              { field: 'email', value: c.email },
              { field: 'primaryContact', value: c.primaryContact },
              { field: 'phone', value: c.phone, isPhone: true },
              { field: 'notes', value: c.notes },
            ],
            terms
          );
          if (hit) {
            addMatch({
              entityType: 'Client',
              recordId: c.id,
              recordCode: c.clientNumber,
              displayName: c.name,
              roleOrType: `Existing Client (${c.status || 'Active'})`,
              clientId: c.id,
              ...hit,
            });
          }
        }
      } catch {
        searchedCategories.push({ category: 'Clients', status: 'unavailable', scannedCount: 0 });
      }
    }

    // 2. Matters
    const matterDelegate = (prisma as any).matter;
    if (matterDelegate?.findMany) {
      try {
        const matterOr = orFiltersFor(['title', 'description', 'matterNumber']);
        const matters = await matterDelegate.findMany({
          where: {
            ...(options.excludeMatterId ? { id: { not: options.excludeMatterId } } : {}),
            ...(matterOr.length ? { OR: matterOr } : {}),
          },
          select: {
            id: true,
            matterNumber: true,
            title: true,
            description: true,
            clientId: true,
            status: true,
          },
          take: 500,
        });
        searchedCategories.push({ category: 'Matters', status: 'searched', scannedCount: matters.length });
        for (const m of matters) {
          if (options.excludeMatterId && m.id === options.excludeMatterId) continue;
          const hit = matchFields(
            [
              { field: 'title', value: m.title },
              { field: 'description', value: m.description },
            ],
            terms
          );
          if (hit) {
            addMatch({
              entityType: 'Matter',
              recordId: m.id,
              recordCode: m.matterNumber,
              displayName: m.title,
              roleOrType: `Legal Matter (${m.status || 'Active'})`,
              matterId: m.id,
              clientId: m.clientId,
              ...hit,
            });
          }
        }
      } catch {
        searchedCategories.push({ category: 'Matters', status: 'unavailable', scannedCount: 0 });
      }
    }

    // 3. Intakes (former & prospective intakes, opposing parties)
    const intakeDelegate = (prisma as any).intake;
    if (intakeDelegate?.findMany) {
      try {
        const intakeOr = orFiltersFor(
          ['prospectiveClient', 'contactPerson', 'email', 'adverseParties'],
          ['phone']
        );
        const intakes = await intakeDelegate.findMany({
          where: {
            ...(options.excludeIntakeId ? { id: { not: options.excludeIntakeId } } : {}),
            ...(intakeOr.length ? { OR: intakeOr } : {}),
          },
          select: {
            id: true,
            intakeNumber: true,
            prospectiveClient: true,
            contactPerson: true,
            email: true,
            phone: true,
            adverseParties: true,
            conflictStatus: true,
          },
          take: 500,
        });
        searchedCategories.push({ category: 'Intakes', status: 'searched', scannedCount: intakes.length });
        for (const i of intakes) {
          if (options.excludeIntakeId && i.id === options.excludeIntakeId) continue;
          const hit = matchFields(
            [
              { field: 'prospectiveClient', value: i.prospectiveClient },
              { field: 'adverseParties', value: i.adverseParties },
              { field: 'contactPerson', value: i.contactPerson },
              { field: 'email', value: i.email },
              { field: 'phone', value: i.phone, isPhone: true },
            ],
            terms
          );
          if (hit) {
            addMatch({
              entityType: 'Intake',
              recordId: i.id,
              recordCode: i.intakeNumber,
              displayName: i.prospectiveClient,
              roleOrType: `Prospective / Prior Intake (${i.conflictStatus || 'Intake'})`,
              intakeId: i.id,
              ...hit,
            });
          }
        }
      } catch {
        searchedCategories.push({ category: 'Intakes', status: 'unavailable', scannedCount: 0 });
      }
    }

    // 4. Related Parties (table may be pending migration on live DB)
    const rpDelegate = (prisma as any).relatedParty;
    if (rpDelegate?.findMany) {
      try {
        const rpOr = orFiltersFor(
          ['name', 'aliases', 'firmName', 'contactPerson', 'email'],
          ['phone']
        );
        const relatedParties = await rpDelegate.findMany({
          where: rpOr.length ? { OR: rpOr } : undefined,
          select: {
            id: true,
            name: true,
            aliases: true,
            roleId: true,
            roleLabel: true,
            firmName: true,
            contactPerson: true,
            email: true,
            phone: true,
            matterId: true,
            clientId: true,
            intakeId: true,
          },
          take: 500,
        });
        searchedCategories.push({
          category: 'RelatedParties',
          status: 'searched',
          scannedCount: relatedParties.length,
        });
        for (const rp of relatedParties) {
          if (options.excludeIntakeId && rp.intakeId === options.excludeIntakeId) continue;
          if (options.excludeMatterId && rp.matterId === options.excludeMatterId) continue;
          const hit = matchFields(
            [
              { field: 'name', value: rp.name },
              { field: 'aliases', value: rp.aliases },
              { field: 'firmName', value: rp.firmName },
              { field: 'contactPerson', value: rp.contactPerson },
              { field: 'email', value: rp.email },
              { field: 'phone', value: rp.phone, isPhone: true },
            ],
            terms
          );
          if (hit) {
            addMatch({
              entityType: 'RelatedParty',
              recordId: rp.id,
              displayName: rp.name,
              roleOrType: `Related Party: ${rp.roleLabel || rp.roleId}`,
              matterId: rp.matterId,
              clientId: rp.clientId,
              intakeId: rp.intakeId,
              ...hit,
            });
          }
        }
      } catch (err) {
        searchedCategories.push({
          category: 'RelatedParties',
          status: isMissingTableError(err, 'related_parties') ? 'skipped_unmigrated' : 'unavailable',
          scannedCount: 0,
        });
      }
    }

    // 5. Personal Injury Incident Parties
    const piPartyDelegate = (prisma as any).incidentParty;
    if (piPartyDelegate?.findMany) {
      try {
        const piOr = orFiltersFor(['fullName', 'insuranceCarrier'], ['phone']);
        const piParties = await piPartyDelegate.findMany({
          where: piOr.length ? { OR: piOr } : undefined,
          select: {
            id: true,
            fullName: true,
            partyType: true,
            phone: true,
            insuranceCarrier: true,
            incident: { select: { matterId: true } },
          },
          take: 500,
        });
        searchedCategories.push({
          category: 'PIIncidentParties',
          status: 'searched',
          scannedCount: piParties.length,
        });
        for (const pip of piParties) {
          if (options.excludeMatterId && pip.incident?.matterId === options.excludeMatterId) continue;
          const hit = matchFields(
            [
              { field: 'fullName', value: pip.fullName },
              { field: 'insuranceCarrier', value: pip.insuranceCarrier },
              { field: 'phone', value: pip.phone, isPhone: true },
            ],
            terms
          );
          if (hit) {
            addMatch({
              entityType: 'PIIncidentParty',
              recordId: pip.id,
              displayName: pip.fullName,
              roleOrType: `PI Incident Party (${pip.partyType})`,
              matterId: pip.incident?.matterId || null,
              ...hit,
            });
          }
        }
      } catch {
        searchedCategories.push({ category: 'PIIncidentParties', status: 'unavailable', scannedCount: 0 });
      }
    }

    // 6. Immigration Parties
    const immPartyDelegate = (prisma as any).immigrationParty;
    if (immPartyDelegate?.findMany) {
      try {
        const immOr = orFiltersFor(['name', 'email'], ['phone']);
        const immParties = await immPartyDelegate.findMany({
          where: immOr.length ? { OR: immOr } : undefined,
          select: {
            id: true,
            name: true,
            relationshipRole: true,
            email: true,
            phone: true,
            immigrationCase: { select: { matterId: true } },
          },
          take: 500,
        });
        searchedCategories.push({
          category: 'ImmigrationParties',
          status: 'searched',
          scannedCount: immParties.length,
        });
        for (const imp of immParties) {
          if (options.excludeMatterId && imp.immigrationCase?.matterId === options.excludeMatterId) continue;
          const hit = matchFields(
            [
              { field: 'name', value: imp.name },
              { field: 'email', value: imp.email },
              { field: 'phone', value: imp.phone, isPhone: true },
            ],
            terms
          );
          if (hit) {
            addMatch({
              entityType: 'ImmigrationParty',
              recordId: imp.id,
              displayName: imp.name,
              roleOrType: `Immigration Party (${imp.relationshipRole})`,
              matterId: imp.immigrationCase?.matterId || null,
              ...hit,
            });
          }
        }
      } catch {
        searchedCategories.push({ category: 'ImmigrationParties', status: 'unavailable', scannedCount: 0 });
      }
    }

    // 7. Bankruptcy Creditors
    const bkCredDelegate = (prisma as any).bankruptcyCreditor;
    if (bkCredDelegate?.findMany) {
      try {
        const bkOr = orFiltersFor(['creditorName']);
        const creditors = await bkCredDelegate.findMany({
          where: bkOr.length ? { OR: bkOr } : undefined,
          select: {
            id: true,
            creditorName: true,
            claimType: true,
            bankruptcyCase: { select: { matterId: true } },
          },
          take: 500,
        });
        searchedCategories.push({
          category: 'BankruptcyCreditors',
          status: 'searched',
          scannedCount: creditors.length,
        });
        for (const cr of creditors) {
          if (options.excludeMatterId && cr.bankruptcyCase?.matterId === options.excludeMatterId) continue;
          const hit = matchFields([{ field: 'creditorName', value: cr.creditorName }], terms);
          if (hit) {
            addMatch({
              entityType: 'BankruptcyCreditor',
              recordId: cr.id,
              displayName: cr.creditorName,
              roleOrType: `Bankruptcy Creditor (${cr.claimType})`,
              matterId: cr.bankruptcyCase?.matterId || null,
              ...hit,
            });
          }
        }
      } catch {
        searchedCategories.push({ category: 'BankruptcyCreditors', status: 'unavailable', scannedCount: 0 });
      }
    }

    return {
      matches,
      queriedTerms,
      searchedCategories,
      hasConflicts: matches.length > 0,
    };
  }

  private static async assertMatterAccess(
    matterId: string,
    user?: { userId?: string; id?: string; role?: string; email?: string; name?: string }
  ) {
    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: { staffAssignments: true },
    });
    if (!matter) {
      throw AppError.notFound('Matter');
    }
    const uid = user?.userId || user?.id;
    if (uid && user?.role) {
      const authorized = MatterService.isUserAuthorizedForMatter(matter, {
        id: uid,
        userCode: '',
        email: user.email || '',
        role: user.role,
        permissions: [],
      });
      if (!authorized) {
        throw AppError.forbidden('Ethical Wall active: Access to this matter is restricted.');
      }
    }
    return matter;
  }

  static async listRelatedParties(
    filters: {
      matterId?: string;
      clientId?: string;
      intakeId?: string;
      roleId?: string;
      search?: string;
    },
    user?: { userId?: string; id?: string; role?: string }
  ): Promise<{ parties: any[]; migrationPending: boolean }> {
    if (filters.matterId) {
      await this.assertMatterAccess(filters.matterId, user);
    }

    const delegate = (prisma as any).relatedParty;
    if (!delegate?.findMany) {
      return { parties: [], migrationPending: true };
    }

    const where: Record<string, unknown> = {};
    if (filters.matterId) where.matterId = filters.matterId;
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.intakeId) where.intakeId = filters.intakeId;
    if (filters.roleId && filters.roleId !== 'ALL') where.roleId = filters.roleId;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { aliases: { contains: filters.search } },
        { firmName: { contains: filters.search } },
        { contactPerson: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    try {
      const rows = await delegate.findMany({
        where,
        include: {
          matter: {
            select: {
              id: true,
              matterNumber: true,
              title: true,
              description: true,
              responsibleAttorneyId: true,
              staffAssignments: { select: { userId: true } },
            },
          },
          client: { select: { id: true, clientNumber: true, name: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
      });

      const uid = user?.userId || user?.id;
      const role = user?.role;
      const filtered = rows.filter((r: any) => {
        if (!r.matter || !uid || !role) return true;
        return MatterService.isUserAuthorizedForMatter(r.matter, {
          id: uid,
          userCode: '',
          email: '',
          role,
          permissions: [],
        });
      });

      return {
        parties: filtered.map((r: any) => ({
          id: r.id,
          matterId: r.matterId,
          matterTitle: r.matter?.title || null,
          matterNumber: r.matter?.matterNumber || null,
          clientId: r.clientId,
          clientName: r.client?.name || null,
          intakeId: r.intakeId,
          name: r.name,
          aliases: r.aliases,
          roleId: r.roleId,
          roleLabel: r.roleLabel,
          firmName: r.firmName,
          contactPerson: r.contactPerson,
          email: r.email,
          phone: r.phone,
          address: r.address,
          serviceType: r.serviceType,
          notes: r.notes,
          createdByUserId: r.createdByUserId,
          createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
          updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
        })),
        migrationPending: false,
      };
    } catch (err) {
      if (isMissingTableError(err, 'related_parties')) {
        return { parties: [], migrationPending: true };
      }
      throw err;
    }
  }

  static async createRelatedParty(
    data: any,
    context: {
      userId: string;
      userName: string;
      userRole: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    let resolvedClientId = data.clientId || null;
    if (data.matterId) {
      const matter = await this.assertMatterAccess(data.matterId, {
        userId: context.userId,
        role: context.userRole,
      });
      if (!resolvedClientId) {
        resolvedClientId = matter.clientId;
      }
    } else if (resolvedClientId) {
      const client = await prisma.client.findUnique({ where: { id: resolvedClientId } });
      if (!client) throw AppError.notFound('Client');
    }

    const delegate = (prisma as any).relatedParty;
    if (!delegate?.create) {
      throw new AppError(
        "Related Parties storage is unavailable because database table 'related_parties' has not been migrated yet.",
        503,
        'MIGRATION_PENDING'
      );
    }

    const roleLabel = canonicalizeRoleLabel(data.roleId, data.roleLabel);
    try {
      const created = await delegate.create({
        data: {
          matterId: data.matterId || null,
          clientId: resolvedClientId,
          intakeId: data.intakeId || null,
          name: data.name,
          aliases: data.aliases || null,
          roleId: data.roleId || 'opposing_party',
          roleLabel,
          firmName: data.firmName || null,
          contactPerson: data.contactPerson || null,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          serviceType: data.serviceType || null,
          notes: data.notes || null,
          createdByUserId: context.userId,
        },
        include: {
          matter: { select: { id: true, matterNumber: true, title: true } },
          client: { select: { id: true, clientNumber: true, name: true } },
        },
      });

      await createAuditLog({
        userId: context.userId,
        userName: context.userName,
        userRole: context.userRole,
        action: 'CREATE',
        resourceType: 'RELATED_PARTY',
        resourceId: created.id,
        details: {
          matterId: created.matterId,
          clientId: created.clientId,
          name: created.name,
          roleId: created.roleId,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return {
        ...created,
        matterTitle: created.matter?.title || null,
        matterNumber: created.matter?.matterNumber || null,
        clientName: created.client?.name || null,
      };
    } catch (err) {
      if (isMissingTableError(err, 'related_parties')) {
        throw new AppError(
          "Cannot persist related party because database table 'related_parties' has not been created yet. Please approve and apply the pending migration SQL.",
          503,
          'MIGRATION_PENDING'
        );
      }
      throw err;
    }
  }

  static async updateRelatedParty(
    id: string,
    data: any,
    context: {
      userId: string;
      userName: string;
      userRole: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    const delegate = (prisma as any).relatedParty;
    if (!delegate?.findUnique || !delegate?.update) {
      throw new AppError(
        "Database table 'related_parties' requires pending migration before updates can be saved.",
        503,
        'MIGRATION_PENDING'
      );
    }

    try {
      const existing = await delegate.findUnique({ where: { id } });
      if (!existing) throw AppError.notFound('Related party');
      if (existing.matterId) {
        await this.assertMatterAccess(existing.matterId, {
          userId: context.userId,
          role: context.userRole,
        });
      }

      const nextRoleId = data.roleId || existing.roleId;
      const roleLabel =
        data.roleId || data.roleLabel
          ? canonicalizeRoleLabel(nextRoleId, data.roleLabel)
          : existing.roleLabel;

      const updated = await delegate.update({
        where: { id },
        data: {
          ...(data.matterId !== undefined ? { matterId: data.matterId } : {}),
          ...(data.clientId !== undefined ? { clientId: data.clientId } : {}),
          ...(data.intakeId !== undefined ? { intakeId: data.intakeId } : {}),
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.aliases !== undefined ? { aliases: data.aliases } : {}),
          ...(data.roleId !== undefined ? { roleId: nextRoleId } : {}),
          roleLabel,
          ...(data.firmName !== undefined ? { firmName: data.firmName } : {}),
          ...(data.contactPerson !== undefined ? { contactPerson: data.contactPerson } : {}),
          ...(data.email !== undefined ? { email: data.email || null } : {}),
          ...(data.phone !== undefined ? { phone: data.phone } : {}),
          ...(data.address !== undefined ? { address: data.address } : {}),
          ...(data.serviceType !== undefined ? { serviceType: data.serviceType } : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
        },
        include: {
          matter: { select: { id: true, matterNumber: true, title: true } },
          client: { select: { id: true, clientNumber: true, name: true } },
        },
      });

      await createAuditLog({
        userId: context.userId,
        userName: context.userName,
        userRole: context.userRole,
        action: 'UPDATE',
        resourceType: 'RELATED_PARTY',
        resourceId: id,
        details: { name: updated.name, roleId: updated.roleId },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return {
        ...updated,
        matterTitle: updated.matter?.title || null,
        matterNumber: updated.matter?.matterNumber || null,
        clientName: updated.client?.name || null,
      };
    } catch (err) {
      if (isMissingTableError(err, 'related_parties')) {
        throw new AppError(
          "Cannot update related party because database table 'related_parties' has not been created yet.",
          503,
          'MIGRATION_PENDING'
        );
      }
      throw err;
    }
  }

  static async deleteRelatedParty(
    id: string,
    context: {
      userId: string;
      userName: string;
      userRole: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    const delegate = (prisma as any).relatedParty;
    if (!delegate?.findUnique || !delegate?.delete) {
      throw new AppError(
        "Database table 'related_parties' requires pending migration before deletion.",
        503,
        'MIGRATION_PENDING'
      );
    }

    try {
      const existing = await delegate.findUnique({ where: { id } });
      if (!existing) throw AppError.notFound('Related party');
      if (existing.matterId) {
        await this.assertMatterAccess(existing.matterId, {
          userId: context.userId,
          role: context.userRole,
        });
      }

      await delegate.delete({ where: { id } });

      await createAuditLog({
        userId: context.userId,
        userName: context.userName,
        userRole: context.userRole,
        action: 'DELETE',
        resourceType: 'RELATED_PARTY',
        resourceId: id,
        details: { name: existing.name, matterId: existing.matterId },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return { deleted: true, id };
    } catch (err) {
      if (isMissingTableError(err, 'related_parties')) {
        throw new AppError(
          "Cannot delete related party because database table 'related_parties' has not been created yet.",
          503,
          'MIGRATION_PENDING'
        );
      }
      throw err;
    }
  }

  /**
   * Automatically links opposing parties & insurers from intake conversion to related_parties when table exists.
   * Non-blocking when migration is pending so intake-to-matter conversion is never broken.
   */
  static async seedFromIntakeConversion(params: {
    intake: {
      id: string;
      intakeNumber?: string;
      adverseParties?: string | null;
      matterSummary?: string | null;
    };
    clientId: string;
    matterId: string;
    userId: string;
  }): Promise<void> {
    const delegate = (prisma as any).relatedParty;
    if (!delegate?.create || !delegate?.findMany) return;

    try {
      const existing = await delegate.findMany({ where: { matterId: params.matterId } });
      const existingNames = new Set(existing.map((e: any) => String(e.name || '').toLowerCase().trim()));
      const candidates: Array<{
        name: string;
        roleId: string;
        roleLabel: string;
        notes?: string;
        firmName?: string;
        contactPerson?: string;
      }> = [];

      const { piData } = stripPiMetadataBlock(params.intake.matterSummary);

      const rawAdverse = String(params.intake.adverseParties || '');
      for (const rawPiece of rawAdverse.split(/[,;\n/|]+/)) {
        const cleaned = rawPiece.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
        if (!cleaned || STOP_WORDS.has(cleaned.toLowerCase())) continue;
        const lowerFull = rawPiece.toLowerCase();
        const isInsurer = lowerFull.includes('insur') || lowerFull.includes('adjuster') || lowerFull.includes('geico') || lowerFull.includes('state farm') || lowerFull.includes('progressive') || lowerFull.includes('allstate') || lowerFull.includes('travelers');
        candidates.push({
          name: cleaned,
          roleId: isInsurer ? 'insurer' : 'opposing_party',
          roleLabel: isInsurer ? RELATED_PARTY_ROLE_LABELS.insurer : RELATED_PARTY_ROLE_LABELS.opposing_party,
          notes: `Imported from Intake ${params.intake.intakeNumber || params.intake.id}${rawPiece !== cleaned ? ` (${rawPiece.trim()})` : ''}`,
        });
      }

      if (piData?.atFaultInsurer) {
        candidates.push({
          name: String(piData.atFaultInsurer).trim(),
          roleId: 'insurer',
          roleLabel: RELATED_PARTY_ROLE_LABELS.insurer,
          notes: `At-fault liability insurer imported from PI intake ${params.intake.intakeNumber || params.intake.id}`,
        });
      }

      for (const item of candidates) {
        if (!item.name || existingNames.has(item.name.toLowerCase())) continue;
        existingNames.add(item.name.toLowerCase());
        await delegate.create({
          data: {
            matterId: params.matterId,
            clientId: params.clientId,
            intakeId: params.intake.id,
            name: item.name,
            roleId: item.roleId,
            roleLabel: item.roleLabel,
            notes: item.notes || null,
            createdByUserId: params.userId,
          },
        });
      }
    } catch {
      // Non-blocking if table hasn't been migrated yet
    }
  }
}

/**
 * HEUGLY & BLUDWORTH – LEGAL MANAGEMENT SOFTWARE
 * Centralized Role Definitions
 * 
 * Strict Client Requirement: Exactly 5 predefined roles.
 * Do not add, rename, or delete roles.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ATTORNEY: 'attorney',
  PARALEGAL: 'paralegal',
  BILLING: 'billing',
  SUPERVISOR: 'supervisor',
};

export const ROLE_LIST = [
  {
    id: ROLES.SUPER_ADMIN,
    name: 'Super Admin',
    shortName: 'Super Admin',
    description: 'Full administrative control, user governance, security policies, and firm-wide ledger visibility.',
    badgeStyle: 'bg-[#06244B] text-[#F5F0E5]',
    isImmutable: true, // Super Admin permissions cannot be revoked
  },
  {
    id: ROLES.ATTORNEY,
    name: 'Attorney',
    shortName: 'Attorney',
    description: 'Case file management, litigation dockets, client advisory, time logging, and personal workload.',
    badgeStyle: 'bg-blue-100 text-blue-900 border border-blue-200',
    isImmutable: false,
  },
  {
    id: ROLES.PARALEGAL,
    name: 'Paralegal / Staff',
    shortName: 'Paralegal',
    description: 'Litigation support, court filings, document repository management, and task checklists.',
    badgeStyle: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
    isImmutable: false,
  },
  {
    id: ROLES.BILLING,
    name: 'Billing / Accounting Staff',
    shortName: 'Billing Staff',
    description: 'Invoicing, disbursements, fee accounting, receivables, and official CosmoLex ledger synchronization.',
    badgeStyle: 'bg-amber-100 text-amber-900 border border-amber-200',
    isImmutable: false,
  },
  {
    id: ROLES.SUPERVISOR,
    name: 'Supervisor',
    shortName: 'Supervisor',
    description: 'Team task monitoring, litigation review, attorney time entry approvals, and operational reports.',
    badgeStyle: 'bg-purple-100 text-purple-900 border border-purple-200',
    isImmutable: false,
  },
];

export const getRoleById = (roleId) => ROLE_LIST.find((r) => r.id === roleId) || ROLE_LIST[1];


/**
 * HEUGLY & BLUDWORTH – LEGAL MANAGEMENT SOFTWARE
 * Centralized Permission Definitions & Baseline RBAC Matrix
 */

import { ROLES } from './roles';

export const PERMISSION_ACTIONS = {
  VIEW: 'View',
  CREATE: 'Create',
  EDIT: 'Edit',
  DELETE: 'Delete',
  APPROVE: 'Approve',
  EXPORT: 'Export',
  MANAGE: 'Manage',
};

// All granular permission keys in the application
export const PERMISSIONS = {
  // 1. Dashboard Permissions
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_WORKLOAD_VIEW: 'dashboard:workload_view',
  DASHBOARD_APPROVALS_VIEW: 'dashboard:approvals_view',

  // 2. Clients & Matters Permissions
  CLIENTS_VIEW: 'clients:view',
  CLIENTS_CREATE: 'clients:create',
  CLIENTS_EDIT: 'clients:edit',
  CLIENTS_DELETE: 'clients:delete',

  MATTERS_VIEW: 'matters:view',
  MATTERS_CREATE: 'matters:create',
  MATTERS_EDIT: 'matters:edit',
  MATTERS_DELETE: 'matters:delete',

  INTAKE_VIEW: 'intake:view',
  INTAKE_CREATE: 'intake:create',
  INTAKE_CONFLICT_REVIEW: 'intake:conflict_review',

  DOCUMENTS_VIEW: 'documents:view',
  DOCUMENTS_UPLOAD: 'documents:upload',
  DOCUMENTS_DELETE: 'documents:delete',

  COMMUNICATIONS_VIEW: 'communications:view',
  COMMUNICATIONS_MANAGE: 'communications:manage',

  PORTAL_PREVIEW: 'portal:preview',

  // 3. Tasks & Activities Permissions
  TASKS_VIEW_OWN: 'tasks:view_own',
  TASKS_VIEW_TEAM: 'tasks:view_team',
  TASKS_CREATE: 'tasks:create',
  TASKS_EDIT: 'tasks:edit',
  TASKS_DELETE: 'tasks:delete',

  CALENDAR_VIEW: 'calendar:view',
  DEADLINES_VIEW: 'deadlines:view',

  TIME_LOG: 'time:log',
  TIME_REVIEW_OWN: 'time:review_own',
  TIME_REVIEW_TEAM: 'time:review_team',
  TIME_SUGGESTED_VIEW: 'time:suggested_view',
  TIME_APPROVE: 'time:approve',
  TIME_REJECT: 'time:reject',

  CHECKLISTS_VIEW: 'checklists:view',
  CHECKLISTS_MANAGE: 'checklists:manage',

  // 4. Billing & Accounting Permissions
  BILLING_OVERVIEW_VIEW: 'billing:overview_view',
  BILLING_HOURS_VIEW: 'billing:hours_view',
  EXPENSES_VIEW: 'expenses:view',
  EXPENSES_CREATE: 'expenses:create',
  EXPENSES_EDIT: 'expenses:edit',

  INVOICES_VIEW: 'invoices:view',
  INVOICES_CREATE: 'invoices:create',
  INVOICES_MANAGE: 'invoices:manage',

  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_RECORD: 'payments:record',

  BILLING_REPORTS_VIEW: 'billing:reports_view',
  OPERATING_ACCOUNT_VIEW: 'operating:view',
  TRUST_ACCOUNT_VIEW: 'trust:view',

  COSMOLEX_VIEW: 'cosmolex:view',
  COSMOLEX_EXPORT: 'cosmolex:export',

  // 5. Reports & Settings Permissions
  REPORTS_STAFF_VIEW: 'reports:staff_view',
  REPORTS_MATTER_VIEW: 'reports:matter_view',
  REPORTS_FINANCIAL_VIEW: 'reports:financial_view',
  REPORTS_EXPORT: 'reports:export',

  USERS_VIEW: 'users:view',
  USERS_MANAGE: 'users:manage',

  ROLES_VIEW: 'roles:view',
  ROLES_MANAGE: 'roles:manage',

  TEMPLATES_VIEW: 'templates:view',
  TEMPLATES_MANAGE: 'templates:manage',

  INTEGRATIONS_VIEW: 'integrations:view',
  INTEGRATIONS_MANAGE: 'integrations:manage',

  BRANDING_MANAGE: 'branding:manage',
  NOTIFICATIONS_MANAGE: 'notifications:manage',
  AUDIT_LOGS_VIEW: 'audit_logs:view',
  SECURITY_MANAGE: 'security:manage',
};

// 5 Structured Permission Groups according to client specification
export const PERMISSION_GROUPS = [
  {
    id: 'dashboard',
    name: '1. Dashboard Permissions',
    description: 'Control access to dashboard metrics, executive KPI cards, team workload, and approval queues.',
    permissions: [
      { key: PERMISSIONS.DASHBOARD_VIEW, label: 'View Dashboard & Personal KPIs', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.DASHBOARD_WORKLOAD_VIEW, label: 'View Team Workload Summary', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.DASHBOARD_APPROVALS_VIEW, label: 'View Pending Time Approvals Queue', action: PERMISSION_ACTIONS.VIEW },
    ],
  },
  {
    id: 'clients_matters',
    name: '2. Clients & Matters Permissions',
    description: 'Control access to client directories, matter dockets, intake conflict clearance, and documents.',
    permissions: [
      { key: PERMISSIONS.CLIENTS_VIEW, label: 'View All Clients Directory', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.CLIENTS_CREATE, label: 'Create New Client Records', action: PERMISSION_ACTIONS.CREATE },
      { key: PERMISSIONS.CLIENTS_EDIT, label: 'Edit Client Profiles & Contact Info', action: PERMISSION_ACTIONS.EDIT },
      { key: PERMISSIONS.CLIENTS_DELETE, label: 'Archive / Delete Client Files', action: PERMISSION_ACTIONS.DELETE },

      { key: PERMISSIONS.MATTERS_VIEW, label: 'View Master Matter Dockets', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.MATTERS_CREATE, label: 'Open New Legal Matters', action: PERMISSION_ACTIONS.CREATE },
      { key: PERMISSIONS.MATTERS_EDIT, label: 'Edit Matter Details & Assigned Staff', action: PERMISSION_ACTIONS.EDIT },
      { key: PERMISSIONS.MATTERS_DELETE, label: 'Archive / Delete Legal Matters', action: PERMISSION_ACTIONS.DELETE },

      { key: PERMISSIONS.INTAKE_VIEW, label: 'View Intake Records', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.INTAKE_CREATE, label: 'Create Prospective Client Intake', action: PERMISSION_ACTIONS.CREATE },
      { key: PERMISSIONS.INTAKE_CONFLICT_REVIEW, label: 'Clear or Flag Adverse Conflict Checks', action: PERMISSION_ACTIONS.APPROVE },

      { key: PERMISSIONS.DOCUMENTS_VIEW, label: 'View Case Documents Vault', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.DOCUMENTS_UPLOAD, label: 'Upload Documents & Exhibits', action: PERMISSION_ACTIONS.CREATE },
      { key: PERMISSIONS.DOCUMENTS_DELETE, label: 'Delete Case Documents', action: PERMISSION_ACTIONS.DELETE },

      { key: PERMISSIONS.COMMUNICATIONS_VIEW, label: 'View Attorney-Client Communications', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.COMMUNICATIONS_MANAGE, label: 'Log New Communication Entries', action: PERMISSION_ACTIONS.MANAGE },

      { key: PERMISSIONS.PORTAL_PREVIEW, label: 'Simulate Client Portal Preview', action: PERMISSION_ACTIONS.VIEW },
    ],
  },
  {
    id: 'tasks_activities',
    name: '3. Tasks & Activities Permissions',
    description: 'Control access to personal/team tasks, master litigation calendar, court deadlines, and billable time entries.',
    permissions: [
      { key: PERMISSIONS.TASKS_VIEW_OWN, label: 'View Assigned Personal Tasks', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.TASKS_VIEW_TEAM, label: 'View Firm-wide Team Tasks', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.TASKS_CREATE, label: 'Create & Assign Tasks', action: PERMISSION_ACTIONS.CREATE },
      { key: PERMISSIONS.TASKS_EDIT, label: 'Update Task Details & Status', action: PERMISSION_ACTIONS.EDIT },
      { key: PERMISSIONS.TASKS_DELETE, label: 'Delete Assigned Tasks', action: PERMISSION_ACTIONS.DELETE },

      { key: PERMISSIONS.CALENDAR_VIEW, label: 'View Firm Master Calendar', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.DEADLINES_VIEW, label: 'View Court Deadlines & Rule 26 Cutoffs', action: PERMISSION_ACTIONS.VIEW },

      { key: PERMISSIONS.TIME_LOG, label: 'Record Billable & Non-Billable Time', action: PERMISSION_ACTIONS.CREATE },
      { key: PERMISSIONS.TIME_REVIEW_OWN, label: 'Access Personal Daily Time Review', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.TIME_REVIEW_TEAM, label: 'Review Team Daily Time Sheets', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.TIME_SUGGESTED_VIEW, label: 'View Suggested Billing Entries (Email/Doc)', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.TIME_APPROVE, label: 'Approve Submitted Time Entries', action: PERMISSION_ACTIONS.APPROVE },
      { key: PERMISSIONS.TIME_REJECT, label: 'Reject Time Entries with Feedback Comment', action: PERMISSION_ACTIONS.APPROVE },

      { key: PERMISSIONS.CHECKLISTS_VIEW, label: 'View Litigation Workflow Checklists', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.CHECKLISTS_MANAGE, label: 'Update Workflow Checklist Steps', action: PERMISSION_ACTIONS.MANAGE },
    ],
  },
  {
    id: 'billing_accounting',
    name: '4. Billing & Accounting Permissions',
    description: 'Control access to approved hours, expenses, invoicing, trust account placeholders, and CosmoLex sync.',
    permissions: [
      { key: PERMISSIONS.BILLING_OVERVIEW_VIEW, label: 'View Billing Overview Dashboard', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.BILLING_HOURS_VIEW, label: 'View Itemized Approved Billable Hours', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.EXPENSES_VIEW, label: 'View Matter Disbursements & Expenses', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.EXPENSES_CREATE, label: 'Record Matter Disbursements & Expenses', action: PERMISSION_ACTIONS.CREATE },
      { key: PERMISSIONS.EXPENSES_EDIT, label: 'Edit Disbursement Records', action: PERMISSION_ACTIONS.EDIT },

      { key: PERMISSIONS.INVOICES_VIEW, label: 'View Client Invoices', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.INVOICES_CREATE, label: 'Generate Formal Firm Invoices', action: PERMISSION_ACTIONS.CREATE },
      { key: PERMISSIONS.INVOICES_MANAGE, label: 'Manage Invoice Status & Print Letterhead', action: PERMISSION_ACTIONS.MANAGE },

      { key: PERMISSIONS.PAYMENTS_VIEW, label: 'View Payment Receipts Ledger', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.PAYMENTS_RECORD, label: 'Record Client Fee Payments (ACH/Wire/Check)', action: PERMISSION_ACTIONS.CREATE },

      { key: PERMISSIONS.BILLING_REPORTS_VIEW, label: 'View Billing Realization Reports', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.OPERATING_ACCOUNT_VIEW, label: 'View Operating Account Flow Ledger', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.TRUST_ACCOUNT_VIEW, label: 'View IOLTA Trust Account (Future Phase)', action: PERMISSION_ACTIONS.VIEW },

      { key: PERMISSIONS.COSMOLEX_VIEW, label: 'View CosmoLex Integration Bridge Settings', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.COSMOLEX_EXPORT, label: 'Execute Batch Export of Approved Time to CosmoLex', action: PERMISSION_ACTIONS.EXPORT },
    ],
  },
  {
    id: 'reports_settings',
    name: '5. Reports & Settings Permissions',
    description: 'Control access to operational reports, user management, role permissions, and security policies.',
    permissions: [
      { key: PERMISSIONS.REPORTS_STAFF_VIEW, label: 'View Attorney & Staff Performance Reports', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.REPORTS_MATTER_VIEW, label: 'View Case & Practice Area Reports', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.REPORTS_FINANCIAL_VIEW, label: 'View Confidential Firm Financials & AR Aging', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.REPORTS_EXPORT, label: 'Export Reports (CSV / Executive Package)', action: PERMISSION_ACTIONS.EXPORT },

      { key: PERMISSIONS.USERS_VIEW, label: 'View User Directory & Rates', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.USERS_MANAGE, label: 'Create, Edit & Deactivate User Accounts', action: PERMISSION_ACTIONS.MANAGE },

      { key: PERMISSIONS.ROLES_VIEW, label: 'View Role Permissions Matrix', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.ROLES_MANAGE, label: 'Configure & Update Role Permissions', action: PERMISSION_ACTIONS.MANAGE },

      { key: PERMISSIONS.TEMPLATES_VIEW, label: 'View Document & Workflow Templates', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.TEMPLATES_MANAGE, label: 'Manage Document & Workflow Templates', action: PERMISSION_ACTIONS.MANAGE },

      { key: PERMISSIONS.INTEGRATIONS_VIEW, label: 'View Cloud Integrations (M365, Dropbox, OneDrive)', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.INTEGRATIONS_MANAGE, label: 'Configure Cloud Integrations', action: PERMISSION_ACTIONS.MANAGE },

      { key: PERMISSIONS.BRANDING_MANAGE, label: 'Manage Firm Branding & Palette Settings', action: PERMISSION_ACTIONS.MANAGE },
      { key: PERMISSIONS.NOTIFICATIONS_MANAGE, label: 'Configure Push & Alert Notifications', action: PERMISSION_ACTIONS.MANAGE },
      { key: PERMISSIONS.AUDIT_LOGS_VIEW, label: 'View Confidential Security Audit Logs', action: PERMISSION_ACTIONS.VIEW },
      { key: PERMISSIONS.SECURITY_MANAGE, label: 'Manage 2FA, Session Timeouts & Security Policies', action: PERMISSION_ACTIONS.MANAGE },
    ],
  },
];

// All permissions list as a flat array
export const ALL_PERMISSION_KEYS = Object.values(PERMISSIONS);

/**
 * DEFAULT BASELINE PERMISSION MATRIX FOR THE 5 CLIENT ROLES
 * Per Section 5 of the Master Specification
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  // SUPER ADMIN: Unrestricted access to all capabilities
  [ROLES.SUPER_ADMIN]: [...ALL_PERMISSION_KEYS],

  // ATTORNEY: Litigation management, client advisory, own tasks, time logging, matter reports
  [ROLES.ATTORNEY]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_WORKLOAD_VIEW,

    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_EDIT,

    PERMISSIONS.MATTERS_VIEW,
    PERMISSIONS.MATTERS_CREATE,
    PERMISSIONS.MATTERS_EDIT,

    PERMISSIONS.INTAKE_VIEW,
    PERMISSIONS.INTAKE_CREATE,
    PERMISSIONS.INTAKE_CONFLICT_REVIEW,

    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,

    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_MANAGE,

    PERMISSIONS.PORTAL_PREVIEW,

    PERMISSIONS.TASKS_VIEW_OWN,
    PERMISSIONS.TASKS_VIEW_TEAM,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,

    PERMISSIONS.CALENDAR_VIEW,
    PERMISSIONS.DEADLINES_VIEW,

    PERMISSIONS.TIME_LOG,
    PERMISSIONS.TIME_REVIEW_OWN,
    PERMISSIONS.TIME_SUGGESTED_VIEW,

    PERMISSIONS.CHECKLISTS_VIEW,
    PERMISSIONS.CHECKLISTS_MANAGE,

    PERMISSIONS.BILLING_OVERVIEW_VIEW,
    PERMISSIONS.BILLING_HOURS_VIEW,
    PERMISSIONS.EXPENSES_VIEW,
    PERMISSIONS.EXPENSES_CREATE,

    PERMISSIONS.REPORTS_STAFF_VIEW,
    PERMISSIONS.REPORTS_MATTER_VIEW,
    PERMISSIONS.TEMPLATES_VIEW,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
  ],

  // PARALEGAL / STAFF: Litigation support, filings, task execution, time logging. No billing/accounting or admin by default.
  [ROLES.PARALEGAL]: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.MATTERS_VIEW,

    PERMISSIONS.INTAKE_VIEW,
    PERMISSIONS.INTAKE_CREATE,

    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,

    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_MANAGE,

    PERMISSIONS.PORTAL_PREVIEW,

    PERMISSIONS.TASKS_VIEW_OWN,
    PERMISSIONS.TASKS_VIEW_TEAM,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,

    PERMISSIONS.CALENDAR_VIEW,
    PERMISSIONS.DEADLINES_VIEW,

    PERMISSIONS.TIME_LOG,
    PERMISSIONS.TIME_REVIEW_OWN,

    PERMISSIONS.CHECKLISTS_VIEW,
    PERMISSIONS.CHECKLISTS_MANAGE,

    PERMISSIONS.REPORTS_MATTER_VIEW,
    PERMISSIONS.TEMPLATES_VIEW,
  ],

  // BILLING / ACCOUNTING STAFF: Invoicing, payments, financial reports, CosmoLex exports. No legal conflict reviews or admin.
  [ROLES.BILLING]: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.MATTERS_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.PORTAL_PREVIEW,

    PERMISSIONS.CALENDAR_VIEW,
    PERMISSIONS.DEADLINES_VIEW,

    PERMISSIONS.TIME_LOG,
    PERMISSIONS.TIME_REVIEW_OWN,
    PERMISSIONS.TIME_REVIEW_TEAM,

    PERMISSIONS.BILLING_OVERVIEW_VIEW,
    PERMISSIONS.BILLING_HOURS_VIEW,
    PERMISSIONS.EXPENSES_VIEW,
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.EXPENSES_EDIT,

    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.INVOICES_CREATE,
    PERMISSIONS.INVOICES_MANAGE,

    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_RECORD,

    PERMISSIONS.BILLING_REPORTS_VIEW,
    PERMISSIONS.OPERATING_ACCOUNT_VIEW,
    PERMISSIONS.TRUST_ACCOUNT_VIEW,

    PERMISSIONS.COSMOLEX_VIEW,
    PERMISSIONS.COSMOLEX_EXPORT,

    PERMISSIONS.REPORTS_STAFF_VIEW,
    PERMISSIONS.REPORTS_FINANCIAL_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.AUDIT_LOGS_VIEW,
  ],

  // SUPERVISOR: Team monitoring, case review, time approvals, operational reports. No user management or firm security by default.
  [ROLES.SUPERVISOR]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_WORKLOAD_VIEW,
    PERMISSIONS.DASHBOARD_APPROVALS_VIEW,

    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_EDIT,

    PERMISSIONS.MATTERS_VIEW,
    PERMISSIONS.MATTERS_CREATE,
    PERMISSIONS.MATTERS_EDIT,

    PERMISSIONS.INTAKE_VIEW,
    PERMISSIONS.INTAKE_CREATE,
    PERMISSIONS.INTAKE_CONFLICT_REVIEW,

    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,

    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_MANAGE,

    PERMISSIONS.PORTAL_PREVIEW,

    PERMISSIONS.TASKS_VIEW_OWN,
    PERMISSIONS.TASKS_VIEW_TEAM,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,

    PERMISSIONS.CALENDAR_VIEW,
    PERMISSIONS.DEADLINES_VIEW,

    PERMISSIONS.TIME_LOG,
    PERMISSIONS.TIME_REVIEW_OWN,
    PERMISSIONS.TIME_REVIEW_TEAM,
    PERMISSIONS.TIME_SUGGESTED_VIEW,
    PERMISSIONS.TIME_APPROVE,
    PERMISSIONS.TIME_REJECT,

    PERMISSIONS.CHECKLISTS_VIEW,
    PERMISSIONS.CHECKLISTS_MANAGE,

    PERMISSIONS.BILLING_OVERVIEW_VIEW,
    PERMISSIONS.BILLING_HOURS_VIEW,
    PERMISSIONS.EXPENSES_VIEW,
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.BILLING_REPORTS_VIEW,
    PERMISSIONS.OPERATING_ACCOUNT_VIEW,
    PERMISSIONS.TRUST_ACCOUNT_VIEW,

    PERMISSIONS.REPORTS_STAFF_VIEW,
    PERMISSIONS.REPORTS_MATTER_VIEW,
    PERMISSIONS.REPORTS_FINANCIAL_VIEW,
    PERMISSIONS.REPORTS_EXPORT,

    PERMISSIONS.TEMPLATES_VIEW,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.AUDIT_LOGS_VIEW,
  ],
};

/**
 * Route-to-Permission Mapping
 * Maps every URL route in router.jsx to its required functional permission.
 */
export const ROUTE_PERMISSIONS = {
  '/dashboard': PERMISSIONS.DASHBOARD_VIEW,

  '/clients': PERMISSIONS.CLIENTS_VIEW,
  '/clients/:clientId': PERMISSIONS.CLIENTS_VIEW,
  '/matters': PERMISSIONS.MATTERS_VIEW,
  '/matters/:matterId': PERMISSIONS.MATTERS_VIEW,
  '/intake': PERMISSIONS.INTAKE_VIEW,
  '/documents': PERMISSIONS.DOCUMENTS_VIEW,
  '/communications': PERMISSIONS.COMMUNICATIONS_VIEW,
  '/client-portal': PERMISSIONS.PORTAL_PREVIEW,

  '/immigration/cases': PERMISSIONS.MATTERS_VIEW,
  '/immigration/parties': PERMISSIONS.CLIENTS_VIEW,
  '/immigration/forms': PERMISSIONS.DOCUMENTS_VIEW,
  '/immigration/receipts': PERMISSIONS.MATTERS_VIEW,
  '/immigration/questionnaires': PERMISSIONS.INTAKE_VIEW,

  '/bankruptcy/cases': PERMISSIONS.MATTERS_VIEW,
  '/bankruptcy/schedules': PERMISSIONS.MATTERS_VIEW,
  '/bankruptcy/means-test': PERMISSIONS.MATTERS_VIEW,
  '/bankruptcy/exemptions': PERMISSIONS.MATTERS_VIEW,
  '/bankruptcy/plan': PERMISSIONS.MATTERS_VIEW,
  '/bankruptcy/creditor-matrix': PERMISSIONS.MATTERS_VIEW,

  '/personal-injury': PERMISSIONS.MATTERS_VIEW,
  '/personal-injury/dashboard': PERMISSIONS.MATTERS_VIEW,
  '/personal-injury/incident-liability': PERMISSIONS.MATTERS_VIEW,
  '/personal-injury/client-damages': PERMISSIONS.MATTERS_VIEW,
  '/personal-injury/insurance': PERMISSIONS.MATTERS_VIEW,
  '/personal-injury/medical-treatment': PERMISSIONS.MATTERS_VIEW,
  '/personal-injury/vendor-assignments': PERMISSIONS.MATTERS_VIEW,
  '/personal-injury/demand-packages': PERMISSIONS.MATTERS_VIEW,
  '/personal-injury/lien-register': PERMISSIONS.MATTERS_VIEW,
  '/personal-injury/settlement-calculator': PERMISSIONS.MATTERS_VIEW,

  '/litigation': PERMISSIONS.MATTERS_VIEW,
  '/litigation/dashboard': PERMISSIONS.MATTERS_VIEW,
  '/litigation/assessment': PERMISSIONS.MATTERS_VIEW,
  '/litigation/pleadings-service': PERMISSIONS.MATTERS_VIEW,
  '/litigation/scheduling': PERMISSIONS.MATTERS_VIEW,
  '/litigation/discovery': PERMISSIONS.MATTERS_VIEW,
  '/litigation/trial': PERMISSIONS.MATTERS_VIEW,

  '/probate': PERMISSIONS.MATTERS_VIEW,
  '/family-law': PERMISSIONS.MATTERS_VIEW,
  '/criminal': PERMISSIONS.MATTERS_VIEW,
  '/appeals': PERMISSIONS.MATTERS_VIEW,
  '/evictions': PERMISSIONS.MATTERS_VIEW,

  '/tasks': PERMISSIONS.TASKS_VIEW_OWN,
  '/tasks/mine': PERMISSIONS.TASKS_VIEW_OWN,
  '/tasks/team': PERMISSIONS.TASKS_VIEW_TEAM,
  '/calendar': PERMISSIONS.CALENDAR_VIEW,
  '/deadlines': PERMISSIONS.DEADLINES_VIEW,
  '/time': PERMISSIONS.TIME_LOG,
  '/time/review': PERMISSIONS.TIME_REVIEW_OWN,
  '/time/approvals': PERMISSIONS.TIME_APPROVE,
  '/time/suggested': PERMISSIONS.TIME_SUGGESTED_VIEW,
  '/checklists': PERMISSIONS.CHECKLISTS_VIEW,

  '/billing': PERMISSIONS.BILLING_OVERVIEW_VIEW,
  '/billing/hours': PERMISSIONS.BILLING_HOURS_VIEW,
  '/billing/expenses': PERMISSIONS.EXPENSES_VIEW,
  '/billing/invoices': PERMISSIONS.INVOICES_VIEW,
  '/billing/payments': PERMISSIONS.PAYMENTS_VIEW,
  '/billing/reports': PERMISSIONS.BILLING_REPORTS_VIEW,
  '/billing/operating': PERMISSIONS.OPERATING_ACCOUNT_VIEW,
  '/billing/trust': PERMISSIONS.TRUST_ACCOUNT_VIEW,
  '/billing/reconciliation': PERMISSIONS.TRUST_ACCOUNT_VIEW,
  '/billing/settlements': PERMISSIONS.BILLING_OVERVIEW_VIEW,
  '/billing/chart-of-accounts': PERMISSIONS.OPERATING_ACCOUNT_VIEW,
  '/billing/general-ledger': PERMISSIONS.OPERATING_ACCOUNT_VIEW,
  '/billing/cosmolex': PERMISSIONS.COSMOLEX_VIEW,

  '/reports/staff': PERMISSIONS.REPORTS_STAFF_VIEW,
  '/reports/matters': PERMISSIONS.REPORTS_MATTER_VIEW,
  '/reports/financial': PERMISSIONS.REPORTS_FINANCIAL_VIEW,
  '/reports/compliance': PERMISSIONS.REPORTS_MATTER_VIEW,
  '/compliance': PERMISSIONS.REPORTS_MATTER_VIEW,

  '/settings/users': PERMISSIONS.USERS_VIEW,
  '/settings/roles': PERMISSIONS.ROLES_VIEW,
  '/settings/templates': PERMISSIONS.TEMPLATES_VIEW,
  '/settings/workflows': PERMISSIONS.TEMPLATES_VIEW,
  '/settings/integrations': PERMISSIONS.INTEGRATIONS_VIEW,
  '/settings/branding': PERMISSIONS.BRANDING_MANAGE,
  '/settings/notifications': PERMISSIONS.NOTIFICATIONS_MANAGE,
  '/settings/audit-logs': PERMISSIONS.AUDIT_LOGS_VIEW,
  '/settings/security': PERMISSIONS.SECURITY_MANAGE,
};


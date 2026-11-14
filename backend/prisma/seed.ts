// ==============================================================================
// HEUGLY & BLUDWORTH Legal Practice Management SaaS - Database Seed Script
// Safe, Idempotent, Production-Grade Seed Data Implementation
// Reference: backend-docs/20-DATABASE-MIGRATION-READINESS.md
// ==============================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// -----------------------------------------------------------------------------
// 1. APPROVED 5 FOUNDATIONAL ROLES
// -----------------------------------------------------------------------------
const FOUNDATIONAL_ROLES = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full administrative control, user governance, security policies, and firm-wide ledger visibility.',
  },
  {
    id: 'attorney',
    name: 'Attorney',
    description: 'Case file management, litigation dockets, client advisory, time logging, and personal workload.',
  },
  {
    id: 'paralegal',
    name: 'Paralegal / Staff',
    description: 'Litigation support, court filings, document repository management, and task checklists.',
  },
  {
    id: 'billing',
    name: 'Billing / Accounting Staff',
    description: 'Invoicing, disbursements, fee accounting, receivables, and official CosmoLex ledger synchronization.',
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Cross-matter oversight, department workload balancing, and partner time-entry approval queues.',
  },
];

// -----------------------------------------------------------------------------
// 2. APPROVED 9 MANDATORY PRACTICE AREAS (Utah Jurisdiction)
// -----------------------------------------------------------------------------
const APPROVED_PRACTICE_AREAS = [
  {
    id: 'pa-pi',
    code: 'PI',
    name: 'Personal Injury',
    brandColor: '#ea580c',
    isActive: true,
  },
  {
    id: 'pa-bk',
    code: 'BK',
    name: 'Bankruptcy',
    brandColor: '#0284c7',
    isActive: true,
  },
  {
    id: 'pa-imm',
    code: 'IMM',
    name: 'Immigration',
    brandColor: '#059669',
    isActive: true,
  },
  {
    id: 'pa-civ',
    code: 'CIV',
    name: 'Civil/Commercial Litigation',
    brandColor: '#2563eb',
    isActive: true,
  },
  {
    id: 'pa-prob',
    code: 'PROB',
    name: 'Probate',
    brandColor: '#8b5cf6',
    isActive: true,
  },
  {
    id: 'pa-fam',
    code: 'FAM',
    name: 'Family Law',
    brandColor: '#ec4899',
    isActive: true,
  },
  {
    id: 'pa-crim',
    code: 'CRIM',
    name: 'Criminal Defense',
    brandColor: '#ef4444',
    isActive: true,
  },
  {
    id: 'pa-app',
    code: 'APP',
    name: 'Appeals',
    brandColor: '#4f46e5',
    isActive: true,
  },
  {
    id: 'pa-evict',
    code: 'EVICT',
    name: 'Landlord-Tenant/Evictions',
    brandColor: '#d97706',
    isActive: true,
  },
];

// -----------------------------------------------------------------------------
// 3. VERIFIED PERMISSION MATRIX (From frontend/src/config/permissions.js)
// -----------------------------------------------------------------------------
const ALL_PERMISSIONS = [
  // 1. Dashboard
  'dashboard:view',
  'dashboard:workload_view',
  'dashboard:approvals_view',

  // 2. Clients & Matters
  'clients:view',
  'clients:create',
  'clients:edit',
  'clients:delete',
  'matters:view',
  'matters:create',
  'matters:edit',
  'matters:delete',
  'intake:view',
  'intake:create',
  'intake:conflict_review',
  'documents:view',
  'documents:upload',
  'documents:approve',
  'documents:reject',
  'documents:send',
  'documents:delete',
  'communications:view',
  'communications:manage',
  'portal:preview',

  // 3. Tasks & Activities
  'tasks:view_own',
  'tasks:view_team',
  'tasks:create',
  'tasks:edit',
  'tasks:delete',
  'calendar:view',
  'deadlines:view',
  'time:log',
  'time:review_own',
  'time:review_team',
  'time:suggested_view',
  'time:approve',
  'time:reject',
  'checklists:view',
  'checklists:manage',

  // 4. Billing & Accounting
  'billing:overview_view',
  'billing:hours_view',
  'expenses:view',
  'expenses:create',
  'expenses:edit',
  'invoices:view',
  'invoices:create',
  'invoices:manage',
  'payments:view',
  'payments:record',
  'billing:reports_view',
  'operating:view',
  'trust:view',
  'cosmolex:view',
  'cosmolex:export',

  // 5. Reports & Settings
  'reports:staff_view',
  'reports:matter_view',
  'reports:financial_view',
  'reports:export',
  'users:view',
  'users:manage',
  'roles:view',
  'roles:manage',
  'templates:view',
  'templates:manage',
  'integrations:view',
  'integrations:manage',
  'branding:manage',
  'notifications:manage',
  'audit_logs:view',
  'security:manage',
];

const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  // Super Admin: Unrestricted (all permissions)
  super_admin: [...ALL_PERMISSIONS],

  // Attorney
  attorney: [
    'dashboard:view',
    'dashboard:workload_view',
    'clients:view',
    'clients:create',
    'clients:edit',
    'matters:view',
    'matters:create',
    'matters:edit',
    'intake:view',
    'intake:create',
    'intake:conflict_review',
    'documents:view',
    'documents:upload',
    'documents:approve',
    'documents:reject',
    'documents:send',
    'communications:view',
    'communications:manage',
    'portal:preview',
    'tasks:view_own',
    'tasks:view_team',
    'tasks:create',
    'tasks:edit',
    'calendar:view',
    'deadlines:view',
    'time:log',
    'time:review_own',
    'time:suggested_view',
    'checklists:view',
    'checklists:manage',
    'billing:overview_view',
    'billing:hours_view',
    'expenses:view',
    'expenses:create',
    'reports:staff_view',
    'reports:matter_view',
    'templates:view',
    'notifications:manage',
  ],

  // Paralegal / Staff
  paralegal: [
    'dashboard:view',
    'clients:view',
    'matters:view',
    'intake:view',
    'intake:create',
    'documents:view',
    'documents:upload',
    'communications:view',
    'communications:manage',
    'portal:preview',
    'tasks:view_own',
    'tasks:view_team',
    'tasks:create',
    'tasks:edit',
    'calendar:view',
    'deadlines:view',
    'time:log',
    'time:review_own',
    'time:suggested_view',
    'checklists:view',
    'checklists:manage',
    'expenses:view',
    'expenses:create',
    'templates:view',
    'notifications:manage',
  ],

  // Billing / Accounting Staff
  billing: [
    'dashboard:view',
    'clients:view',
    'matters:view',
    'portal:preview',
    'tasks:view_own',
    'calendar:view',
    'time:log',
    'time:review_own',
    'billing:overview_view',
    'billing:hours_view',
    'expenses:view',
    'expenses:create',
    'expenses:edit',
    'invoices:view',
    'invoices:create',
    'invoices:manage',
    'payments:view',
    'payments:record',
    'billing:reports_view',
    'operating:view',
    'trust:view',
    'cosmolex:view',
    'cosmolex:export',
    'reports:financial_view',
    'reports:export',
    'notifications:manage',
  ],

  // Supervisor
  supervisor: [
    'dashboard:view',
    'dashboard:workload_view',
    'dashboard:approvals_view',
    'clients:view',
    'clients:create',
    'clients:edit',
    'matters:view',
    'matters:create',
    'matters:edit',
    'intake:view',
    'intake:create',
    'intake:conflict_review',
    'documents:view',
    'documents:upload',
    'documents:approve',
    'documents:reject',
    'documents:send',
    'communications:view',
    'communications:manage',
    'portal:preview',
    'tasks:view_own',
    'tasks:view_team',
    'tasks:create',
    'tasks:edit',
    'calendar:view',
    'deadlines:view',
    'time:log',
    'time:review_own',
    'time:review_team',
    'time:suggested_view',
    'time:approve',
    'time:reject',
    'checklists:view',
    'checklists:manage',
    'billing:overview_view',
    'billing:hours_view',
    'expenses:view',
    'expenses:create',
    'reports:staff_view',
    'reports:matter_view',
    'reports:export',
    'templates:view',
    'templates:manage',
    'notifications:manage',
  ],
};

// -----------------------------------------------------------------------------
// 4. CHART OF ACCOUNTS (Utah RPC 1.15 Double-Entry Ledger)
// -----------------------------------------------------------------------------
const CHART_OF_ACCOUNTS = [
  {
    accountNumber: 1010,
    accountName: 'Operating Cash Account',
    accountType: 'Asset',
    isActive: true,
  },
  {
    accountNumber: 1020,
    accountName: 'IOLTA Trust Bank Account',
    accountType: 'Asset',
    isActive: true,
  },
  {
    accountNumber: 1200,
    accountName: 'Accounts Receivable',
    accountType: 'Asset',
    isActive: true,
  },
  {
    accountNumber: 2100,
    accountName: 'Client Trust Liability (Escrow)',
    accountType: 'Liability',
    isActive: true,
  },
  {
    accountNumber: 4000,
    accountName: 'Legal Fee Revenue',
    accountType: 'Revenue',
    isActive: true,
  },
  {
    accountNumber: 5000,
    accountName: 'Operating Expenses',
    accountType: 'Expense',
    isActive: true,
  },
];

// -----------------------------------------------------------------------------
// 5. DEVELOPMENT DEMO PERSONAS (STRICTLY GATED TO LOCAL DEV)
// Non-routable .test domains, bcrypt hashed passwords
// -----------------------------------------------------------------------------
const DEV_DEMO_USERS = [
  {
    userCode: 'usr-demo-1',
    name: 'Demo Managing Partner',
    email: 'demo.admin@hb-legal.test',
    role: 'super_admin',
    title: 'Managing Partner (Demo)',
    initials: 'DP',
    department: 'Executive Governance',
    billingRate: 450.00,
  },
  {
    userCode: 'usr-demo-2',
    name: 'Demo Senior Attorney',
    email: 'demo.attorney@hb-legal.test',
    role: 'attorney',
    title: 'Senior Counsel (Demo)',
    initials: 'DA',
    department: 'Civil Litigation',
    billingRate: 425.00,
  },
  {
    userCode: 'usr-demo-4',
    name: 'Demo Paralegal Staff',
    email: 'demo.paralegal@hb-legal.test',
    role: 'paralegal',
    title: 'Litigation Paralegal (Demo)',
    initials: 'DP',
    department: 'Discovery & Filings',
    billingRate: 150.00,
  },
  {
    userCode: 'usr-demo-5',
    name: 'Demo Billing Director',
    email: 'demo.billing@hb-legal.test',
    role: 'billing',
    title: 'Billing Director (Demo)',
    initials: 'DB',
    department: 'Finance & Escrow',
    billingRate: 175.00,
  },
  {
    userCode: 'usr-demo-6',
    name: 'Demo Practice Supervisor',
    email: 'demo.supervisor@hb-legal.test',
    role: 'supervisor',
    title: 'Practice Chair (Demo)',
    initials: 'DS',
    department: 'Practice Management',
    billingRate: 400.00,
  },
];

// -----------------------------------------------------------------------------
// MASTER SEED EXECUTION LOGIC
// -----------------------------------------------------------------------------
async function main() {
  console.log('================================================================');
  console.log('HEUGLY & BLUDWORTH - Database Seed Execution');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('================================================================');

  // Step 1: Seed 5 Foundational Roles
  console.log('1. Seeding 5 Foundational Roles...');
  for (const role of FOUNDATIONAL_ROLES) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {
        name: role.name,
        description: role.description,
      },
      create: role,
    });
  }
  console.log('   [SUCCESS] 5 Roles verified and synchronized.');

  // Step 2: Seed Exactly 9 Approved Practice Areas
  console.log('2. Seeding 9 Approved Practice Areas...');
  for (const pa of APPROVED_PRACTICE_AREAS) {
    await prisma.practiceArea.upsert({
      where: { id: pa.id },
      update: {
        name: pa.name,
        code: pa.code,
        brandColor: pa.brandColor,
        isActive: pa.isActive,
      },
      create: pa,
    });
  }
  console.log('   [SUCCESS] 9 Practice areas verified and synchronized.');

  // Step 3: Seed Role Permissions Matrix
  console.log('3. Seeding RBAC Role-Permission Matrix (45+ keys)...');
  let permissionCount = 0;
  for (const [roleId, permissions] of Object.entries(ROLE_PERMISSIONS_MAP)) {
    for (const permissionKey of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          uq_role_permission: {
            roleId,
            permissionKey,
          },
        },
        update: {},
        create: {
          roleId,
          permissionKey,
        },
      });
      permissionCount++;
    }
  }
  console.log(`   [SUCCESS] ${permissionCount} Role-Permission links synchronized.`);

  // Step 4: Seed Chart of Accounts (Utah RPC 1.15)
  console.log('4. Seeding Chart of Accounts...');
  for (const account of CHART_OF_ACCOUNTS) {
    await prisma.chartOfAccount.upsert({
      where: { accountNumber: account.accountNumber },
      update: {
        accountName: account.accountName,
        accountType: account.accountType,
        isActive: account.isActive,
      },
      create: account,
    });
  }
  console.log('   [SUCCESS] Chart of Accounts synchronized.');

  // Step 5: Demo Users (Strictly Gated to Development)
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldSeedDemoUsers = process.env.SEED_DEMO_USERS === 'true';

  if (!isProduction && shouldSeedDemoUsers) {
    console.log('5. Development Demo Users requested (SEED_DEMO_USERS=true)...');
    console.warn('   [SECURITY WARNING] Seeding development-only demo accounts.');
    console.warn('   [SECURITY WARNING] Never deploy demo accounts to production.');

    const demoPassword = process.env.DEV_DEMO_USER_PASSWORD || 'DevDemoPass123!';
    const passwordHash = await bcrypt.hash(demoPassword, 12);

    for (const user of DEV_DEMO_USERS) {
      await prisma.user.upsert({
        where: { email: user.email },
        // Do not overwrite existing password hashes on re-run
        update: {
          name: user.name,
          role: user.role,
          title: user.title,
          department: user.department,
          billingRate: user.billingRate,
        },
        create: {
          ...user,
          passwordHash,
          status: 'Active',
        },
      });
    }
    console.log('   [SUCCESS] 5 Development demo personas synchronized.');
  } else {
    console.log('5. Demo Users: SKIPPED (Production-safe mode). Zero user accounts seeded.');
  }

  console.log('================================================================');
  console.log('DATABASE SEEDING COMPLETE - All Entities Synchronized Idempotently');
  console.log('================================================================');
}

main()
  .catch((e) => {
    console.error('Fatal Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


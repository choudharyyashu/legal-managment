# HEUGLY & BLUDWORTH – LEGAL MANAGEMENT SOFTWARE
## Enterprise Legal Practice SaaS Frontend Application

A legal practice management SaaS dashboard custom-built for **Heugly & Bludworth**. Designed to provide a unified, role-aware operational workspace for attorneys, paralegals, partners, and billing staff.

---

## 1. Visual Theme & Branding

Inspired by the visual character of the [Utah's Lawyers](https://utahslawyers.com/) brand identity:

- **Deep Navy (`#06244B`)**: Sidebar, headers, primary navigation, authority anchors.
- **Warm Cream (`#F5F0E5`)**: Application canvas, section backgrounds, subtle dividers.
- **Terracotta (`#A4432B`)**: Primary action buttons, active tabs, urgency callouts, accents.
- **Muted Blue Grey (`#B8C0C4`)**: Supporting borders, metadata labels, secondary panels.
- **Charcoal (`#202A35`)**: High-contrast, readable typography.
- **Headings Font**: *Playfair Display* & *Cormorant Garamond* (Serif).
- **Body & UI Font**: *Inter* & *Lato* (Sans-serif).

---

## 2. Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: React Router DOM (v6)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **State Management**: React Context API (`AuthContext`, `ClientContext`, `MatterContext`, `TaskContext`, `TimeContext`)
- **Persistence**: `localStorage` (via `mockStorage.js` service)

---

## 3. Five Primary Navigation Menus

Per firm architecture requirements, all routes and modules are strictly nested within five primary menus:

1. **Dashboard** (`/dashboard`)
   - KPI metrics: Total Clients, Active Matters, My Open Tasks, Upcoming Deadlines, Pending Approvals
   - Interactive task checklists (mark tasks completed)
   - Team workload monitor (Supervisors / Partners)
   - Upcoming court hearings and calendar events
   - Quick Actions: Add Client, New Matter, Log Time

2. **Clients & Matters** (`/clients`)
   - **All Clients** (`/clients`): Search, filter by attorney/status, sort, pagination, new client creation
   - **Client Details** (`/clients/:clientId`): Multi-tab overview (Matters, Contacts, Master Records, Internal Notes, Activity)
   - **All Matters** (`/matters`): Multi-criteria filter across all 9 practice areas, court dockets, budgets
   - **Matter Details** (`/matters/:matterId`): Litigation workspace (Synopsis, Court Docket, Assigned Team, Tasks, Pleadings, Time Ledger)
   - **Intake & Conflicts** (`/intake`): Prospective client screening, adverse party search, conflict reviews (RPC 1.7)
   - **Documents** (`/documents`): Repository for pleadings, court orders, discovery telemetry, contracts
   - **Communications** (`/communications`): Client emails, phone records, formal notices
   - **Client Portal Preview** (`/client-portal`): Client-facing view; internal work product strictly hidden

3. **Tasks & Activities** (`/tasks`)
   - **My Tasks** (`/tasks/mine`): Personal schedule, deadline countdown, status transitions
   - **Team Tasks** (`/tasks/team`): Workload distribution, associate delegation
   - **Firm Calendar** (`/calendar`): Month, Week, Day, and Agenda views with court hearing badges
   - **Court Deadlines** (`/deadlines`): URCP Rule 26 cutoffs, summary judgment deadlines, statutes of limitations
   - **Time Tracking** (`/time`): Daily billable logging, rate calculator, UTBMS activity coding
   - **Daily Time Review** (`/time/review`): Grouped day-by-day audit to identify unsubmitted hours
   - **Time Approvals** (`/time/approvals`): Partner approval queue with reason-backed rejections
   - **Workflow Checklists** (`/checklists`): Litigation & trust administration SOP compliance checklists

4. **Billing & Accounting** (`/billing`)
   - **Billing Overview** (`/billing`): Realization charts, monthly collection comparison, practice breakdown
   - **Billable Hours** (`/billing/hours`): Approved entries ready for invoice drafting or ledger export
   - **Expenses** (`/billing/expenses`): Out-of-pocket litigation disbursements (court fees, expert retainers)
   - **Invoices** (`/billing/invoices`): Professional invoice generator, payment status, printable letterhead statements
   - **Payment Records** (`/billing/payments`): ACH, FedWire, and trust retainer drawdowns
   - **Operating Account** (`/billing/operating`): Cash receipts and operational disbursements
   - **Trust Account (Future)** (`/billing/trust`): Utah Bar IOLTA compliance & planned Phase 2 placeholder
   - **CosmoLex Bridge** (`/billing/cosmolex`): Official accounting export bridge and transmission history

5. **Reports & Settings** (`/settings`)
   - **Staff Reports** (`/reports/staff`): Billable target performance vs actual
   - **Matter Reports** (`/reports/matters`): Budget vs actual fees, case duration
   - **Financial Reports** (`/reports/financial`): Aging receivables (30/60/90 days), collection yields
   - **User Management** (`/settings/users`): Account provisioning, billing rates, roles
   - **Roles & Permissions** (`/settings/roles`): Interactive 5-role RBAC capability matrix
   - **Document Templates** (`/settings/templates`): Retainer agreements, court appearances, subpoenas
   - **External Integrations** (`/settings/integrations`): M365, Outlook, OneDrive, Dropbox, CosmoLex
   - **Firm Branding** (`/settings/branding`): Practice typography, color tokens, Utah state bar details
   - **Audit Logs** (`/settings/audit-logs`): Security timestamps and sensitive transaction history
   - **Security Settings** (`/settings/security`): 2FA enforcement, inactivity lockouts, Utah RPC 1.6 compliance

---

## 4. Five Demo User Roles (Role Switcher)

Click the **Role** pill in the top navigation bar at any time to switch perspective:

1. **Super Admin** (*Eleanor Heugly, Esq.* - Managing Partner): Full access across all modules, user administration, security.
2. **Attorney** (*Thomas Bludworth, Esq.* - Senior Partner): Matter management, task execution, time entry.
3. **Paralegal / Staff** (*Marcus Vance* - Senior Paralegal): Case file support, task execution, document uploads.
4. **Billing / Accounting Staff** (*Rachel Adams* - Billing Director): Invoices, payments, expenses, CosmoLex exports.
5. **Supervisor** (*David Sterling, Esq.* - Practice Supervisor): Team workload monitoring, time entry approvals.

---

## 5. End-to-End User Flows

- **Flow 1: Client Creation & Matter Opening**: Clients &rarr; Add Client &rarr; Save &rarr; Client Details &rarr; New Matter for Client.
- **Flow 2: Intake & Conflict Clearance**: Intake &rarr; New Intake &rarr; Enter Adverse Parties &rarr; Review &rarr; Mark Cleared &rarr; Convert to Client.
- **Flow 3: Time Logging & Partner Approval**: Log Time &rarr; Select Matter &rarr; Submit &rarr; Switch to Supervisor &rarr; Time Approvals &rarr; Approve/Reject with Note.
- **Flow 4: CosmoLex Batch Export**: Billing &rarr; Billable Hours &rarr; Select Approved Entries &rarr; Export to CosmoLex &rarr; Batch synchronized.
- **Flow 5: Invoicing & Payment**: Invoices &rarr; Generate Statement &rarr; View Print Preview &rarr; Apply Payment Record.

---

## 6. Installation & Local Development

### Prerequisites
- Node.js 18+ (tested on Node v24.18.0)
- npm 9+ (tested on npm 11.16.0)

### Setup Instructions

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser at:
# http://localhost:3000 (or the port Vite provides)

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

---

## 7. Folder Architecture

```text
heugly-bludworth/
├── public/
│   ├── images/
│   ├── icons/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── router.jsx
│   │   └── providers/
│   │       └── AppProvider.jsx
│   ├── assets/
│   │   ├── images/
│   │   └── fonts/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   ├── Breadcrumbs.jsx
│   │   │   └── MobileNavigation.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx, Input.jsx, Select.jsx, Modal.jsx, Drawer.jsx,
│   │   │   ├── Badge.jsx, Tabs.jsx, DataTable.jsx, DatePicker.jsx,
│   │   │   └── Dropdown.jsx, EmptyState.jsx, ConfirmDialog.jsx, Toast.jsx
│   │   └── shared/
│   │       ├── PageHeader.jsx, StatCard.jsx, SearchBar.jsx,
│   │       └── FilterBar.jsx, StatusBadge.jsx, ActivityTimeline.jsx
│   ├── features/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── matters/
│   │   ├── intake/
│   │   ├── documents/
│   │   ├── communications/
│   │   ├── tasks/
│   │   ├── calendar/
│   │   ├── time-tracking/
│   │   ├── billing/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── integrations/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ClientContext.jsx
│   │   ├── MatterContext.jsx
│   │   ├── TaskContext.jsx
│   │   └── TimeContext.jsx
│   ├── data/
│   │   ├── mockClients.js, mockMatters.js, mockTasks.js, mockCalendar.js,
│   │   ├── mockTimeEntries.js, mockInvoices.js, mockExpenses.js,
│   │   └── mockUsers.js, mockDocuments.js, practiceAreas.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── usePermissions.js
│   ├── services/
│   │   └── mockStorage.js
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── formatCurrency.js
│   │   └── constants.js
│   ├── styles/
│   │   ├── theme.css
│   │   └── globals.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 8. Client Boundary Disclaimer

- **CosmoLex System Boundary**: CosmoLex remains the authoritative general ledger and trust accounting system.
- **Trust Accounting**: Client trust ledger reconciliation is scheduled for Phase 2 implementation.
- **Privacy Notice**: Internal attorney notes and confidential work product are strictly excluded from the Client Portal preview.


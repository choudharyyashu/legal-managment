# 03 – DATABASE DESIGN & RELATIONAL SCHEMA (MySQL 8.4 LTS)

**Firm Name:** Heugly & Bludworth, Attorneys at Law  
**Database Engine:** MySQL 8.4 LTS (Long-Term Support)  
**Storage Engine:** InnoDB (Strict ACID Compliance)  
**Character Set & Collation:** `utf8mb4` / `utf8mb4_0900_ai_ci`  
**ORM:** Prisma ORM 5.x (`provider = "mysql"`)  
**Schema Integrity Standard:** Strict Foreign Key Constraints, Enforced `CHECK` Constraints, InnoDB Pessimistic Locking, and Exact Financial Decimals (`DECIMAL(12, 2)`)

---

## 1. MySQL 8.4 Relational Conventions & Data Types

### 1.1 Type System & Field Conventions
- **Primary Keys**: UUID v4 strings stored as `VARCHAR(36)` with MySQL 8.4 native default `DEFAULT (UUID())`. Handled in Prisma via `@id @default(uuid()) @db.VarChar(36)`. Human-readable unique business references (`CLI-1001`, `MAT-2025-0101`, `HB-2025-001`, `TIM-501`) are indexed as `VARCHAR(50) UNIQUE NOT NULL`.
- **Monetary Precision**: All monetary values (`hourly_rate`, `budget`, `balance`, `amount`, `gross_settlement`, `debit`, `credit`) are typed as `DECIMAL(12, 2)` (or `DECIMAL(10, 2)` for rates). Float/double data types are strictly prohibited in financial ledgers.
- **Date & Timestamps**: Timestamps are stored as `DATETIME(3)` in UTC with `DEFAULT CURRENT_TIMESTAMP(3)` and `ON UPDATE CURRENT_TIMESTAMP(3)`. Dates without times (e.g. `due_date`, `open_date`) use native `DATE`.
- **Dynamic Questionnaires**: Practice-area questionnaires (Form I-130, Means-Test Form 122, Filevine workflow auto-tasks) utilize native MySQL `JSON` columns.
- **Full-Text Document Search**: The document vault utilizes native InnoDB `FULLTEXT` indexing on `ocr_content` enabling `MATCH(ocr_content) AGAINST(? IN NATURAL LANGUAGE MODE)`.
- **Check Constraints**: MySQL 8.4 strictly enforces `CHECK` constraints (e.g., `CHECK (balance >= 0.00)` on trust sub-ledgers and `CHECK (hours > 0)` on time entries).

---

## 2. Relational Table DDL Specifications (MySQL 8.4 LTS)

### 2.1 Identity, Users & RBAC

#### `users`
Represents firm personnel (managing partners, associates, paralegals, billing directors).
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_code VARCHAR(20) NOT NULL, -- e.g. 'usr-1'
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,
    role VARCHAR(50) NOT NULL, -- 'super_admin', 'attorney', 'paralegal', 'billing', 'supervisor'
    title VARCHAR(100) NULL,
    initials VARCHAR(10) NOT NULL,
    department VARCHAR(100) NULL,
    billing_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active', 'Inactive'
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(255) NULL,
    last_login_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_users_code (user_code),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `roles` & `role_permissions`
Granular RBAC matrix defining the 45+ capabilities configured in `permissions.js`.
```sql
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY, -- 'super_admin', 'attorney', 'paralegal', 'billing', 'supervisor'
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE role_permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    role_id VARCHAR(50) NOT NULL,
    permission_key VARCHAR(100) NOT NULL, -- e.g. 'time:approve', 'trust:view'
    granted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_role_permission (role_id, permission_key),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

### 2.2 Clients, Intake & Conflicts (Utah RPC 1.7)

#### `clients`
Central 360° client profile entity.
```sql
CREATE TABLE clients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_number VARCHAR(50) NOT NULL, -- e.g. 'CLI-1001'
    name VARCHAR(255) NOT NULL,
    client_type VARCHAR(50) NOT NULL, -- 'Organization', 'Individual', 'Trust / Estate', 'Government / Public'
    primary_contact VARCHAR(255) NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NULL,
    assigned_attorney_id VARCHAR(36) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active', 'Inactive'
    notes TEXT NULL, -- Privileged Internal Notes (Utah RPC 1.6)
    portal_access_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_clients_number (client_number),
    KEY idx_clients_search (name, email, client_number),
    CONSTRAINT fk_clients_attorney FOREIGN KEY (assigned_attorney_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `intakes` & `conflict_search_logs`
Prospective client intake screening and mandatory adverse party conflict reviews.
```sql
CREATE TABLE intakes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    intake_number VARCHAR(50) NOT NULL, -- e.g. 'INT-901'
    prospective_client VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    practice_area_id VARCHAR(50) NULL,
    adverse_parties TEXT NOT NULL,
    matter_summary TEXT NOT NULL,
    dispute_amount DECIMAL(12, 2) DEFAULT 0.00,
    jurisdiction_venue VARCHAR(255) NULL,
    conflict_status VARCHAR(50) NOT NULL DEFAULT 'Not Started', -- 'Not Started', 'In Review', 'Cleared', 'Conflict Identified'
    reviewed_by_user_id VARCHAR(36) NULL,
    reviewed_at DATETIME(3) NULL,
    conflict_notes TEXT NULL,
    converted_to_client BOOLEAN NOT NULL DEFAULT FALSE,
    converted_client_id VARCHAR(36) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_intakes_number (intake_number),
    CONSTRAINT fk_intakes_practice_area FOREIGN KEY (practice_area_id) REFERENCES practice_areas(id) ON DELETE SET NULL,
    CONSTRAINT fk_intakes_reviewer FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_intakes_client FOREIGN KEY (converted_client_id) REFERENCES clients(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE conflict_search_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    intake_id VARCHAR(36) NOT NULL,
    queried_name VARCHAR(255) NOT NULL,
    matched_entity_type VARCHAR(50) NOT NULL, -- 'Client', 'AdverseParty', 'Witness'
    matched_record_id VARCHAR(100) NOT NULL,
    searched_by_user_id VARCHAR(36) NOT NULL,
    searched_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_conflict_logs_intake FOREIGN KEY (intake_id) REFERENCES intakes(id) ON DELETE CASCADE,
    CONSTRAINT fk_conflict_logs_user FOREIGN KEY (searched_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

### 2.3 Matters & Workflows (Filevine Model)

#### `practice_areas`
The 9 firm practice disciplines.
```sql
CREATE TABLE practice_areas (
    id VARCHAR(50) PRIMARY KEY, -- 'pa-1' through 'pa-9'
    name VARCHAR(150) NOT NULL,
    code VARCHAR(10) NOT NULL, -- 'CIV', 'FAM', 'CRIM', 'EST', 'CORP', 'PROP', 'INJ', 'MUN', 'LAB'
    brand_color VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_practice_areas_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `matters`
Master legal matter docket.
```sql
CREATE TABLE matters (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    matter_number VARCHAR(50) NOT NULL, -- e.g. '25-CV-0101'
    client_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    practice_area_id VARCHAR(50) NOT NULL,
    current_stage_id VARCHAR(50) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- 'Active', 'In Discovery', 'Trial Prep', 'Closed'
    responsible_attorney_id VARCHAR(36) NOT NULL,
    billing_type VARCHAR(50) NOT NULL, -- 'Hourly', 'Flat Fee', 'Contingency', 'Pro Bono'
    hourly_rate DECIMAL(10, 2) NULL,
    flat_fee_amount DECIMAL(12, 2) NULL,
    contingency_percentage DECIMAL(5, 2) NULL,
    budget DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    open_date DATE NOT NULL,
    close_date DATE NULL,
    statute_of_limitations DATE NULL,
    next_court_date DATETIME(3) NULL,
    court_name VARCHAR(255) NULL,
    judge VARCHAR(150) NULL,
    case_docket_number VARCHAR(100) NULL,
    description TEXT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_matters_number (matter_number),
    KEY idx_matters_client (client_id),
    KEY idx_matters_attorney (responsible_attorney_id),
    CONSTRAINT fk_matters_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_matters_practice_area FOREIGN KEY (practice_area_id) REFERENCES practice_areas(id) ON DELETE RESTRICT,
    CONSTRAINT fk_matters_attorney FOREIGN KEY (responsible_attorney_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `matter_staff_assignments`
Junction table tracking legal team assignments (ethical wall boundary).
```sql
CREATE TABLE matter_staff_assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    matter_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    assignment_role VARCHAR(50) NOT NULL, -- 'Lead Counsel', 'Associate', 'Paralegal', 'Reviewer'
    assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_matter_staff (matter_id, user_id),
    CONSTRAINT fk_matter_staff_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE CASCADE,
    CONSTRAINT fk_matter_staff_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `workflow_stages` & `matter_stage_histories`
Configurable multi-stage Filevine-style workflow templates.
```sql
CREATE TABLE workflow_stages (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'civ-1', 'fam-2'
    practice_area_id VARCHAR(50) NOT NULL,
    stage_name VARCHAR(150) NOT NULL,
    stage_code VARCHAR(20) NOT NULL,
    stage_order INT NOT NULL,
    required_fields JSON NOT NULL, -- Array of gatekeeper field names
    auto_tasks JSON NOT NULL,      -- Array of { title, priority, dueDays, role }
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_workflow_stages_pa FOREIGN KEY (practice_area_id) REFERENCES practice_areas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE matter_stage_histories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    matter_id VARCHAR(36) NOT NULL,
    from_stage_id VARCHAR(50) NULL,
    to_stage_id VARCHAR(50) NOT NULL,
    transitioned_by_user_id VARCHAR(36) NOT NULL,
    verified_gatekeepers JSON NOT NULL,
    transitioned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_stage_histories_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE CASCADE,
    CONSTRAINT fk_stage_histories_to_stage FOREIGN KEY (to_stage_id) REFERENCES workflow_stages(id) ON DELETE RESTRICT,
    CONSTRAINT fk_stage_histories_user FOREIGN KEY (transitioned_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

### 2.4 Tasks, Calendar & Court Deadlines (Utah URCP Rule 6)

#### `tasks`
Individual and team assignments with priorities and reminders.
```sql
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_code VARCHAR(50) NOT NULL, -- e.g. 'TSK-101'
    matter_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    assigned_to_user_id VARCHAR(36) NOT NULL,
    created_by_user_id VARCHAR(36) NOT NULL,
    due_date DATE NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium', -- 'Urgent', 'High', 'Medium', 'Low'
    status VARCHAR(30) NOT NULL DEFAULT 'Not Started', -- 'Not Started', 'In Progress', 'Completed', 'Blocked'
    completed_at DATETIME(3) NULL,
    reminder_setting VARCHAR(50) DEFAULT '1 day prior',
    urcp_rule_reference VARCHAR(50) NULL, -- e.g. 'URCP Rule 26(a)'
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_tasks_code (task_code),
    KEY idx_tasks_assigned_due (assigned_to_user_id, due_date, status),
    CONSTRAINT fk_tasks_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_assignee FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_tasks_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `calendar_events`
Court hearings, depositions, and statutory filing deadlines.
```sql
CREATE TABLE calendar_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    matter_id VARCHAR(36) NULL,
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'Court Hearing', 'Deposition', 'Mediation', 'Trial', 'Filing Deadline'
    start_time DATETIME(3) NOT NULL,
    end_time DATETIME(3) NOT NULL,
    location VARCHAR(255) NULL,
    judge VARCHAR(150) NULL,
    is_court_appearance BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_user_id VARCHAR(36) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_calendar_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE CASCADE,
    CONSTRAINT fk_calendar_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

### 2.5 Time Tracking, Passive Capture & Suggested Billing

#### `time_entries`
Official billable and non-billable time records.
```sql
CREATE TABLE time_entries (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    entry_code VARCHAR(50) NOT NULL, -- e.g. 'TIM-501'
    matter_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(12, 2) GENERATED ALWAYS AS (hours * rate) STORED,
    activity_type VARCHAR(100) NOT NULL, -- e.g. 'Court Appearance', 'Legal Research'
    activity_code VARCHAR(50) NULL, -- UTBMS / LEDES code, e.g. 'A104'
    description TEXT NOT NULL,
    is_billable BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(30) NOT NULL DEFAULT 'Submitted', -- 'Draft', 'Submitted', 'Approved', 'Rejected', 'Billed'
    approved_by_user_id VARCHAR(36) NULL,
    approved_at DATETIME(3) NULL,
    rejection_comment TEXT NULL,
    exported_to_cosmolex BOOLEAN NOT NULL DEFAULT FALSE,
    export_batch_id VARCHAR(50) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_time_entries_code (entry_code),
    KEY idx_time_matter_status (matter_id, status),
    KEY idx_time_user_date (user_id, date),
    CONSTRAINT chk_time_hours CHECK (hours > 0),
    CONSTRAINT chk_time_rate CHECK (rate >= 0),
    CONSTRAINT fk_time_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE RESTRICT,
    CONSTRAINT fk_time_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_time_approver FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `suggested_billing_captures`
Telemetry and passive capture records (emails, phone calls, Word doc edits).
```sql
CREATE TABLE suggested_billing_captures (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    source_type VARCHAR(50) NOT NULL, -- 'Outlook Email', 'Telephone Call', 'Word Document'
    source_identifier VARCHAR(255) NOT NULL, -- Message-ID, VOIP Call ID, File Hash
    matter_id VARCHAR(36) NULL,
    date DATE NOT NULL,
    actual_duration_seconds INT NOT NULL,
    suggested_hours DECIMAL(4, 2) NOT NULL, -- Rounded to 0.1 hr increment
    match_confidence INT NOT NULL,
    activity_description TEXT NOT NULL,
    detected_rate DECIMAL(10, 2) NULL,
    is_converted BOOLEAN NOT NULL DEFAULT FALSE,
    converted_time_entry_id VARCHAR(36) NULL,
    is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_suggested_source (source_identifier),
    CONSTRAINT chk_confidence_range CHECK (match_confidence BETWEEN 0 AND 100),
    CONSTRAINT fk_suggested_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE SET NULL,
    CONSTRAINT fk_suggested_time_entry FOREIGN KEY (converted_time_entry_id) REFERENCES time_entries(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

### 2.6 Billing, Invoices & Expenses

#### `expenses`
Disbursements incurred on behalf of a matter.
```sql
CREATE TABLE expenses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    expense_code VARCHAR(50) NOT NULL, -- e.g. 'EXP-301'
    matter_id VARCHAR(36) NOT NULL,
    incurred_by_user_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    vendor_name VARCHAR(255) NULL,
    receipt_document_id VARCHAR(36) NULL,
    is_billable BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(30) NOT NULL DEFAULT 'Unbilled', -- 'Unbilled', 'Billed', 'Reimbursed'
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_expenses_code (expense_code),
    CONSTRAINT chk_expense_amount CHECK (amount > 0),
    CONSTRAINT fk_expenses_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE RESTRICT,
    CONSTRAINT fk_expenses_user FOREIGN KEY (incurred_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `invoices` & `invoice_line_items`
Accounts receivable statements.
```sql
CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_number VARCHAR(50) NOT NULL, -- e.g. 'HB-2025-001'
    client_id VARCHAR(36) NOT NULL,
    matter_id VARCHAR(36) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    balance_due DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status VARCHAR(30) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Sent', 'Paid', 'Partial', 'Overdue'
    sent_at DATETIME(3) NULL,
    notes TEXT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_invoices_number (invoice_number),
    CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE invoice_line_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_id VARCHAR(36) NOT NULL,
    item_type VARCHAR(20) NOT NULL, -- 'Time', 'Expense'
    time_entry_id VARCHAR(36) NULL,
    expense_id VARCHAR(36) NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(5, 2) NOT NULL,
    unit_rate DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_line_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_line_items_time FOREIGN KEY (time_entry_id) REFERENCES time_entries(id) ON DELETE SET NULL,
    CONSTRAINT fk_line_items_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `payment_records`
Incoming cash receipts, ACH, credit card, and trust drawdowns.
```sql
CREATE TABLE payment_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    payment_reference VARCHAR(50) NOT NULL, -- e.g. 'PAY-8812'
    invoice_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(36) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'FedWire', 'ACH', 'Credit Card', 'Trust Retainer Drawdown'
    destination_account VARCHAR(50) NOT NULL, -- 'Operating Account', 'IOLTA Trust Account'
    transaction_reference VARCHAR(100) NULL,
    received_date DATE NOT NULL,
    recorded_by_user_id VARCHAR(36) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_payments_ref (payment_reference),
    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_user FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

### 2.7 Trust Accounting, General Ledger & 3-Way Reconciliation (Utah RPC 1.15)

#### `trust_sub_ledgers` (Client Trust Accounts)
Enforces anti-commingling rules. A client's trust funds can never be negative. MySQL 8.4 enforces the `CHECK` constraint.
```sql
CREATE TABLE trust_sub_ledgers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ledger_code VARCHAR(50) NOT NULL, -- e.g. 'TR-1001'
    client_id VARCHAR(36) NOT NULL,
    matter_id VARCHAR(36) NOT NULL,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    last_audit_date DATE NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_trust_ledger_code (ledger_code),
    UNIQUE KEY uq_trust_matter (matter_id),
    CONSTRAINT chk_positive_trust_balance CHECK (balance >= 0.00), -- Anti-commingling enforcement
    CONSTRAINT fk_trust_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trust_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `trust_transactions`
Audited transaction log for all client retainer deposits and drawdowns.
```sql
CREATE TABLE trust_transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    trust_sub_ledger_id VARCHAR(36) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'Deposit', 'Earned Fee Drawdown', 'Disbursement', 'Refund'
    amount DECIMAL(12, 2) NOT NULL, -- Positive for deposits, negative for disbursements
    running_balance DECIMAL(12, 2) NOT NULL,
    source_reference VARCHAR(100) NOT NULL,
    authorized_by_user_id VARCHAR(36) NOT NULL,
    purpose TEXT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_trust_trans_ledger FOREIGN KEY (trust_sub_ledger_id) REFERENCES trust_sub_ledgers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_trust_trans_user FOREIGN KEY (authorized_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `chart_of_accounts` & `general_ledger_entries`
Native double-entry general ledger.
```sql
CREATE TABLE chart_of_accounts (
    account_number INT PRIMARY KEY, -- 1010 (Operating Cash), 1020 (IOLTA Trust Bank), 2100 (Trust Liability)
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE general_ledger_journals (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    journal_number VARCHAR(50) NOT NULL, -- e.g. 'JRN-2026-0042'
    transaction_date DATE NOT NULL,
    memo TEXT NOT NULL,
    created_by_user_id VARCHAR(36) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_journals_number (journal_number),
    CONSTRAINT fk_journals_user FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE general_ledger_entries (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    journal_id VARCHAR(36) NOT NULL,
    account_number INT NOT NULL,
    debit DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    credit DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    matter_id VARCHAR(36) NULL,
    CONSTRAINT chk_debit_positive CHECK (debit >= 0),
    CONSTRAINT chk_credit_positive CHECK (credit >= 0),
    CONSTRAINT chk_debit_or_credit CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)),
    CONSTRAINT fk_gl_entries_journal FOREIGN KEY (journal_id) REFERENCES general_ledger_journals(id) ON DELETE CASCADE,
    CONSTRAINT fk_gl_entries_account FOREIGN KEY (account_number) REFERENCES chart_of_accounts(account_number) ON DELETE RESTRICT,
    CONSTRAINT fk_gl_entries_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### `three_way_reconciliations`
Monthly audit balances verifying Utah RPC 1.15 compliance.
```sql
CREATE TABLE three_way_reconciliations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reconciliation_month VARCHAR(7) NOT NULL, -- '2026-11'
    bank_statement_balance DECIMAL(12, 2) NOT NULL,
    deposits_in_transit DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    outstanding_checks DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    adjusted_bank_balance DECIMAL(12, 2) NOT NULL, -- Pillar 1
    gl_trust_liability_balance DECIMAL(12, 2) NOT NULL, -- Pillar 2 (Account 2100)
    client_subledgers_total_balance DECIMAL(12, 2) NOT NULL, -- Pillar 3
    reconciliation_variance DECIMAL(12, 2) NOT NULL, -- Must be 0.00
    is_balanced BOOLEAN NOT NULL,
    audited_by_user_id VARCHAR(36) NOT NULL,
    audit_certificate_pdf_url TEXT NULL,
    reconciled_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_reconciliations_month (reconciliation_month),
    CONSTRAINT fk_reconciliation_auditor FOREIGN KEY (audited_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

### 2.8 Document Storage, OCR & Privilege Management

#### `documents` & `document_versions`
Vault tracking versions, OCR text, and Utah RPC 1.6 privilege classifications.
```sql
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    document_code VARCHAR(50) NOT NULL, -- e.g. 'DOC-401'
    matter_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Pleadings', 'Orders', 'Discovery', 'Contracts', 'Correspondence'
    current_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    is_privileged BOOLEAN NOT NULL DEFAULT FALSE,
    privilege_type VARCHAR(100) NULL, -- 'Attorney Work Product (Rule 1.6)', 'Confidential Communication'
    ocr_content LONGTEXT NULL, -- Full searchable OCR text
    bates_number_start VARCHAR(50) NULL,
    bates_number_end VARCHAR(50) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_documents_code (document_code),
    FULLTEXT KEY idx_doc_ocr_search (ocr_content), -- MySQL InnoDB FULLTEXT Index
    CONSTRAINT fk_documents_matter FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE CASCADE,
    CONSTRAINT fk_documents_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE document_versions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    document_id VARCHAR(36) NOT NULL,
    version_label VARCHAR(20) NOT NULL, -- 'v1.0', 'v2.0', 'v2.1'
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'PDF', 'DOCX', 'XLSX'
    file_size_bytes BIGINT NOT NULL,
    s3_storage_key VARCHAR(500) NOT NULL,
    sha256_checksum VARCHAR(64) NOT NULL,
    uploaded_by_user_id VARCHAR(36) NOT NULL,
    revision_notes TEXT NULL,
    uploaded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_doc_version (document_id, version_label),
    CONSTRAINT fk_doc_versions_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_versions_user FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

### 2.9 Immutable Audit Logs & MySQL Tamper-Proof Triggers

#### `audit_logs` & MySQL Triggers
In MySQL 8.4, immutability is enforced via two triggers utilizing `SIGNAL SQLSTATE '45000'`:
```sql
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'LOGIN_SUCCESS', 'DOCUMENT_DOWNLOAD', 'TRUST_DISBURSEMENT', 'ROLE_CHANGE'
    resource_type VARCHAR(50) NOT NULL, -- 'User', 'Matter', 'Document', 'TrustAccount'
    resource_id VARCHAR(100) NULL,
    details JSON NOT NULL,
    ip_address VARCHAR(50) NULL,
    user_agent TEXT NULL,
    timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    KEY idx_audit_timestamp (timestamp DESC),
    KEY idx_audit_resource (resource_type, resource_id),
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DELIMITER //

CREATE TRIGGER trg_protect_audit_logs_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Audit records are immutable and cannot be updated under Utah State Bar compliance rules.';
END //

CREATE TRIGGER trg_protect_audit_logs_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Audit records are immutable and cannot be deleted under Utah State Bar compliance rules.';
END //

DELIMITER ;
```

---

## 3. Mapping Frontend Mock Fields to MySQL Schema

| Frontend Mock Object | Frontend Mock Field | MySQL Table | MySQL Column & Type | Notes / Transformations |
| :--- | :--- | :--- | :--- | :--- |
| `MOCK_CLIENTS` | `id` (`CLI-1001`) | `clients` | `client_number VARCHAR(50)` | Preserved as human-readable business key. |
| `MOCK_CLIENTS` | `assignedAttorneyId` | `clients` | `assigned_attorney_id VARCHAR(36)` | Foreign key referencing `users.id`. |
| `MOCK_CLIENTS` | `outstandingBalance` | N/A (Dynamic) | Computed via SQL | Sum of unpaid invoices (`balance_due`). |
| `MOCK_MATTERS` | `id` (`MAT-2025-0101`) | `matters` | `matter_number VARCHAR(50)` | Unique matter business docket code. |
| `MOCK_MATTERS` | `unbilledHours` | N/A (Dynamic) | Computed via SQL | Sum of `hours` where `status = 'Approved'` and unbilled. |
| `MOCK_TIME_ENTRIES` | `hours` & `rate` | `time_entries` | `hours`, `rate DECIMAL(12, 2)` | Exact `DECIMAL` types. `amount` is stored generated. |
| `MOCK_DOCUMENTS` | `isPrivileged` | `documents` | `is_privileged BOOLEAN` | Utah RPC 1.6 filter column. |
| `MOCK_DOCUMENTS` | `versionHistory` | `document_versions` | Normalized rows | Multiple records linked by `document_id`. |
| `MOCK_BANKRUPTCY_CASES`| `schedules` | `bankruptcy_schedules`| Normalized rows | Stored in dedicated schedule tables. |
| `MOCK_IMMIGRATION_CASES`| `questionnaireData` | `immigration_cases` | `questionnaire_data JSON` | Stored in native MySQL `JSON` column. |

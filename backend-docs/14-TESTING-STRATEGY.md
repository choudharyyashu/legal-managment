# 14 – TESTING STRATEGY & QUALITY ASSURANCE

**Firm Name:** Heugly & Bludworth, Attorneys at Law  
**Testing Frameworks:** Vitest • Supertest • Testcontainers (MySQL 8.4 LTS)  
**Standard:** 100% Test Coverage on Financial Ledgers, Trust Accounting & Ethical Walls

---

## 1. Test Pyramid & Quality Standards

```mermaid
graph TD
    subgraph Test Pyramid
        E2E[End-to-End User Flow Tests<br/>Cypress / Playwright<br/>Intake -> Matter -> Time -> Invoice -> Trust]
        INT[API Integration & Database Tests<br/>Supertest + Testcontainers (MySQL 8.4 LTS)<br/>Real DB Transactions & Check Constraints]
        UNIT[Isolated Unit Tests<br/>Vitest<br/>Settlement Math, 3-Way Reconcile, Means-Test, URCP Rule 6]
    end

    UNIT --> INT
    INT --> E2E
```

| Test Level | Scope | Execution Target | Automation Trigger |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Financial formulas, URCP deadline calculators, Means-test evaluations, Zod validation schemas. | In-memory, mocked dependencies. Run in $< 5$ seconds. | Pre-commit hook & every PR. |
| **Integration Tests** | All Express `/api/v1` routes, Prisma queries, check constraints, foreign key cascades, JWT auth. | Dedicated ephemeral MySQL 8.4 container (Testcontainers). | Pull Request CI pipeline. |
| **Security & RBAC Tests** | Ethical wall boundaries, inactive user blocking, privilege exclusions from portal endpoints. | Isolated test suite with all 5 role tokens. | Nightly build & CI pipeline. |
| **Financial Audit Tests** | 3-way reconciliation variance math, anti-commingling violations, double-entry journal balance. | Zero-tolerance test suite (100% pass mandatory). | Every release candidate. |
| **Load & Stress Tests** | 50 to 150 concurrent users querying dockets, logging time, uploading files. | K6 / Artillery load testing script. | Pre-deployment staging gate. |

---

## 2. Unit Testing Specification (Vitest)

Unit tests focus on pure deterministic business logic without external network dependencies:

### 2.1 Utah RPC 1.15 Three-Way Reconciliation Invariance Test
Verifies that any non-zero variance between bank statement, general ledger, and client sub-ledgers throws a validation error:
```typescript
describe('ThreeWayReconciliationEngine', () => {
  it('should balance when all three pillars equal $74,278.00', () => {
    const result = calculateThreeWayReconciliation({
      bankStatementBalance: 74278.0,
      depositsInTransit: 1440.0,
      outstandingChecks: 1440.0,
      glTrustBalance: 74278.0,
      clientSubledgers: [
        { clientName: 'Wasatch Logistics', balance: 25000.0 },
        { clientName: 'Dr. Evelyn Martinez', balance: 12500.0 },
        { clientName: 'Elena Rostova', balance: 1440.0 },
        { clientName: 'Rachel Walker', balance: 338.0 },
        { clientName: 'Apex Horizon', balance: 35000.0 },
      ]
    });

    expect(result.variance).toBe(0.00);
    expect(result.isBalanced).toBe(true);
    expect(result.status).toBe('In Balance (Utah RPC 1.15 Compliant)');
  });

  it('should reject audit certification if variance is non-zero', () => {
    const result = calculateThreeWayReconciliation({
      bankStatementBalance: 75000.0, // Induces $722 discrepancy
      depositsInTransit: 0,
      outstandingChecks: 0,
      glTrustBalance: 74278.0,
      clientSubledgers: [{ clientName: 'Apex Horizon', balance: 74278.0 }]
    });

    expect(result.variance).toBeGreaterThan(0.00);
    expect(result.isBalanced).toBe(false);
  });
});
```

### 2.2 Contingency Settlement Recovery Math (Utah RPC 1.5(c))
Verifies itemized deduction integrity:
```typescript
describe('SettlementCalculator', () => {
  it('should correctly compute client remittance from gross recovery', () => {
    const summary = computeContingencyDisbursement({
      grossSettlement: 250000.00,
      contingencyPercentage: 33.33,
      caseCosts: [12500.00, 4800.00, 950.00], // Total: $18,250
      medicalLiens: [18500.00, 3900.00]       // Total: $22,400
    });

    expect(summary.attorneyFee).toBe(83325.00);
    expect(summary.totalCosts).toBe(18250.00);
    expect(summary.totalLiens).toBe(22400.00);
    expect(summary.netClientPayout).toBe(126025.00);
  });
});
```

### 2.3 Utah URCP Rule 6 Civil Deadline Computation
```typescript
describe('URCPRule6Calculator', () => {
  it('should exclude intermediate weekends and holidays for periods under 11 days', () => {
    // 7-day responsive motion deadline triggered on a Thursday
    const triggerDate = new Date('2026-11-12T00:00:00Z');
    const deadline = computeURCPDeadline(triggerDate, 7, { isElectronicService: false });
    
    // Thu (12) -> Fri (13) [Day 1] -> Mon (16) [Day 2] -> Tue (17) [Day 3] -> 
    // Wed (18) [Day 4] -> Thu (19) [Day 5] -> Fri (20) [Day 6] -> Mon (23) [Day 7]
    expect(deadline.toISOString().split('T')[0]).toBe('2026-11-23');
  });

  it('should add 3 calendar days for electronic service', () => {
    const triggerDate = new Date('2026-11-12T00:00:00Z');
    const deadline = computeURCPDeadline(triggerDate, 7, { isElectronicService: true });
    expect(deadline.toISOString().split('T')[0]).toBe('2026-11-26');
  });
});
```

---

## 3. Integration Testing with Real MySQL 8.4 Containers

API endpoints are tested using **Supertest** running against an ephemeral MySQL 8.4 container managed via Testcontainers:

### 3.1 Ethical Wall Enforcement Integration Test
```typescript
describe('GET /api/v1/matters/:id (Ethical Wall)', () => {
  it('should allow assigned attorney to access matter details', async () => {
    const res = await request(app)
      .get('/api/v1/matters/MAT-2025-0101')
      .set('Authorization', `Bearer ${attorneyThomasToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should block unassigned associate attorney with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/matters/MAT-2025-0101')
      .set('Authorization', `Bearer ${unassignedAttorneyToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ETHICAL_WALL_RESTRICTION');
  });
});
```

### 3.2 Anti-Commingling Negative Trust Balance Database Test
```typescript
describe('POST /api/v1/accounting/trust/transactions (Check Constraint)', () => {
  it('should throw 422 if trust disbursement exceeds available balance', async () => {
    const res = await request(app)
      .post('/api/v1/accounting/trust/transactions')
      .set('Authorization', `Bearer ${billingDirectorToken}`)
      .send({
        trustSubLedgerId: 'TR-1004', // Rachel Walker balance: $338.00
        transactionType: 'Disbursement',
        amount: -500.00, // Exceeds balance!
        sourceReference: 'Unlawful Overdraft Attempt'
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('INSUFFICIENT_TRUST_FUNDS');
  });
});
```

---

## 4. Performance & Concurrency Load Testing (50+ Users)

A dedicated K6 load testing script simulates realistic firm load:
- **Test Profile**:
  - 50 virtual users performing concurrent actions over a 30-minute window:
    - 20 attorneys reviewing dockets, entering time, and drafting notes.
    - 15 paralegals uploading documents and searching case files.
    - 10 billing personnel querying general ledger and generating invoices.
    - 5 partners reviewing approval queues.
- **Performance Thresholds (SLA)**:
  - 95% of API requests (`p95`) must resolve in under **150ms**.
  - Document metadata queries must resolve in under **50ms**.
  - 0% database transaction lock timeouts during concurrent time entries.


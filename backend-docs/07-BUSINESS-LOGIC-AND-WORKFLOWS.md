# 07 – SUBSTANTIVE BUSINESS LOGIC & WORKFLOW ENGINES

**Firm Name:** Heugly & Bludworth, Attorneys at Law  
**Jurisdiction:** State of Utah (State Bar & Federal Courts)  
**Functional Parity:** Filevine (Workflows) • Clio (360° Records) • Best Case (Bankruptcy) • Docketwise (Immigration) • Standalone 3-Way Reconciliation (CosmoLex Replacement)

---

## 1. Intake Clearance & Client Conversion Workflow (Utah RPC 1.7)

```mermaid
flowchart TD
    A[New Prospective Client Inquiry] --> B[Create Intake Record]
    B --> C[Enter Adverse Parties & Related Entities]
    C --> D[Run Automated Conflict Search Engine]
    D --> E{Potential Conflict Found?}
    E -- Yes --> F[Flag Conflict Identified - RPC 1.7]
    F --> G[Managing Partner Ethical Review]
    G --> H{Waivable Conflict with Consent?}
    H -- No --> I[Formally Decline Representation]
    H -- Yes --> J[Execute Conflict Waiver]
    E -- No --> K[Mark Conflict Cleared]
    J --> K
    K --> L[Generate Engagement Letter & Fee Retainer]
    L --> M[Client Signs via Digital Signature Bridge]
    M --> N[Record Initial IOLTA Trust Deposit]
    N --> O[Execute Convert to Retained Client Action]
    O --> P[Auto-Provision Client Record & Initial Matter Docket]
```

### 1.1 Transactional Conversion Contract
When `/api/v1/intakes/:id/convert` executes:
1. Validates that `conflict_status === 'Cleared'`. Throws `409 Conflict` if review is pending or adverse.
2. In a single MySQL InnoDB transaction:
   - Inserts `clients` record with unique code `CLI-XXXX`.
   - Inserts initial `matters` docket associated with the selected practice area.
   - Instantiates the `trust_sub_ledgers` account initialized to $\$0.00$.
   - Sets `intakes.converted_to_client = true`.

---

## 2. Configurable Workflow Engine & Stage Gatekeepers (Filevine Model)

Each of the firm's 9 practice areas has a tailored stage pipeline. Matter advancement is guarded by **Gatekeeper Conditions**:

```mermaid
stateDiagram-v2
    [*] --> Intake_Conflicts: File Opened
    Intake_Conflicts --> Pleadings_Service: Conflict Cleared + Retainer Signed
    Pleadings_Service --> Fact_Discovery: Summons Served + Answer Logged
    Fact_Discovery --> Expert_Discovery: Rule 26 Disclosures Exchanged
    Expert_Discovery --> Dispositive_Motions: Expert Deposition Concluded
    Dispositive_Motions --> Trial_Resolution: Pre-Trial Settlement Conf Done
    Trial_Resolution --> [*]: Final Settlement Disbursed + Order Entered
```

### 2.1 Gatekeeper Enforcement Logic
When a user clicks "Advance Stage" on `MatterDetails.jsx`:
```typescript
async advanceMatterStage(matterId: string, targetStageId: string, verifiedFields: string[]) {
  const stage = await prisma.workflowStage.findUnique({ where: { id: targetStageId } });
  const required = stage.requiredFields as string[]; // e.g. ["Rule 26 Initial Disclosures Exchanged"]

  // Validate that all required gatekeeper items are acknowledged
  const missing = required.filter(item => !verifiedFields.includes(item));
  if (missing.length > 0) {
    throw new ValidationError(`Cannot advance stage: Missing required gatekeepers: ${missing.join(', ')}`);
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Update matter stage
    await tx.matter.update({ where: { id: matterId }, data: { currentStageId: targetStageId } });
    
    // 2. Auto-spawn tasks configured for the target stage
    for (const taskTemplate of stage.autoTasks) {
      await tx.task.create({
        data: {
          matterId,
          title: taskTemplate.title,
          priority: taskTemplate.priority,
          dueDate: computeBusinessDays(new Date(), taskTemplate.dueDays),
          assignedToUserId: resolveRoleToUser(matterId, taskTemplate.role)
        }
      });
    }
  });
}
```

---

## 3. Passive Activity Capture & Deduplication Engine

Audited from `SuggestedBilling.jsx` (RFP Requirement 6):

```mermaid
flowchart LR
    M365[Outlook Email Activity] --> INGEST[Passive Ingestion Buffer]
    VOIP[Phone Call Logs] --> INGEST
    WORD[Word Document Telemetry] --> INGEST

    INGEST --> DEDUP{Deduplication Check<br/>Source Identifier Exists?}
    DEDUP -- Yes --> DROP[Silently Discard Duplicate]
    DEDUP -- No --> ROUND[Round Duration to 0.1 hr Increments]
    ROUND --> MATCH[Match Client & Matter via Keywords]
    MATCH --> SLOTS[Categorize into Mountain Time Review Slots]
    SLOTS --> QUEUE[Render in Suggested Billing Queue]

    QUEUE --> ACTION{Attorney Decision}
    ACTION --> ACCEPT[Accept & Post to Submitted Time]
    ACTION --> EDIT[Adjust Duration/Narrative & Post]
    ACTION --> DISMISS[Dismiss Item]
```

### 3.1 Mountain-Time Review Schedules
Four daily review checkpoints:
- **12:00 PM MT (Noon)**: Mid-day morning communications review.
- **4:00 PM MT**: Late afternoon court and drafting capture.
- **6:00 PM MT**: End-of-day client consultations and conference calls.
- **9:00 PM MT**: Nightly audit to guarantee zero unbilled hours.

---

## 4. Standalone Three-Way Reconciliation (Utah RPC 1.15)

The core mechanism replacing CosmoLex. Guarantees balanced accounting across all 3 pillars:

$$\text{Pillar 1: Adjusted Bank Balance} = \text{Pillar 2: General Ledger Account 2100} = \text{Pillar 3: Total Client Sub-Ledgers}$$

$$\text{Variance} = |\text{Pillar 1} - \text{Pillar 2}| + |\text{Pillar 2} - \text{Pillar 3}| = \$0.00$$

```mermaid
graph TD
    subgraph Pillar 1: Bank Account
        B1[Bank Statement Balance: $74,278]
        B2[+ Deposits in Transit: $1,440]
        B3[- Outstanding Checks: $1,440]
        B1 --> P1[Adjusted Bank Balance: $74,278]
        B2 --> P1
        B3 --> P1
    end

    subgraph Pillar 2: General Ledger
        GL1[GL Account #2100: IOLTA Trust Liability]
        GL1 --> P2[GL Trust Book Balance: $74,278]
    end

    subgraph Pillar 3: Client Sub-Ledgers
        C1[Wasatch Logistics: $25,000]
        C2[Dr. Evelyn Martinez: $12,500]
        C3[Elena Rostova: $1,440]
        C4[Rachel Walker: $338]
        C5[Apex Horizon: $35,000]
        C1 --> P3[Total Sub-Ledgers: $74,278]
        C2 --> P3
        C3 --> P3
        C4 --> P3
        C5 --> P3
    end

    P1 --- V{Variance Check}
    P2 --- V
    P3 --- V
    V -->|Variance == $0.00| CERT[Issue Signed Utah RPC 1.15 Audit Certificate]
    V -->|Variance != $0.00| BLOCK[Block Month Close & Flag Discrepancy]
```

---

## 5. Personal Injury Contingency Settlement Engine (Utah RPC 1.5(c))

Calculates final distribution statements upon settlement recovery:

$$\text{Net Client Payout} = \text{Gross Settlement} - \left( \text{Gross Settlement} \times \frac{\text{Contingency \%}}{100} \right) - \sum \text{Case Expenses} - \sum \text{Negotiated Liens}$$

```mermaid
flowchart TD
    G[Gross Recovery: $250,000.00] --> FEE[Attorney Contingency Fee 33.33%: $83,325.00]
    G --> EXP[Itemized Case Costs: $18,250.00]
    G --> LIEN[Third-Party Healthcare Liens: $22,400.00]
    
    FEE --> SUB[Total Deductions: $123,975.00]
    EXP --> SUB
    LIEN --> SUB

    G --> NET[Net Client Disbursement Remittance: $126,025.00]
    SUB --> NET
    NET --> STMT[Generate Formal Utah RPC 1.5 c Written Statement]
    STMT --> DISBURSE[Execute Authorized IOLTA Escrow Drawdowns]
```

---

## 6. Specialty Practice Substantive Engines

### 6.1 Bankruptcy Preparation (Best Case Model)
- **Means-Test Calculator (Form 122)**: Annualizes current monthly income (CMI) across 6 preceding calendar months. Compares debtor income against Utah median benchmarks based on family size (1 to 4+ members). Automatically flags Chapter 7 presumption of abuse.
- **Utah Statutory Exemptions**: Evaluates real property equity against Utah Code § 78B-5-501 ($44,500 single / $89,000 joint homestead) and motor vehicles against § 78B-5-505 ($5,000 vehicle exemption).
- **14-Day Emergency Stay Clock**: Triggers an alert countdown if an emergency petition is filed, tracking statutory deadlines for missing schedules under FRBP Rule 1007.

### 6.2 Immigration Preparation (Docketwise Model)
- **Multi-Form State Synchronization**: Single data store for foreign national aliases, I-94 arrival numbers, alien registration numbers, and prior addresses. Updating a client field immediately updates Form G-28 (Notice of Entry of Appearance), Form I-130 (Petition for Alien Relative), Form I-485 (Adjustment of Status), and Form I-765 (Employment Authorization).
- **Exhibit Package Assembler**: Organizes required evidence into indexed 7-tab exhibit binders (Tab A: Filing Fee Voucher; Tab B: Form G-28; Tab C: Primary Petitions; Tab D: Civil Documents; Tab E: Affidavit of Support I-864; Tab F: Tax Returns & W-2s; Tab G: Photographs).


# 10 – INTEGRATIONS & THIRD-PARTY SERVICES REGISTER

**Firm Name:** Heugly & Bludworth, Attorneys at Law  
**Design Principle:** Clean Architectural Boundaries, Least Privilege Scopes & Explicit Audit Logging

---

## 1. Master Third-Party Integration Register

The backend architecture interfaces with seven external ecosystems. Each connection operates under defined security and failure boundaries:

| Integration Provider | Target Domain | Integration Method | Direction | Records Exchanged | Auth & Scopes | Failure & Duplicate Strategy |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **Microsoft 365 (Graph API)** | Outlook Email & Calendar | RESTful Graph API v1.0 + Webhooks | Bidirectional | Client emails, calendar court notices, message timestamps, attachments. | OAuth 2.0 (`Mail.ReadWrite`, `Calendars.ReadWrite`) | Webhook idempotency keys based on immutable Graph `Message-ID`. Auto-retry with exponential backoff. |
| **Utah State Courts (Judicialink / GreenFiling)** | Civil Court Dockets & Filings | REST API / HTTPS SOAP Web Services | Inbound & Outbound | E-filed complaints, entered court orders, proof of service, docket entries. | X.509 Client Certificates + Firm Bar ECF Credentials | Stored receipt tokens; filing packages tracked as `Pending Submission` until verified court timestamp. |
| **Federal Court CM/ECF** | Bankruptcy Dockets | Automated ECF Package Packaging | Outbound | PDF filing packages, Form 122 Means-Test, formatted creditor matrices (ASCII). | Attorney ECF Login & Password via TLS | Validates 14-day emergency stay compliance before compilation. |
| **Cloud Storage (OneDrive / Dropbox)** | External Document Vaults | REST API v2 + Webhooks | Inbound & Outbound | Document backups, client exhibit collections, execution versions. | OAuth 2.0 PKCE Flow | Preserves original SHA-256 hash. Local S3 vault remains source-of-truth. |
| **Telephony / VOIP (Twilio / Firm PBX)** | Call Logs & SMS Threads | REST API + Event Webhooks | Inbound | Inbound/outbound call durations, dialed numbers, SMS transcripts. | API Secret Key + Webhook Signature Verification | Telephony records indexed by phone number; calls matched to clients via `clients.phone`. |
| **Payment Gateway (LawPay / Stripe)** | Client Card & ACH Processing | Hosted Tokenization + Webhooks | Inbound | Credit card transactions, ACH authorizations, payment receipts. | PCI-DSS Compliant Hosted Fields (`Bearer Secret`) | Strict segregation of destination accounts (`Operating` vs `IOLTA Trust`). No raw cardholder data stored. |
| **CosmoLex Bridge** | Historical Accounting Archival | Batch Export Endpoint | Outbound Only | Approved billable hours, expenses, client matter codes (LEDES 1998B format). | Internal Firm Admin Token | Batch ID tracking (`COSMO-YYYY-MMDD`). Zero real-time database dependency on CosmoLex. |

---

## 2. Detailed Technical Architecture for Critical Connectors

### 2.1 Microsoft 365 & Outlook Mail Bridge
Audited from `OutlookMailBridgeModal.jsx` and `CommunicationsList.jsx`:

```mermaid
sequenceDiagram
    autonumber
    participant M365 as Microsoft Graph API
    participant WEBHOOK as /api/v1/integrations/outlook/webhook
    participant QUEUE as Ingestion Queue (BullMQ)
    participant MATCH as Email Matching Engine
    participant DB as MySQL 8.4

    M365->>WEBHOOK: HTTPS POST Webhook Notification { resourceId: "msg-12345" }
    WEBHOOK->>WEBHOOK: Validate Microsoft Client State Token
    WEBHOOK->>QUEUE: Enqueue Job { messageId: "msg-12345" }
    WEBHOOK-->>M365: 202 Accepted

    QUEUE->>M365: GET /me/messages/msg-12345
    M365-->>QUEUE: Returns Email Payload (Sender, Subject, Body, Timestamp)
    
    QUEUE->>MATCH: Match Sender/Recipient against clients.email & matters.case_docket_number
    alt Confident Match Found
        MATCH->>DB: Insert into communications { status: 'Filed', matterId }
    else Ambiguous or Unmatched
        MATCH->>DB: Insert into unmatched_communications { status: 'Needs Review' }
    end
```

- **Duplicate Prevention**: Every message is keyed by the unique RFC 822 `Message-ID`. The database enforces a `UNIQUE(source_identifier)` constraint.
- **Unmatched Queue**: Messages from unknown senders are held in `unmatched_communications` until a paralegal manually links them to a client.

---

### 2.2 Telephony & SMS Capture Architecture (Apple iMessage Limitations)
Audited from RFP Requirement 6 and `AppleSyncLimitationsPanel`:

```mermaid
flowchart TD
    CALL[Client Calls Firm Line] --> PBX[Firm VOIP / Cloud PBX]
    PBX --> WEBHOOK[Telephony Webhook Dispatched]
    WEBHOOK --> DURATION[Capture Exact Call Duration: e.g. 14 mins]
    DURATION --> ROUND[Round to Suggested Billable: 0.3 hr]
    ROUND --> PUSH[Push to Suggested Billing Queue]

    SMS[Client Sends SMS] --> CARRIER[Twilio / Direct Firm Number]
    CARRIER --> TEXT_QUEUE[Thread into Text Message Thread Inspector]

    APPLE[Client Sends Apple iMessage to Attorney Personal iPhone]
    APPLE --> LIMIT[Hardware Limitation: Apple End-to-End Encryption]
    LIMIT --> MANUAL[Requires Manual Forwarding or macOS Sync Agent]
    MANUAL --> NOTICE[Display Utah RPC 1.6 Confidentiality Disclosure in UI]
```

- **Technical Boundary**: Direct automated extraction from an attorney’s personal Apple iMessage without a dedicated Mac bridge is prevented by Apple's end-to-end encryption. The architecture explicitly marks this technical boundary and provides manual forwarding options with Utah RPC 1.6 disclosures.

---

### 2.3 Legal Payment Gateway Architecture (LawPay / Stripe)
Enforces strict segregation between operational revenue and client escrow deposits:

```mermaid
flowchart LR
    PAY[Client Enters Payment on Client Portal] --> FORM[PCI-DSS Tokenized Payment Form]
    
    FORM --> ROUTE{Select Destination}
    
    ROUTE -- Earned Invoice Payment --> OP[Operating Bank Account #1010]
    OP --> GL_OP[Debit: 1010 Operating Cash<br/>Credit: 1200 Accounts Receivable]
    
    ROUTE -- Advance Trust Retainer --> TR[IOLTA Escrow Bank Account #1020]
    TR --> GL_TR[Debit: 1020 IOLTA Trust Bank<br/>Credit: 2100 Client Trust Liability]
    TR --> SUB[Credit: Client Trust Sub-Ledger]
```

- **Anti-Commingling Enforcement**: Payment webhooks reject any transaction that attempts to route trust retainer funds into the operating account.

---

### 2.4 CosmoLex Batch Export Bridge (LEDES 1998B)
Audited from `BillableHours.jsx` and `CosmoLexSettings.jsx`:
- **Endpoint**: `POST /api/v1/integrations/cosmolex/export`
- **Output Format**: Standard LEDES 1998B format (`INVOICE_DATE|INVOICE_NUMBER|CLIENT_ID|MATTER_ID|EXP_OR_FEE|TIMEKEEPER|HOURS|RATE|AMOUNT|DESCRIPTION`).
- **Batch State Transition**:
  - Validates all selected entries have `status === 'Approved'`.
  - Generates batch identifier (`COSMO-2026-1101`).
  - Sets `exported_to_cosmolex = true` and records batch reference.
  - Zero external CosmoLex credentials or network dependencies required.


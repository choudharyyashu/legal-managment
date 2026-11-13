// Mock Litigation Data & Dockets (Utah State Third District Court & Federal District of Utah)
// Models Sections 3-8 of Client Blueprint

export const MOCK_LITIGATION_CASES = [
  {
    id: 'LIT-2026-001',
    caseNumber: '250904122',
    courtVenue: 'Third Judicial District Court, Salt Lake County, State of Utah',
    judge: 'Hon. Laura Scott',
    caseTitle: 'Wasatch Mountain Logistics LLC v. Interstate Freightlines Inc. & Mark Henderson',
    matterType: 'Commercial Contract & Trade Secret Misappropriation',
    leadAttorney: 'Thomas Bludworth, Esq.',
    leadParalegal: 'Marcus Vance',
    role: 'Plaintiff (Wasatch Mountain Logistics)',
    status: 'Discovery Active',
    trialDate: '2026-10-14',
    budgetTotal: 125000,
    billedToDate: 48200,

    // Section 3: Case Assessment & Issues/Proof Matrix
    claims: [
      {
        id: 'clm-1',
        title: 'Breach of Master Carrier Logistics Agreement',
        element: 'Valid contract, plaintiff performance, defendant non-delivery, $142,000 direct damages',
        supportingEvidence: 'Executed Contract Ex. A, Dispatch Logs, Carrier Bills of Lading',
        missingEvidence: 'Defendant warehouse surveillance video from Nov 14',
        witnesses: 'Travis Olsen (Fleet Director), Sarah Lin (Accountant)',
        assignedResearch: 'Utah Supreme Court precedent on consequential damages limitation clauses',
        status: 'Substantiated (Strong)'
      },
      {
        id: 'clm-2',
        title: 'Misappropriation of Trade Secrets (Utah Uniform Trade Secrets Act § 13-24-1)',
        element: 'Proprietary customer rate sheets, unauthorized download by Henderson, commercial value',
        supportingEvidence: 'Server access logs, thumb drive forensics report (Bates WML-000412)',
        missingEvidence: 'Henderson personal laptop forensic image (Subpoena pending)',
        witnesses: 'Forensic IT Expert Gregory Walsh, HR Director Karen Beck',
        assignedResearch: 'Preliminary injunction standards under URCP Rule 65A',
        status: 'Investigation Active'
      }
    ],

    // Section 3: Litigation Holds & Preservation
    litigationHolds: [
      {
        id: 'hold-1',
        recipient: 'Gregory Walsh (Director of IT)',
        department: 'Information Technology',
        noticeDate: '2025-11-20',
        acknowledgedDate: '2025-11-21',
        status: 'Acknowledged & Compliant',
        devicesCovered: 'Exchange Server logs, Azure tenant backup, Slack channels #ops-dispatch',
        notes: 'Immutable cloud preservation policy applied to custodians.'
      },
      {
        id: 'hold-2',
        recipient: 'Travis Olsen (Fleet Operations)',
        department: 'Operations',
        noticeDate: '2025-11-20',
        acknowledgedDate: '2025-11-22',
        status: 'Acknowledged & Compliant',
        devicesCovered: 'Company iPad Pro, Samsung Galaxy S23 work phone',
        notes: 'SMS threads with defendant dispatchers exported.'
      },
      {
        id: 'hold-3',
        recipient: 'Mark Henderson (Terminated Dispatch Manager)',
        department: 'Former Employee (Opposing Party)',
        noticeDate: '2025-11-20',
        acknowledgedDate: null,
        status: 'Formal Preservation Demand Sent (No Acknowledgment)',
        devicesCovered: 'Personal Lenovo laptop, Apple iPhone 14',
        notes: 'Spoliation letter sent via certified mail return receipt #7021-0980.'
      }
    ],

    // Section 4: Party-Specific Service Tracker
    serviceRoster: [
      {
        id: 'srv-1',
        partyName: 'Interstate Freightlines Inc. (Corporate Defendant)',
        partyType: 'Utah Registered Corporation',
        registeredAgent: 'Corporation Service Company (CSC), 175 S. Main St, SLC, UT',
        processServer: 'Metro Legal Process Services LLC',
        serviceMethod: 'Personal Service on Registered Agent (URCP 4(d)(1)(E))',
        attemptsCount: 1,
        actualServiceDate: '2025-12-04',
        proofFiledDate: '2025-12-05',
        answerDueDate: '2025-12-26', // 21 days under URCP 12(a)
        responseStatus: 'Answer & Counterclaim Filed (2025-12-22)',
        status: 'Service Complete & Verified'
      },
      {
        id: 'srv-2',
        partyName: 'Mark Henderson (Individual Defendant)',
        partyType: 'Individual Resident',
        registeredAgent: 'None (Residential)',
        processServer: 'Metro Legal Process Services LLC',
        serviceMethod: 'Personal Delivery at Residence (URCP 4(d)(1)(A))',
        attemptsCount: 3,
        actualServiceDate: '2025-12-08',
        proofFiledDate: '2025-12-09',
        answerDueDate: '2025-12-29',
        responseStatus: 'Entry of Appearance by Defense Counsel (2025-12-28)',
        status: 'Service Complete & Verified'
      }
    ],

    // Section 6: Written Discovery Requests & Responses
    writtenDiscovery: [
      {
        id: 'disc-1',
        title: "Plaintiff's First Set of Interrogatories to Defendant Interstate",
        type: 'Interrogatories (URCP 33)',
        propoundingParty: 'Wasatch Mountain Logistics (Plaintiff)',
        respondingParty: 'Interstate Freightlines Inc.',
        servedDate: '2026-01-10',
        dueDate: '2026-02-09', // 28 days under URCP 33
        status: 'Responses Received with Deficiencies',
        totalRequests: 25,
        respondedRequests: 21,
        objectedRequests: 4,
        notes: 'Defendant refused to answer Rog #14 & #18 re customer diversion. Meet and confer scheduled.'
      },
      {
        id: 'disc-2',
        title: "Plaintiff's First Request for Production of Documents (RFPs)",
        type: 'Production (URCP 34)',
        propoundingParty: 'Wasatch Mountain Logistics (Plaintiff)',
        respondingParty: 'Interstate Freightlines Inc.',
        servedDate: '2026-01-10',
        dueDate: '2026-02-09',
        status: 'Production Rolling (Bates IFL-000001 to 004192)',
        totalRequests: 32,
        respondedRequests: 28,
        objectedRequests: 4,
        notes: '4,192 pages produced in native PDF with load file. Privilege log provided.'
      },
      {
        id: 'disc-3',
        title: "Defendant's First Set of Interrogatories to Plaintiff",
        type: 'Interrogatories (URCP 33)',
        propoundingParty: 'Interstate Freightlines Inc.',
        respondingParty: 'Wasatch Mountain Logistics (Plaintiff)',
        servedDate: '2026-01-15',
        dueDate: '2026-02-16',
        status: 'Completed & Served',
        totalRequests: 18,
        respondedRequests: 18,
        objectedRequests: 1,
        notes: 'Responses verified by managing member Travis Olsen and served via GreenFiling.'
      }
    ],

    // Section 6: Privilege Log (Utah RPC 1.6 & URCP 26(b)(8))
    privilegeLog: [
      {
        batesNum: 'WML-PRIV-0001',
        docDate: '2025-11-15',
        author: 'Thomas Bludworth, Esq.',
        recipients: 'Travis Olsen (Client)',
        subject: 'Confidential Legal Assessment: Non-Compete Breach Risk & Preliminary Injunction Exposure',
        privilegeBasis: 'Attorney-Client Privileged Communication (Utah R. Evid. 504)',
        redactionType: 'Withheld in Entirety'
      },
      {
        batesNum: 'WML-PRIV-0002',
        docDate: '2025-11-18',
        author: 'Gregory Walsh (IT Director)',
        recipients: 'Thomas Bludworth, Esq.',
        subject: 'Draft Forensic Investigation Notes & Keyword Query Search Matrices',
        privilegeBasis: 'Work Product Doctrine (URCP 26(b)(5)) - Prepared in Anticipation of Litigation',
        redactionType: 'Withheld in Entirety'
      },
      {
        batesNum: 'WML-000249',
        docDate: '2025-10-20',
        author: 'Sarah Lin (Controller)',
        recipients: 'Executive Committee',
        subject: 'Q3 Financial Realization Summary with In-House Legal Counsel Settlement Margin Advice',
        privilegeBasis: 'Attorney-Client & Proprietary Commercial Trade Secret',
        redactionType: 'Redacted (Redaction box applied to Paragraph 4)'
      }
    ],

    // Section 6: Subpoenas & Depositions
    subpoenas: [
      {
        id: 'subp-1',
        targetEntity: 'Silicon Slopes Regional Bank',
        subpoenaType: 'Subpoena Duces Tecum (URCP 45)',
        servedDate: '2026-01-22',
        complianceDate: '2026-02-18',
        status: 'Documents Produced (148 Pages)',
        recordsRequested: 'Account deposits & wire transfers from Mark Henderson Nov 2025 - Jan 2026'
      },
      {
        id: 'subp-2',
        targetEntity: 'Apex Cloud Hosting Inc.',
        subpoenaType: 'Subpoena Duces Tecum (URCP 45)',
        servedDate: '2026-02-01',
        complianceDate: '2026-02-28',
        status: 'Objections Received (Negotiating Scope)',
        recordsRequested: 'Private IP access logs for server partition 192.168.10.4'
      }
    ],

    depositions: [
      {
        deponent: 'Mark Henderson (Co-Defendant)',
        witnessType: 'Adverse Party',
        scheduledDate: '2026-03-24 at 09:30 AM',
        location: 'Heugly & Bludworth Conference Room A (or Zoom Videoconference)',
        stenographer: 'Citadel Court Reporting LLC',
        videographer: 'Yes (Videotaped Deposition)',
        prepStatus: 'Outline Drafted & 42 Exhibits Tabbed'
      },
      {
        deponent: 'Gregory Walsh (Plaintiff Forensics Expert)',
        witnessType: 'Retained Expert (URCP 26(a)(4))',
        scheduledDate: '2026-04-10 at 10:00 AM',
        location: 'Remote Zoom',
        stenographer: 'Citadel Court Reporting LLC',
        videographer: 'No',
        prepStatus: 'Expert Report Exchanged Feb 12'
      }
    ],

    // Section 8: Trial Notebook & Exhibit Binder
    trialPlan: {
      trialDate: '2026-10-14',
      estimatedDays: 4,
      trialFormat: 'Jury Trial (8 Jurors under Utah Code § 78B-1-104)',
      plaintiffWitnesses: [
        { name: 'Travis Olsen', order: 1, willCall: 'Will Call', estimateTime: '2.5 hrs', purpose: 'Master contract terms & non-performance impact' },
        { name: 'Gregory Walsh', order: 2, willCall: 'Will Call', estimateTime: '3.0 hrs', purpose: 'Digital forensics & server download evidence' },
        { name: 'Sarah Lin', order: 3, willCall: 'Will Call', estimateTime: '1.5 hrs', purpose: 'Financial damages, lost profits & replacement costs' },
        { name: 'Mark Henderson', order: 4, willCall: 'May Call (Hostile)', estimateTime: '2.0 hrs', purpose: 'Adverse cross-examination regarding file downloads' }
      ],
      exhibitBinder: [
        { num: 'P-01', description: 'Master Carrier Logistics Agreement dated June 1, 2024', status: 'Stipulated Admissible', objections: 'None' },
        { num: 'P-02', description: 'Certified Server Authentication Access Logs Nov 10-15', status: 'Objection Pending', objections: 'Defense asserts hearsay (business record foundation required)' },
        { num: 'P-03', description: 'Itemized Schedule of Lost Commercial Revenue & Damages', status: 'Contested', objections: 'Defense asserts speculative projection' },
        { num: 'P-04', description: 'Certified Bank Wire Remittance Confirmation ($148,500)', status: 'Stipulated Admissible', objections: 'None' }
      ],
      motionsInLimine: [
        {
          id: 'mil-1',
          movant: 'Plaintiff Wasatch',
          title: "Motion in Limine to Exclude Defendant's Unregistered Expert Testimony",
          status: 'Briefed - Awaiting Pretrial Ruling'
        },
        {
          id: 'mil-2',
          movant: 'Defense Interstate',
          title: 'Motion in Limine to Exclude Customer Complaint Emails',
          status: 'Opposition Brief Filed Feb 20'
        }
      ]
    }
  },
  {
    id: 'LIT-2026-002',
    caseNumber: '260901044',
    courtVenue: 'Third Judicial District Court, Salt Lake County, State of Utah',
    judge: 'Hon. Barry G. Lawrence',
    caseTitle: 'Red Rock Commercial Holdings LLC v. Apex General Contracting & Valley Plumbing Inc.',
    matterType: 'Construction Defect & Mechanic Lien Foreclosure',
    leadAttorney: 'Eleanor Heugly, Esq.',
    leadParalegal: 'Marcus Vance',
    role: 'Defendant (Red Rock Commercial)',
    status: 'Pleadings & Defensive Intake',
    trialDate: '2027-02-18',
    budgetTotal: 90000,
    billedToDate: 14200,
    claims: [
      {
        id: 'clm-201',
        title: 'Mechanic Lien Foreclosure (Utah Code § 38-1a-701)',
        element: 'Timely notice of commencement, valid pre-lien notice, unpaid labor claim ($84,000)',
        supportingEvidence: 'Notice of Lien Recorded at County Recorder Book 1104 Page 829',
        missingEvidence: 'Subcontractor daily sign-in sheets and supplier invoices',
        witnesses: 'Project Superintendent Dan Kowalski, Building Inspector Brian Miller',
        assignedResearch: 'Improperly served preliminary notice defense under Utah Code § 38-1a-501',
        status: 'Active Defense'
      }
    ],
    litigationHolds: [
      {
        id: 'hold-201',
        recipient: 'Property Management Ops Team',
        department: 'Operations',
        noticeDate: '2026-01-12',
        acknowledgedDate: '2026-01-13',
        status: 'Acknowledged & Compliant',
        devicesCovered: 'Building maintenance work orders, Procore project management archive',
        notes: 'Water intrusion video footage preserved on NAS drive.'
      }
    ],
    serviceRoster: [
      {
        id: 'srv-201',
        partyName: 'Red Rock Commercial Holdings LLC (Client / Defendant)',
        partyType: 'Utah LLC',
        registeredAgent: 'Eleanor Heugly, Esq., 175 S. Main St, SLC',
        processServer: 'County Constable',
        serviceMethod: 'Accepted Service on Registered Agent (URCP 4(d))',
        attemptsCount: 1,
        actualServiceDate: '2026-01-14',
        proofFiledDate: '2026-01-15',
        answerDueDate: '2026-02-04',
        responseStatus: 'Answer & Counterclaim Filed',
        status: 'Defensive Intake Completed'
      }
    ],
    writtenDiscovery: [],
    privilegeLog: [],
    subpoenas: [],
    depositions: [],
    trialPlan: {
      trialDate: '2027-02-18',
      estimatedDays: 3,
      trialFormat: 'Bench Trial',
      plaintiffWitnesses: [],
      exhibitBinder: [],
      motionsInLimine: []
    }
  }
];


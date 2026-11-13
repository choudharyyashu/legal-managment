import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WORKFLOW_STAGES = [
  // 1. Personal Injury (pa-pi)
  {
    id: 'ws-pi-1',
    practiceAreaId: 'pa-pi',
    stageName: 'Intake & Conflict Clearance',
    stageCode: 'PI-1',
    stageOrder: 1,
    requiredFields: ['Conflict Cleared', 'Signed Contingency Retainer Agreement'],
    autoTasks: [{ title: 'Request Police Accident Report', priority: 'High', dueDays: 5, role: 'paralegal' }],
  },
  {
    id: 'ws-pi-2',
    practiceAreaId: 'pa-pi',
    stageName: 'Investigation & Medical Records',
    stageCode: 'PI-2',
    stageOrder: 2,
    requiredFields: ['Police Report Received', 'Medical Authorizations Dispatched'],
    autoTasks: [{ title: 'Send Letter of Representation to Insurance Adjuster', priority: 'High', dueDays: 3, role: 'attorney' }],
  },
  {
    id: 'ws-pi-3',
    practiceAreaId: 'pa-pi',
    stageName: 'Medical Special Demand Package',
    stageCode: 'PI-3',
    stageOrder: 3,
    requiredFields: ['All Medical Specials Received', 'Demand Letter Drafted'],
    autoTasks: [{ title: 'Review Insurance Policy Limits and Demand Response', priority: 'Medium', dueDays: 30, role: 'attorney' }],
  },
  {
    id: 'ws-pi-4',
    practiceAreaId: 'pa-pi',
    stageName: 'Pleadings & Formal Service',
    stageCode: 'PI-4',
    stageOrder: 4,
    requiredFields: ['Complaint Filed in District Court', 'Summons Issued'],
    autoTasks: [{ title: 'Execute Service of Process on Defendant Driver & Owner', priority: 'Urgent', dueDays: 20, role: 'paralegal' }],
  },
  {
    id: 'ws-pi-5',
    practiceAreaId: 'pa-pi',
    stageName: 'Fact & Expert Discovery',
    stageCode: 'PI-5',
    stageOrder: 5,
    requiredFields: ['Rule 26 Initial Disclosures Exchanged', 'Written Interrogatories Served'],
    autoTasks: [{ title: 'Depose Defendant Driver & Defense Medical Examiner', priority: 'High', dueDays: 45, role: 'attorney' }],
  },
  {
    id: 'ws-pi-6',
    practiceAreaId: 'pa-pi',
    stageName: 'Mediation & Pre-Trial Readiness',
    stageCode: 'PI-6',
    stageOrder: 6,
    requiredFields: ['Mediation Statement Submitted', 'Rule 26(a)(4) Pretrial Disclosures Ready'],
    autoTasks: [{ title: 'Conduct Formal Pre-Trial Settlement Conference', priority: 'Urgent', dueDays: 14, role: 'attorney' }],
  },
  {
    id: 'ws-pi-7',
    practiceAreaId: 'pa-pi',
    stageName: 'Resolution, Liens & Disbursement',
    stageCode: 'PI-7',
    stageOrder: 7,
    requiredFields: ['Settlement Agreement Executed', 'Healthcare Subrogation Liens Negotiated'],
    autoTasks: [{ title: 'Draft Settlement Closing Statement and Disburse Trust Funds', priority: 'High', dueDays: 7, role: 'billing' }],
  },

  // 2. Bankruptcy (pa-bk)
  {
    id: 'ws-bk-1',
    practiceAreaId: 'pa-bk',
    stageName: 'Intake & Means Testing Evaluation',
    stageCode: 'BK-1',
    stageOrder: 1,
    requiredFields: ['Tax Returns Received', '6 Months Paystubs Received'],
    autoTasks: [{ title: 'Perform Statutory Means Test Calculation (Form 122A/C)', priority: 'High', dueDays: 7, role: 'attorney' }],
  },
  {
    id: 'ws-bk-2',
    practiceAreaId: 'pa-bk',
    stageName: 'Schedules Assembly & Credit Counseling',
    stageCode: 'BK-2',
    stageOrder: 2,
    requiredFields: ['Credit Counseling Certificate Received', 'Creditor Matrix Verified'],
    autoTasks: [{ title: 'Schedule Client Petition Signing and Review Conference', priority: 'High', dueDays: 5, role: 'paralegal' }],
  },
  {
    id: 'ws-bk-3',
    practiceAreaId: 'pa-bk',
    stageName: 'Court Petition Filing & 341 Prep',
    stageCode: 'BK-3',
    stageOrder: 3,
    requiredFields: ['Petition Filed with Bankruptcy Court', 'Official Case Number Issued'],
    autoTasks: [{ title: 'Deliver Section 521 Tax Documents to Assigned Trustee', priority: 'Urgent', dueDays: 7, role: 'paralegal' }],
  },
  {
    id: 'ws-bk-4',
    practiceAreaId: 'pa-bk',
    stageName: 'Section 341 Meeting of Creditors',
    stageCode: 'BK-4',
    stageOrder: 4,
    requiredFields: ['341 Examination Concluded', 'Financial Management Course Certificate Logged'],
    autoTasks: [{ title: 'File Official Financial Management Certificate (Form 423)', priority: 'High', dueDays: 14, role: 'paralegal' }],
  },
  {
    id: 'ws-bk-5',
    practiceAreaId: 'pa-bk',
    stageName: 'Discharge Order & Case Closure',
    stageCode: 'BK-5',
    stageOrder: 5,
    requiredFields: ['Trustee Report of No Distribution Entered', 'Discharge Order Entered'],
    autoTasks: [{ title: 'Transmit Official Discharge Package to Debtor', priority: 'Medium', dueDays: 5, role: 'attorney' }],
  },

  // 3. Immigration (pa-imm)
  {
    id: 'ws-imm-1',
    practiceAreaId: 'pa-imm',
    stageName: 'Eligibility & Questionnaire Audit',
    stageCode: 'IMM-1',
    stageOrder: 1,
    requiredFields: ['Client Identity Documents Verified', 'Prior Immigration History Cleared'],
    autoTasks: [{ title: 'Complete USCIS Petition Questionnaire Form Assembly', priority: 'High', dueDays: 10, role: 'paralegal' }],
  },
  {
    id: 'ws-imm-2',
    practiceAreaId: 'pa-imm',
    stageName: 'Petition Assembly & Legal Review',
    stageCode: 'IMM-2',
    stageOrder: 2,
    requiredFields: ['All Civil Documents Translated', 'Filing Fee Checks Prepared'],
    autoTasks: [{ title: 'Attorney Final Quality Verification and Form Signing', priority: 'High', dueDays: 5, role: 'attorney' }],
  },
  {
    id: 'ws-imm-3',
    practiceAreaId: 'pa-imm',
    stageName: 'USCIS Filing & I-797C Receipts',
    stageCode: 'IMM-3',
    stageOrder: 3,
    requiredFields: ['Courier Delivery Confirmed', 'Form I-797C Notice of Action Receipt Logged'],
    autoTasks: [{ title: 'Set 90-Day USCIS Processing Status Audit Alert', priority: 'Medium', dueDays: 90, role: 'paralegal' }],
  },
  {
    id: 'ws-imm-4',
    practiceAreaId: 'pa-imm',
    stageName: 'Biometrics & RFE Processing',
    stageCode: 'IMM-4',
    stageOrder: 4,
    requiredFields: ['ASC Biometrics Appointment Attended'],
    autoTasks: [{ title: 'Prepare Response to Any Request for Evidence (RFE)', priority: 'Urgent', dueDays: 30, role: 'attorney' }],
  },
  {
    id: 'ws-imm-5',
    practiceAreaId: 'pa-imm',
    stageName: 'Field Office Interview & Adjudication',
    stageCode: 'IMM-5',
    stageOrder: 5,
    requiredFields: ['USCIS Interview Notice Logged', 'Mock Client Interview Executed'],
    autoTasks: [{ title: 'Attend USCIS Field Office Interview with Client', priority: 'Urgent', dueDays: 10, role: 'attorney' }],
  },
  {
    id: 'ws-imm-6',
    practiceAreaId: 'pa-imm',
    stageName: 'Permanent Residency Approval & Closure',
    stageCode: 'IMM-6',
    stageOrder: 6,
    requiredFields: ['Approval Notice Received', 'Physical Card Delivery Verified'],
    autoTasks: [{ title: 'Deliver Secure Immigration Vault Archival Package', priority: 'Low', dueDays: 5, role: 'attorney' }],
  },

  // 4. Civil/Commercial Litigation (pa-civ)
  {
    id: 'ws-civ-1',
    practiceAreaId: 'pa-civ',
    stageName: 'Pleadings & Motion Practice',
    stageCode: 'CIV-1',
    stageOrder: 1,
    requiredFields: ['Summons & Complaint Served', 'Answer or Responsive Motion Logged'],
    autoTasks: [{ title: 'Draft Rule 26 Initial Disclosures', priority: 'High', dueDays: 14, role: 'paralegal' }],
  },
  {
    id: 'ws-civ-2',
    practiceAreaId: 'pa-civ',
    stageName: 'Written & Electronic Discovery',
    stageCode: 'CIV-2',
    stageOrder: 2,
    requiredFields: ['Rule 26 Disclosures Exchanged', 'ESI Protocol Order Entered'],
    autoTasks: [{ title: 'Produce Responsive Electronic Records & Bates Index', priority: 'High', dueDays: 30, role: 'paralegal' }],
  },
  {
    id: 'ws-civ-3',
    practiceAreaId: 'pa-civ',
    stageName: 'Depositions & Expert Witness Phase',
    stageCode: 'CIV-3',
    stageOrder: 3,
    requiredFields: ['Key Party Depositions Transcribed', 'Expert Reports Exchanged'],
    autoTasks: [{ title: 'Draft Motion for Summary Judgment or Settlement Brief', priority: 'Urgent', dueDays: 28, role: 'attorney' }],
  },
  {
    id: 'ws-civ-4',
    practiceAreaId: 'pa-civ',
    stageName: 'Trial Preparation & Judgment',
    stageCode: 'CIV-4',
    stageOrder: 4,
    requiredFields: ['Pre-Trial Order Entered', 'Jury Instructions Assembled'],
    autoTasks: [{ title: 'Attend Trial / Conduct Final Settlement Execution', priority: 'Urgent', dueDays: 7, role: 'attorney' }],
  },

  // 5. Probate (pa-prob)
  {
    id: 'ws-prob-1',
    practiceAreaId: 'pa-prob',
    stageName: 'Petition for Probate & Heirs Notice',
    stageCode: 'PROB-1',
    stageOrder: 1,
    requiredFields: ['Death Certificate Logged', 'Original Will Deposited'],
    autoTasks: [{ title: 'Publish Notice to Creditors in Salt Lake Tribune', priority: 'High', dueDays: 10, role: 'paralegal' }],
  },
  {
    id: 'ws-prob-2',
    practiceAreaId: 'pa-prob',
    stageName: 'Letters Testamentary & Inventory',
    stageCode: 'PROB-2',
    stageOrder: 2,
    requiredFields: ['Letters Testamentary Issued', 'Estate Bank Account Opened'],
    autoTasks: [{ title: 'Compile Formal Estate Inventory and Asset Appraisal', priority: 'High', dueDays: 60, role: 'paralegal' }],
  },
  {
    id: 'ws-prob-3',
    practiceAreaId: 'pa-prob',
    stageName: 'Creditor Audit & Final Distribution',
    stageCode: 'PROB-3',
    stageOrder: 3,
    requiredFields: ['Statutory 90-Day Creditor Notice Expired', 'Estate Tax Clearance Received'],
    autoTasks: [{ title: 'File Final Accounting & Petition for Complete Settlement', priority: 'High', dueDays: 20, role: 'attorney' }],
  },

  // 6. Family Law (pa-fam)
  {
    id: 'ws-fam-1',
    practiceAreaId: 'pa-fam',
    stageName: 'Petition & Temporary Orders',
    stageCode: 'FAM-1',
    stageOrder: 1,
    requiredFields: ['Petition Served', 'Financial Declarations Completed'],
    autoTasks: [{ title: 'Request Temporary Custody and Support Hearing', priority: 'Urgent', dueDays: 14, role: 'attorney' }],
  },
  {
    id: 'ws-fam-2',
    practiceAreaId: 'pa-fam',
    stageName: 'Mandatory Mediation & Discovery',
    stageCode: 'FAM-2',
    stageOrder: 2,
    requiredFields: ['Full Financial Disclosures Exchanged', 'Mediation Session Conducted'],
    autoTasks: [{ title: 'Draft Settlement Stipulation or Pre-Trial Readiness Statement', priority: 'High', dueDays: 21, role: 'attorney' }],
  },
  {
    id: 'ws-fam-3',
    practiceAreaId: 'pa-fam',
    stageName: 'Decree Entry & Enforcement',
    stageCode: 'FAM-3',
    stageOrder: 3,
    requiredFields: ['Findings of Fact & Decree Signed by Judge'],
    autoTasks: [{ title: 'Submit Qualified Domestic Relations Order (QDRO)', priority: 'High', dueDays: 15, role: 'paralegal' }],
  },

  // 7. Criminal Defense (pa-crim)
  {
    id: 'ws-crim-1',
    practiceAreaId: 'pa-crim',
    stageName: 'Arraignment & Discovery Review',
    stageCode: 'CRIM-1',
    stageOrder: 1,
    requiredFields: ['Information/Indictment Received', 'Bail Conditions Set'],
    autoTasks: [{ title: 'Review Bodycam Footage & Police Incident Reports', priority: 'High', dueDays: 10, role: 'attorney' }],
  },
  {
    id: 'ws-crim-2',
    practiceAreaId: 'pa-crim',
    stageName: 'Suppression Motions & Plea Talks',
    stageCode: 'CRIM-2',
    stageOrder: 2,
    requiredFields: ['Preliminary Hearing Waived or Conducted', 'Plea Offer Evaluated'],
    autoTasks: [{ title: 'File Fourth Amendment Motion to Suppress Evidence', priority: 'Urgent', dueDays: 14, role: 'attorney' }],
  },
  {
    id: 'ws-crim-3',
    practiceAreaId: 'pa-crim',
    stageName: 'Trial Setting or Sentencing Disposition',
    stageCode: 'CRIM-3',
    stageOrder: 3,
    requiredFields: ['Plea Agreement Executed or Jury Verdict Entered'],
    autoTasks: [{ title: 'Prepare Sentencing Memorandum and Mitigating Exhibits', priority: 'High', dueDays: 14, role: 'attorney' }],
  },

  // 8. Appeals (pa-app)
  {
    id: 'ws-app-1',
    practiceAreaId: 'pa-app',
    stageName: 'Notice of Appeal & Transcripts',
    stageCode: 'APP-1',
    stageOrder: 1,
    requiredFields: ['Timely Notice of Appeal Filed', 'Court Reporter Transcripts Ordered'],
    autoTasks: [{ title: 'Review Trial Record on Appeal Index', priority: 'High', dueDays: 20, role: 'paralegal' }],
  },
  {
    id: 'ws-app-2',
    practiceAreaId: 'pa-app',
    stageName: 'Appellate Briefing Schedule',
    stageCode: 'APP-2',
    stageOrder: 2,
    requiredFields: ['Appellant Opening Brief Filed', 'Appellee Response Brief Logged'],
    autoTasks: [{ title: 'Draft Appellant Reply Brief and Request for Argument', priority: 'Urgent', dueDays: 30, role: 'attorney' }],
  },
  {
    id: 'ws-app-3',
    practiceAreaId: 'pa-app',
    stageName: 'Oral Argument & Opinion Entry',
    stageCode: 'APP-3',
    stageOrder: 3,
    requiredFields: ['Oral Argument Concluded', 'Appellate Court Opinion Issued'],
    autoTasks: [{ title: 'Evaluate Petition for Rehearing or Remand Execution', priority: 'High', dueDays: 14, role: 'attorney' }],
  },

  // 9. Landlord-Tenant / Evictions (pa-evict)
  {
    id: 'ws-evict-1',
    practiceAreaId: 'pa-evict',
    stageName: 'Statutory Notice & Summons',
    stageCode: 'EVICT-1',
    stageOrder: 1,
    requiredFields: ['Three-Day Notice Served', 'Unlawful Detainer Complaint Filed'],
    autoTasks: [{ title: 'Complete Expedited Process Service on Tenant', priority: 'Urgent', dueDays: 3, role: 'paralegal' }],
  },
  {
    id: 'ws-evict-2',
    practiceAreaId: 'pa-evict',
    stageName: 'Occupancy Hearing & Writ',
    stageCode: 'EVICT-2',
    stageOrder: 2,
    requiredFields: ['Immediate Occupancy Hearing Held', 'Order of Restitution Issued'],
    autoTasks: [{ title: 'Deliver Writ of Restitution to County Sheriff', priority: 'Urgent', dueDays: 2, role: 'paralegal' }],
  },
  {
    id: 'ws-evict-3',
    practiceAreaId: 'pa-evict',
    stageName: 'Damages Judgment & Collection',
    stageCode: 'EVICT-3',
    stageOrder: 3,
    requiredFields: ['Physical Possession Restored', 'Treble Damages Proof Filed'],
    autoTasks: [{ title: 'Enter Final Civil Monetary Judgment against Tenant', priority: 'Medium', dueDays: 14, role: 'attorney' }],
  },
];

async function seedWorkflowStages() {
  console.log('Seeding Workflow Stages across all 9 Practice Areas...');

  for (const stage of WORKFLOW_STAGES) {
    await prisma.workflowStage.upsert({
      where: { id: stage.id },
      update: {
        stageName: stage.stageName,
        stageCode: stage.stageCode,
        stageOrder: stage.stageOrder,
        requiredFields: stage.requiredFields,
        autoTasks: stage.autoTasks,
        isActive: true,
      },
      create: {
        id: stage.id,
        practiceAreaId: stage.practiceAreaId,
        stageName: stage.stageName,
        stageCode: stage.stageCode,
        stageOrder: stage.stageOrder,
        requiredFields: stage.requiredFields,
        autoTasks: stage.autoTasks,
        isActive: true,
      },
    });
  }

  console.log(`[SUCCESS] Seeded ${WORKFLOW_STAGES.length} Workflow Stages across all 9 Practice Areas.`);
}

seedWorkflowStages()
  .catch((err) => {
    console.error('Failed to seed workflow stages:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


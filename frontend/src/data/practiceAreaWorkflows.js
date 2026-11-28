/**
 * Configurable Matter Workflows for All 9 Client Practice Areas
 * Filevine Architecture: Configurable stages, gatekeeper checklists, and automated task spawns per practice area
 * Canonical Practice Areas:
 * 1. Appeals (pa-app)
 * 2. Landlord-Tenant / Evictions (pa-evict)
 * 3. Bankruptcy (pa-bk)
 * 4. Immigration (pa-imm)
 * 5. Civil Litigation & Dispute Resolution (pa-civ)
 * 6. Family Law & Domestic Relations (pa-fam)
 * 7. Criminal Defense & State Prosecution Response (pa-crim)
 * 8. Probate & Estate Administration (pa-prob)
 * 9. Personal Injury & Wrongful Death (pa-pi)
 */

export const PRACTICE_AREA_WORKFLOWS = {
  // 1. Civil Litigation & Dispute Resolution (pa-civ)
  'Civil Litigation & Dispute Resolution': [
    {
      id: 'ws-civ-1',
      name: 'Pleadings & Motion Practice',
      code: 'CIV-1',
      requiredFields: ['Conflict Check Cleared (RPC 1.7)', 'Summons & Complaint Served', 'Answer or Responsive Motion Logged'],
      autoTasks: [
        { title: 'Open litigation master physical and digital file', priority: 'High', dueDays: 2, role: 'Paralegal' },
        { title: 'Serve formal litigation hold notice on client records', priority: 'High', dueDays: 3, role: 'Attorney' },
        { title: 'Draft Rule 26 Initial Disclosures', priority: 'High', dueDays: 14, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-civ-2',
      name: 'Written & Electronic Discovery',
      code: 'CIV-2',
      requiredFields: ['Rule 26 Disclosures Exchanged', 'Written Interrogatories & RFPs Served', 'ESI Protocol Order Entered'],
      autoTasks: [
        { title: 'Track 21-day summons response deadline', priority: 'High', dueDays: 21, role: 'Paralegal' },
        { title: 'Produce Responsive Electronic Records & Bates Index', priority: 'High', dueDays: 30, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-civ-3',
      name: 'Depositions & Expert Witness Phase',
      code: 'CIV-3',
      requiredFields: ['Key Party Depositions Transcribed', 'Rule 26(a)(2) Expert Reports Exchanged', 'Expert Witness Depositions Concluded'],
      autoTasks: [
        { title: 'Schedule opposing corporate representative 30(b)(6) deposition', priority: 'High', dueDays: 30, role: 'Attorney' },
        { title: 'Draft Motion for Summary Judgment or Settlement Brief', priority: 'Urgent', dueDays: 28, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-civ-4',
      name: 'Trial Preparation & Judgment',
      code: 'CIV-4',
      requiredFields: ['Pre-Trial Order Entered', 'Jury Instructions Assembled', 'Final Verdict or Settlement Agreement Executed'],
      autoTasks: [
        { title: 'Prepare trial witness exhibit binder', priority: 'High', dueDays: 10, role: 'Paralegal' },
        { title: 'Complete trust closing accounting and disburse funds', priority: 'High', dueDays: 5, role: 'Billing' }
      ]
    }
  ],

  // 2. Family Law & Domestic Relations (pa-fam)
  'Family Law & Domestic Relations': [
    {
      id: 'ws-fam-1',
      name: 'Petition & Temporary Orders',
      code: 'FAM-1',
      requiredFields: ['Petition Served', 'Utah URCP 26.1 Financial Declarations Drafted', 'Temporary Support & Parent-Time Motion Filed'],
      autoTasks: [
        { title: 'Collect 12 months bank statements and 3 years tax returns', priority: 'High', dueDays: 7, role: 'Paralegal' },
        { title: 'Calendar 14-day temporary orders hearing', priority: 'High', dueDays: 14, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-fam-2',
      name: 'Mandatory Mediation & Discovery',
      code: 'FAM-2',
      requiredFields: ['Full Financial Disclosures Exchanged', 'Mediation Session Conducted (Rule 4-510)', 'Child Support Worksheet Calculated'],
      autoTasks: [
        { title: 'Subpoena retirement account balances & QDRO valuations', priority: 'Medium', dueDays: 20, role: 'Paralegal' },
        { title: 'Draft Settlement Stipulation or Pre-Trial Readiness Statement', priority: 'High', dueDays: 21, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-fam-3',
      name: 'Decree Entry & Enforcement',
      code: 'FAM-3',
      requiredFields: ['Findings of Fact & Conclusions of Law Signed', 'Decree of Divorce Entered with Clerk of Court', 'Qualified Domestic Relations Order (QDRO) Executed'],
      autoTasks: [
        { title: 'Serve certified copy of Decree and submit QDRO to plan administrator', priority: 'High', dueDays: 5, role: 'Paralegal' },
        { title: 'Register child support order with Utah ORS', priority: 'Medium', dueDays: 10, role: 'Paralegal' }
      ]
    }
  ],

  // 3. Criminal Defense & State Prosecution Response (pa-crim)
  'Criminal Defense & State Prosecution Response': [
    {
      id: 'ws-crim-1',
      name: 'Arraignment & Discovery Review',
      code: 'CRIM-1',
      requiredFields: ['Information/Indictment Received', 'Entry of Appearance Filed', 'Bail Conditions Set'],
      autoTasks: [
        { title: 'Request police bodycam footage and dashcam video', priority: 'Urgent', dueDays: 3, role: 'Paralegal' },
        { title: 'Review Bodycam Footage & Police Incident Reports', priority: 'High', dueDays: 10, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-crim-2',
      name: 'Suppression Motions & Plea Talks',
      code: 'CRIM-2',
      requiredFields: ['Preliminary Hearing Waived or Conducted', 'Motion to Suppress Evidence Under 4th/5th Amendment Filed', 'Plea Offer Evaluated'],
      autoTasks: [
        { title: 'File Fourth Amendment Motion to Suppress Evidence', priority: 'Urgent', dueDays: 14, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-crim-3',
      name: 'Trial Setting or Sentencing Disposition',
      code: 'CRIM-3',
      requiredFields: ['Plea Agreement Executed or Jury Verdict Entered', 'Sentencing Hearing Concluded', 'Expungement Eligibility Scheduled'],
      autoTasks: [
        { title: 'Prepare Sentencing Memorandum and Mitigating Exhibits', priority: 'High', dueDays: 14, role: 'Attorney' },
        { title: 'Calculate restitution balance and file satisfaction of judgment', priority: 'Medium', dueDays: 30, role: 'Paralegal' }
      ]
    }
  ],

  // 4. Probate & Estate Administration (pa-prob) - Client's Complete 7-Stage Process
  'Probate & Estate Administration': [
    {
      id: 'ws-prob-1',
      name: 'Appointment of Fiduciary',
      code: 'PROB-1',
      requiredFields: ['Death Certificate Logged', 'Original Will Deposited with Clerk', 'Petition for Formal/Informal Appointment Filed', 'Letters Testamentary / Administration Issued'],
      autoTasks: [
        { title: 'Verify death certificate certified copy and deposit original will', priority: 'High', dueDays: 3, role: 'Paralegal' },
        { title: 'Obtain certified Letters Testamentary and secure estate fiduciary bond', priority: 'Urgent', dueDays: 7, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-prob-2',
      name: 'Statutory Notices to Heirs & Creditors',
      code: 'PROB-2',
      requiredFields: ['Notice of Appointment Delivered to Known Heirs', 'Notice to Creditors Published in Legal Newspaper', 'Proof of Publication Filed with Court'],
      autoTasks: [
        { title: 'Publish Notice to Creditors in Salt Lake Tribune / local county paper', priority: 'High', dueDays: 10, role: 'Paralegal' },
        { title: 'Serve formal notice on Utah Department of Health & Human Services (Medicaid estate recovery)', priority: 'High', dueDays: 14, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-prob-3',
      name: 'Creditor Claims Evaluation',
      code: 'PROB-3',
      requiredFields: ['Statutory Creditor Claims Window Monitored (90-Day Cutoff)', 'Creditor Claims Register Reconciled', 'Disallowance Notices Served on Invalid Claims'],
      autoTasks: [
        { title: 'Track statutory 90-day creditor limitation cutoff', priority: 'High', dueDays: 90, role: 'Paralegal' },
        { title: 'Review contested claims and draft Notice of Allowance/Disallowance', priority: 'High', dueDays: 14, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-prob-4',
      name: 'Estate Inventory & Appraisal',
      code: 'PROB-4',
      requiredFields: ['Estate Bank Account Opened with EIN', 'Real Estate & Financial Asset Valuations Secured', 'Formal Estate Inventory Filed with Court or Delivered to Heirs'],
      autoTasks: [
        { title: 'Obtain IRS Estate Employer Identification Number (EIN)', priority: 'High', dueDays: 5, role: 'Paralegal' },
        { title: 'Order appraisals for estate real property and unique personalty', priority: 'Medium', dueDays: 30, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-prob-5',
      name: 'Estate Accounting & Tax Clearance',
      code: 'PROB-5',
      requiredFields: ['Fiduciary Final Income Tax Returns (Form 1041) Filed', 'State & Federal Tax Clearances Obtained', 'Detailed Final Accounting Prepared and Verified'],
      autoTasks: [
        { title: 'Coordinate with estate CPA for final decedent and fiduciary tax returns', priority: 'High', dueDays: 45, role: 'Attorney' },
        { title: 'Audit estate trust/escrow transactions and prepare final reconciliation ledger', priority: 'High', dueDays: 15, role: 'Billing' }
      ]
    },
    {
      id: 'ws-prob-6',
      name: 'Distribution to Beneficiaries',
      code: 'PROB-6',
      requiredFields: ['Proposed Distribution Schedule Approved by Beneficiaries', 'Personal Representative Deeds & Conveyances Executed', 'Beneficiary Receipts and Release Agreements Signed'],
      autoTasks: [
        { title: 'Draft and circulate Receipts and Releases to all heirs/devisees', priority: 'High', dueDays: 10, role: 'Attorney' },
        { title: 'Execute deeds conveying real property from estate to beneficiaries', priority: 'High', dueDays: 7, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-prob-7',
      name: 'Closing & Discharge of Fiduciary',
      code: 'PROB-7',
      requiredFields: ['All Distribution Receipts Filed with Court', 'Petition for Final Settlement & Order of Discharge Filed', 'Formal Order of Discharge Entered and Case Closed'],
      autoTasks: [
        { title: 'File Petition for Complete Settlement and Final Decree of Discharge', priority: 'Urgent', dueDays: 10, role: 'Attorney' },
        { title: 'Archive original probate vault records and transmit closing letter to PR', priority: 'Medium', dueDays: 5, role: 'Paralegal' }
      ]
    }
  ],

  // 5. Appeals (pa-app)
  'Appeals': [
    {
      id: 'ws-app-1',
      name: 'Notice of Appeal & Transcripts',
      code: 'APP-1',
      requiredFields: ['Timely Notice of Appeal Filed (Rule 4)', 'Court Reporter Transcripts Ordered', 'Docketing Statement Filed in Appellate Court'],
      autoTasks: [
        { title: 'Calendar jurisdictional 30-day notice of appeal deadline', priority: 'Urgent', dueDays: 5, role: 'Attorney' },
        { title: 'Review Trial Record on Appeal Index and order trial audio/transcripts', priority: 'High', dueDays: 20, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-app-2',
      name: 'Appellate Briefing Schedule',
      code: 'APP-2',
      requiredFields: ['Appellant Opening Brief Filed & Served', 'Appellee Response Brief Logged', 'Appellant Reply Brief Filed or Waived'],
      autoTasks: [
        { title: 'Draft Appellant Opening Brief and table of authorities', priority: 'High', dueDays: 40, role: 'Attorney' },
        { title: 'Draft Appellant Reply Brief and Request for Argument', priority: 'Urgent', dueDays: 30, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-app-3',
      name: 'Oral Argument & Opinion Entry',
      code: 'APP-3',
      requiredFields: ['Oral Argument Concluded Before Appellate Panel', 'Appellate Court Opinion Issued & Analyzed', 'Remand / Certiorari Decision Documented'],
      autoTasks: [
        { title: 'Conduct Appellate Moot Argument Practice Session', priority: 'High', dueDays: 7, role: 'Attorney' },
        { title: 'Evaluate Petition for Rehearing or Remand Execution in District Court', priority: 'High', dueDays: 14, role: 'Attorney' }
      ]
    }
  ],

  // 6. Landlord-Tenant / Evictions (pa-evict)
  'Landlord-Tenant / Evictions': [
    {
      id: 'ws-evict-1',
      name: 'Statutory Notice & Summons',
      code: 'EVICT-1',
      requiredFields: ['Three-Day Notice to Vacate / Pay Served', 'Proof of Statutory Notice Service Executed', 'Unlawful Detainer Complaint & Summons Filed'],
      autoTasks: [
        { title: 'Verify statutory notice service compliance (Utah Code 78B-6-805)', priority: 'Urgent', dueDays: 2, role: 'Paralegal' },
        { title: 'Complete Expedited Process Service on Tenant', priority: 'Urgent', dueDays: 3, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-evict-2',
      name: 'Occupancy Hearing & Writ',
      code: 'EVICT-2',
      requiredFields: ['Immediate Occupancy Hearing Held', 'Order of Restitution Issued by Court', 'Sheriff Eviction Execution Scheduled'],
      autoTasks: [
        { title: 'Attend expedited occupancy hearing with landlord client', priority: 'Urgent', dueDays: 7, role: 'Attorney' },
        { title: 'Deliver Writ of Restitution to County Sheriff and monitor lockout', priority: 'Urgent', dueDays: 2, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-evict-3',
      name: 'Damages Judgment & Collection',
      code: 'EVICT-3',
      requiredFields: ['Physical Possession Restored to Landlord', 'Treble Damages Proof Filed', 'Final Civil Monetary Judgment Entered'],
      autoTasks: [
        { title: 'Calculate unpaid rent, late fees, and statutory treble damages', priority: 'Medium', dueDays: 10, role: 'Paralegal' },
        { title: 'Enter Final Civil Monetary Judgment against Tenant', priority: 'Medium', dueDays: 14, role: 'Attorney' }
      ]
    }
  ],

  // 7. Bankruptcy (pa-bk)
  'Bankruptcy': [
    {
      id: 'ws-bk-1',
      name: 'Intake & Means Testing Evaluation',
      code: 'BK-1',
      requiredFields: ['Tax Returns Received (2 Years)', '6 Months Paystubs Received', 'Statutory Means Test Calculated (Form 122A/C)'],
      autoTasks: [
        { title: 'Perform Statutory Means Test Calculation (Form 122A/C)', priority: 'High', dueDays: 7, role: 'Attorney' },
        { title: 'Pull comprehensive 3-bureau credit report and creditor addresses', priority: 'Medium', dueDays: 3, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-bk-2',
      name: 'Schedules Assembly & Credit Counseling',
      code: 'BK-2',
      requiredFields: ['Part 1 Credit Counseling Certificate Received', 'Official Bankruptcy Schedules A-J Completed', 'Creditor Matrix Verified'],
      autoTasks: [
        { title: 'Schedule Client Petition Signing and Review Conference', priority: 'High', dueDays: 5, role: 'Paralegal' },
        { title: 'Verify debtor exemption selections under Utah state exemptions', priority: 'High', dueDays: 4, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-bk-3',
      name: 'Court Petition Filing & 341 Prep',
      code: 'BK-3',
      requiredFields: ['Petition Filed with Bankruptcy Court', 'Official Case Number Issued', 'Automatic Stay Notice Confirmed to Creditors'],
      autoTasks: [
        { title: 'Deliver Section 521 Tax Documents to Assigned Trustee', priority: 'Urgent', dueDays: 7, role: 'Paralegal' },
        { title: 'Conduct pre-341 client preparation conference', priority: 'High', dueDays: 14, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-bk-4',
      name: 'Section 341 Meeting of Creditors',
      code: 'BK-4',
      requiredFields: ['341 Examination Concluded by Trustee', 'Trustee Status Report Logged', 'Financial Management Course Certificate Logged'],
      autoTasks: [
        { title: 'Attend 341 Meeting of Creditors with Debtor', priority: 'Urgent', dueDays: 21, role: 'Attorney' },
        { title: 'File Official Financial Management Certificate (Form 423)', priority: 'High', dueDays: 14, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-bk-5',
      name: 'Discharge Order & Case Closure',
      code: 'BK-5',
      requiredFields: ['Trustee Report of No Distribution Entered', 'Discharge Order Entered by Bankruptcy Judge', 'Final Case Closure Logged'],
      autoTasks: [
        { title: 'Verify discharge notice transmission to all listed creditors', priority: 'High', dueDays: 5, role: 'Paralegal' },
        { title: 'Transmit Official Discharge Package to Debtor and close matter', priority: 'Medium', dueDays: 5, role: 'Attorney' }
      ]
    }
  ],

  // 8. Immigration (pa-imm)
  'Immigration': [
    {
      id: 'ws-imm-1',
      name: 'Eligibility & Questionnaire Audit',
      code: 'IMM-1',
      requiredFields: ['Client Identity Documents Verified', 'Prior Immigration & Entry History Cleared', 'USCIS Fee Calculation Confirmed'],
      autoTasks: [
        { title: 'Complete USCIS Petition Questionnaire Form Assembly', priority: 'High', dueDays: 10, role: 'Paralegal' },
        { title: 'Request certified translation of foreign birth and marriage certificates', priority: 'Medium', dueDays: 7, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-imm-2',
      name: 'Petition Assembly & Legal Review',
      code: 'IMM-2',
      requiredFields: ['All Civil Documents Translated and Certified', 'USCIS Form Packet Drafted (I-130, I-485, etc.)', 'Filing Fee Checks Prepared'],
      autoTasks: [
        { title: 'Attorney Final Quality Verification and Form Signing', priority: 'High', dueDays: 5, role: 'Attorney' },
        { title: 'Assemble indexed exhibits and secure courier packaging', priority: 'High', dueDays: 2, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-imm-3',
      name: 'USCIS Filing & I-797C Receipts',
      code: 'IMM-3',
      requiredFields: ['Courier Delivery Confirmed by Lockbox', 'Form I-797C Notice of Action Receipt Logged', 'USCIS Online Case Tracking Activated'],
      autoTasks: [
        { title: 'Set 90-Day USCIS Processing Status Audit Alert', priority: 'Medium', dueDays: 90, role: 'Paralegal' },
        { title: 'Send client official I-797C copy and receipt notice number', priority: 'Medium', dueDays: 3, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-imm-4',
      name: 'Biometrics & RFE Processing',
      code: 'IMM-4',
      requiredFields: ['ASC Biometrics Appointment Attended', 'RFE Response Prepared & Filed (if applicable)'],
      autoTasks: [
        { title: 'Calendar and confirm client attendance at ASC biometrics appointment', priority: 'High', dueDays: 14, role: 'Paralegal' },
        { title: 'Prepare Response to Any Request for Evidence (RFE)', priority: 'Urgent', dueDays: 30, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-imm-5',
      name: 'Field Office Interview & Adjudication',
      code: 'IMM-5',
      requiredFields: ['USCIS Interview Notice Logged', 'Mock Client Interview Executed', 'Field Office Interview Attended'],
      autoTasks: [
        { title: 'Conduct formal mock client interview and update bona fide file', priority: 'High', dueDays: 7, role: 'Attorney' },
        { title: 'Attend USCIS Field Office Interview with Client', priority: 'Urgent', dueDays: 10, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-imm-6',
      name: 'Permanent Residency Approval & Closure',
      code: 'IMM-6',
      requiredFields: ['Approval Notice Received', 'Physical Card Delivery Verified', 'Closing Letter & Safe Return of Originals'],
      autoTasks: [
        { title: 'Verify physical card biometric data and validity date', priority: 'High', dueDays: 3, role: 'Paralegal' },
        { title: 'Deliver Secure Immigration Vault Archival Package to client', priority: 'Low', dueDays: 5, role: 'Attorney' }
      ]
    }
  ],

  // 9. Personal Injury & Wrongful Death (pa-pi)
  'Personal Injury & Wrongful Death': [
    {
      id: 'ws-pi-1',
      name: 'Intake & Evidence Preservation',
      code: 'PI-1',
      requiredFields: ['Conflict Cleared', 'Signed Contingency Retainer Agreement', 'Police Crash / Incident Report Secured', 'Notice of Representation Sent to Insurers'],
      autoTasks: [
        { title: 'Request 911 audio dispatch tapes and scene photography', priority: 'Urgent', dueDays: 3, role: 'Paralegal' },
        { title: 'Open medical lien tracking log for hospital and health insurers', priority: 'High', dueDays: 5, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-pi-2',
      name: 'Investigation & Medical Records',
      code: 'PI-2',
      requiredFields: ['Police Report Received', 'Medical Authorizations Dispatched', 'Complete Medical Records & Billing Ledgers Received'],
      autoTasks: [
        { title: 'Send Letter of Representation to Insurance Adjuster', priority: 'High', dueDays: 3, role: 'Attorney' },
        { title: 'Audit billing statements against Utah health insurance payments', priority: 'Medium', dueDays: 30, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-pi-3',
      name: 'Medical Special Demand Package',
      code: 'PI-3',
      requiredFields: ['Maximum Medical Improvement (MMI) Reached', 'Comprehensive Medical Chronology Compiled', 'Policy Limits Settlement Demand Package Transmitted'],
      autoTasks: [
        { title: 'Review Insurance Policy Limits and Demand Response', priority: 'Medium', dueDays: 30, role: 'Attorney' },
        { title: 'Calendar insurer 30-day bad faith response cutoff', priority: 'High', dueDays: 30, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-pi-4',
      name: 'Pleadings & Formal Service',
      code: 'PI-4',
      requiredFields: ['Complaint Filed in District Court', 'Summons Issued', 'Formal Service of Process Executed'],
      autoTasks: [
        { title: 'Execute Service of Process on Defendant Driver & Owner', priority: 'Urgent', dueDays: 20, role: 'Paralegal' }
      ]
    },
    {
      id: 'ws-pi-5',
      name: 'Fact & Expert Discovery',
      code: 'PI-5',
      requiredFields: ['Rule 26 Initial Disclosures Exchanged', 'Written Interrogatories Served', 'Expert Witness Reports Exchanged'],
      autoTasks: [
        { title: 'Depose Defendant Driver & Defense Medical Examiner', priority: 'High', dueDays: 45, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-pi-6',
      name: 'Mediation & Pre-Trial Readiness',
      code: 'PI-6',
      requiredFields: ['Mediation Statement Submitted', 'Rule 26(a)(4) Pretrial Disclosures Ready', 'Pre-Trial Settlement Conference Conducted'],
      autoTasks: [
        { title: 'Conduct Formal Pre-Trial Settlement Conference', priority: 'Urgent', dueDays: 14, role: 'Attorney' }
      ]
    },
    {
      id: 'ws-pi-7',
      name: 'Resolution, Liens & Disbursement',
      code: 'PI-7',
      requiredFields: ['Settlement Agreement Executed', 'Healthcare Subrogation Liens Negotiated', 'Utah RPC 1.5(c) Disbursement Statement Approved by Client'],
      autoTasks: [
        { title: 'Negotiate hospital and health insurance subrogation liens down', priority: 'High', dueDays: 10, role: 'Attorney' },
        { title: 'Draft Settlement Closing Statement and Disburse Trust Funds', priority: 'High', dueDays: 7, role: 'Billing' }
      ]
    }
  ]
};

export const PRACTICE_AREA_NAME_TO_ID = {
  'Civil Litigation & Dispute Resolution': 'pa-civ',
  'Family Law & Domestic Relations': 'pa-fam',
  'Criminal Defense & State Prosecution Response': 'pa-crim',
  'Probate & Estate Administration': 'pa-prob',
  'Appeals': 'pa-app',
  'Landlord-Tenant / Evictions': 'pa-evict',
  'Bankruptcy': 'pa-bk',
  'Immigration': 'pa-imm',
  'Personal Injury & Wrongful Death': 'pa-pi'
};

export const PRACTICE_AREA_ID_TO_NAME = {
  'pa-civ': 'Civil Litigation & Dispute Resolution',
  'pa-fam': 'Family Law & Domestic Relations',
  'pa-crim': 'Criminal Defense & State Prosecution Response',
  'pa-prob': 'Probate & Estate Administration',
  'pa-app': 'Appeals',
  'pa-evict': 'Landlord-Tenant / Evictions',
  'pa-bk': 'Bankruptcy',
  'pa-imm': 'Immigration',
  'pa-pi': 'Personal Injury & Wrongful Death'
};

export const getWorkflowForPracticeArea = (practiceAreaNameOrId) => {
  if (!practiceAreaNameOrId) return PRACTICE_AREA_WORKFLOWS['Civil Litigation & Dispute Resolution'];
  
  if (PRACTICE_AREA_WORKFLOWS[practiceAreaNameOrId]) {
    return PRACTICE_AREA_WORKFLOWS[practiceAreaNameOrId];
  }
  
  const nameFromId = PRACTICE_AREA_ID_TO_NAME[practiceAreaNameOrId];
  if (nameFromId && PRACTICE_AREA_WORKFLOWS[nameFromId]) {
    return PRACTICE_AREA_WORKFLOWS[nameFromId];
  }

  return PRACTICE_AREA_WORKFLOWS['Civil Litigation & Dispute Resolution'];
};

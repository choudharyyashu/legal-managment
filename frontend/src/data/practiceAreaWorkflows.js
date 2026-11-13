/**
 * Configurable Matter Workflows for All 9 Practice Areas
 * Filevine Model: Configurable stages, required fields, and automated task spawns per practice area
 */

export const PRACTICE_AREA_WORKFLOWS = {
  // 1. Civil Litigation & Dispute Resolution
  'Civil Litigation & Dispute Resolution': [
    {
      id: 'civ-1',
      name: 'Intake & Conflicts',
      code: 'INT',
      requiredFields: ['Conflict Check Cleared (RPC 1.7)', 'Master Engagement Retainer Signed', 'IOLTA Deposit Recorded'],
      autoTasks: [
        { title: 'Open litigation master physical and digital file', priority: 'High', dueDays: 2, role: 'Paralegal' },
        { title: 'Serve formal litigation hold notice on client records', priority: 'High', dueDays: 3, role: 'Attorney' }
      ]
    },
    {
      id: 'civ-2',
      name: 'Pleadings & Service',
      code: 'PLD',
      requiredFields: ['Summons & Complaint Filed with Court', 'Formal Proof of Service on Registered Agent', 'Defendant Answer or Default Logged'],
      autoTasks: [
        { title: 'Track 21-day summons response deadline', priority: 'High', dueDays: 21, role: 'Paralegal' },
        { title: 'Draft Utah URCP Rule 26 initial disclosures', priority: 'Medium', dueDays: 14, role: 'Attorney' }
      ]
    },
    {
      id: 'civ-3',
      name: 'Fact Discovery',
      code: 'DISC',
      requiredFields: ['Utah R. Civ. P. 26 Initial Disclosures Exchanged', 'Written Interrogatories & RFPs Served', 'Key Fact Witness Depositions Completed'],
      autoTasks: [
        { title: 'Schedule opposing corporate representative 30(b)(6) deposition', priority: 'High', dueDays: 30, role: 'Attorney' },
        { title: 'Index electronic document production exhibits', priority: 'Medium', dueDays: 20, role: 'Paralegal' }
      ]
    },
    {
      id: 'civ-4',
      name: 'Expert Discovery',
      code: 'EXP',
      requiredFields: ['Rule 26(a)(2) Expert Reports Exchanged', 'Expert Rebuttal Disclosures Served', 'Expert Witness Depositions Concluded'],
      autoTasks: [
        { title: 'Retain damages/economic expert witness and deliver file', priority: 'High', dueDays: 15, role: 'Attorney' }
      ]
    },
    {
      id: 'civ-5',
      name: 'Dispositive Motions & Pre-Trial',
      code: 'MOT',
      requiredFields: ['Rule 56 Summary Judgment Briefing Concluded', 'Pre-Trial Settlement Conference Completed', 'Jury Instructions Filed'],
      autoTasks: [
        { title: 'Prepare trial witness exhibit binder', priority: 'High', dueDays: 10, role: 'Paralegal' }
      ]
    },
    {
      id: 'civ-6',
      name: 'Trial & Resolution',
      code: 'TRL',
      requiredFields: ['Final Verdict or Settlement Agreement Executed', 'Disbursement Statement Approved (Rule 1.5(c))', 'Formal Order of Dismissal Entered'],
      autoTasks: [
        { title: 'Complete trust closing accounting and disburse funds', priority: 'High', dueDays: 5, role: 'Billing' }
      ]
    }
  ],

  // 2. Family Law & Domestic Relations
  'Family Law & Domestic Relations': [
    {
      id: 'fam-1',
      name: 'Petition & Temporary Orders',
      code: 'PET',
      requiredFields: ['Petition for Divorce / Custody Filed', 'Utah URCP 26.1 Financial Declarations Drafted', 'Temporary Support & Parent-Time Motion Filed'],
      autoTasks: [
        { title: 'Collect 12 months bank statements and 3 years tax returns', priority: 'High', dueDays: 7, role: 'Paralegal' },
        { title: 'Calendar 14-day temporary orders hearing', priority: 'High', dueDays: 14, role: 'Attorney' }
      ]
    },
    {
      id: 'fam-2',
      name: 'Mandatory Financial Disclosures',
      code: 'DISC',
      requiredFields: ['Formal URCP 26.1 Financial Disclosure Exchange', 'Real Property & Pension Appraisals Received', 'Child Support Worksheet Calculated'],
      autoTasks: [
        { title: 'Subpoena retirement account balances & QDRO valuations', priority: 'Medium', dueDays: 20, role: 'Paralegal' }
      ]
    },
    {
      id: 'fam-3',
      name: 'Custody Evaluation & Mediation',
      code: 'MED',
      requiredFields: ['Mandatory Court Mediation Conducted (Rule 4-510)', 'Custody Evaluator / Guardian ad Litem Report Filed', 'Parenting Plan Formulated'],
      autoTasks: [
        { title: 'Prepare mediation marital balance sheet and property division', priority: 'High', dueDays: 10, role: 'Attorney' }
      ]
    },
    {
      id: 'fam-4',
      name: 'Decree, QDRO & Enforcement',
      code: 'DEC',
      requiredFields: ['Final Findings of Fact & Conclusions of Law Signed', 'Decree of Divorce Entered with Clerk of Court', 'Qualified Domestic Relations Order (QDRO) Executed'],
      autoTasks: [
        { title: 'Serve certified copy of Decree and submit QDRO to plan administrator', priority: 'High', dueDays: 5, role: 'Paralegal' },
        { title: 'Register child support order with Utah ORS', priority: 'Medium', dueDays: 10, role: 'Paralegal' }
      ]
    }
  ],

  // 3. Criminal Defense & State Prosecution Response
  'Criminal Defense & State Prosecution Response': [
    {
      id: 'crim-1',
      name: 'Arrest, Bail & Initial Appearance',
      code: 'ARR',
      requiredFields: ['Entry of Appearance Filed', 'Rule 16 Formal Discovery Demand Served on Prosecutor', 'Bail Hearing & Pre-Trial Release Conditions Set'],
      autoTasks: [
        { title: 'Request police bodycam footage and dashcam video', priority: 'Urgent', dueDays: 3, role: 'Paralegal' },
        { title: 'Calendar Initial Appearance in District Court', priority: 'High', dueDays: 5, role: 'Attorney' }
      ]
    },
    {
      id: 'crim-2',
      name: 'Preliminary Hearing & Arraignment',
      code: 'PRE',
      requiredFields: ['Preliminary Examination Conducted or Waived', 'District Court Arraignment Completed', 'Plea of Not Guilty Entered'],
      autoTasks: [
        { title: 'Evaluate probable cause bindover transcript', priority: 'High', dueDays: 10, role: 'Attorney' }
      ]
    },
    {
      id: 'crim-3',
      name: 'Suppression Motions & Negotiations',
      code: 'MOT',
      requiredFields: ['Motion to Suppress Evidence Under 4th/5th Amendment Filed', 'Evidentiary Suppression Hearing Argued', 'State Plea Offer Analyzed with Client'],
      autoTasks: [
        { title: 'Draft motion in limine to exclude unconstitutional search', priority: 'High', dueDays: 14, role: 'Attorney' }
      ]
    },
    {
      id: 'crim-4',
      name: 'Plea Agreement or Jury Trial',
      code: 'TRL',
      requiredFields: ['Statement in Support of Plea Signed or Voir Dire Conducted', 'Trial Verdict or Sentence Hearing Concluded', 'Expungement Eligibility Scheduled'],
      autoTasks: [
        { title: 'Calculate restitution balance and file satisfaction of judgment', priority: 'Medium', dueDays: 30, role: 'Paralegal' }
      ]
    }
  ],

  // 4. Estate Planning, Wills & Trust Administration
  'Estate Planning, Wills & Trust Administration': [
    {
      id: 'est-1',
      name: 'Intake & Asset Inventory',
      code: 'INT',
      requiredFields: ['Family Tree & Beneficiary Questionnaire Completed', 'Real Property Deeds & Account Titles Collected', 'Tax Basis & Federal Exemption Assessed'],
      autoTasks: [
        { title: 'Pull county land records for real estate property legal descriptions', priority: 'Medium', dueDays: 5, role: 'Paralegal' }
      ]
    },
    {
      id: 'est-2',
      name: 'Master Trust & Will Drafting',
      code: 'DFT',
      requiredFields: ['Revocable Living Trust Instrument Drafted', 'Pour-Over Last Will & Testament Prepared', 'Financial Power of Attorney & Healthcare Directive Formatted'],
      autoTasks: [
        { title: 'Transmit draft estate portfolio to client for review', priority: 'High', dueDays: 10, role: 'Attorney' }
      ]
    },
    {
      id: 'est-3',
      name: 'Signing Ceremony & Execution',
      code: 'SGN',
      requiredFields: ['In-Office Execution with 2 Disinterested Witnesses', 'Utah Statutory Notary Acknowledgment Affixed', 'Original Documents Archived in Firm Safe'],
      autoTasks: [
        { title: 'Provide client digital and bound leather binder of executed estate plan', priority: 'High', dueDays: 3, role: 'Paralegal' }
      ]
    },
    {
      id: 'est-4',
      name: 'Trust Funding & Deed Recording',
      code: 'FND',
      requiredFields: ['Warranty Deed to Trust Recorded with County Recorder', 'Bank & Brokerage Account Retitling Instructions Delivered', 'Beneficiary Designations Updated'],
      autoTasks: [
        { title: 'Confirm county recording confirmation of trust conveyance deeds', priority: 'High', dueDays: 15, role: 'Paralegal' }
      ]
    }
  ],

  // 5. Commercial & Corporate Law
  'Commercial & Corporate Law': [
    {
      id: 'corp-1',
      name: 'Structuring & Name Clearance',
      code: 'STR',
      requiredFields: ['Utah Division of Corporations Name Availability Cleared', 'Tax Entity Classification Selected (LLC/C-Corp/S-Corp)', 'Registered Agent Retainer Executed'],
      autoTasks: [
        { title: 'Check trademark conflict on USPTO TESS database', priority: 'Medium', dueDays: 3, role: 'Paralegal' }
      ]
    },
    {
      id: 'corp-2',
      name: 'Entity Formation & Articles',
      code: 'FIL',
      requiredFields: ['Articles of Organization / Incorporation Filed', 'IRS Employer Identification Number (EIN) Obtained', 'Utah State Tax Commission Account Created'],
      autoTasks: [
        { title: 'Download certified stamp certificate of organization', priority: 'High', dueDays: 2, role: 'Paralegal' }
      ]
    },
    {
      id: 'corp-3',
      name: 'Operating Agreement & Governance',
      code: 'GOV',
      requiredFields: ['Comprehensive Member-Managed Operating Agreement Executed', 'Initial Board / Member Resolutions Adopted', 'Capital Contributions Ledger Logged'],
      autoTasks: [
        { title: 'Issue company membership unit certificates and transfer ledger', priority: 'Medium', dueDays: 7, role: 'Attorney' }
      ]
    },
    {
      id: 'corp-4',
      name: 'Commercial Contracts & Ongoing Compliance',
      code: 'CMP',
      requiredFields: ['Master Service Agreement (MSA) Template Provided', 'Utah Annual Business Renewal Scheduled', 'Proprietary Inventions & NDA Executed'],
      autoTasks: [
        { title: 'Set recurring annual corporate compliance calendar trigger', priority: 'Medium', dueDays: 300, role: 'Paralegal' }
      ]
    }
  ],

  // 6. Real Estate, Water Rights & Land Use
  'Real Estate, Water Rights & Land Use': [
    {
      id: 'prop-1',
      name: 'Title & Water Rights Due Diligence',
      code: 'DIL',
      requiredFields: ['Preliminary Title Report Reviewed', 'Division of Water Rights (DWR) Water Right Appurtenance Verified', 'Boundary Survey & Easement Map Inspected'],
      autoTasks: [
        { title: 'Order title commitment and water right search report from state engineer', priority: 'High', dueDays: 5, role: 'Paralegal' }
      ]
    },
    {
      id: 'prop-2',
      name: 'Land Use Permitting & Board of Adjustment',
      code: 'PERM',
      requiredFields: ['Zoning Variance / Special Exception Application Filed', 'County Board of Adjustment Public Notice Published', 'Hydrology / Traffic Impact Study Completed'],
      autoTasks: [
        { title: 'Prepare evidentiary brief for planning commission hearing', priority: 'High', dueDays: 14, role: 'Attorney' }
      ]
    },
    {
      id: 'prop-3',
      name: 'Conveyance & Closing Instruments',
      code: 'CLS',
      requiredFields: ['Special Warranty Deed & Water Right Deed Drafted', 'Escrow Settlement Statement Reconciled', 'Title Policy Endorsements Confirmed'],
      autoTasks: [
        { title: 'File Report of Water Right Conveyance with Utah State Engineer', priority: 'High', dueDays: 3, role: 'Attorney' }
      ]
    }
  ],

  // 7. Personal Injury & Wrongful Death
  'Personal Injury & Wrongful Death': [
    {
      id: 'inj-1',
      name: 'Intake & Evidence Preservation',
      code: 'INT',
      requiredFields: ['Police Crash / Incident Report Secured', 'Notice of Representation Sent to All Insurers', 'Spoliation of Evidence Letter Served on Defendant'],
      autoTasks: [
        { title: 'Request 911 audio dispatch tapes and scene photography', priority: 'Urgent', dueDays: 3, role: 'Paralegal' },
        { title: 'Open medical lien tracking log for hospital and health insurers', priority: 'High', dueDays: 5, role: 'Paralegal' }
      ]
    },
    {
      id: 'inj-2',
      name: 'Treatment Monitoring & Records Collection',
      code: 'MED',
      requiredFields: ['Maximum Medical Improvement (MMI) Reached', 'Complete Medical Records & Billing Ledgers Received', 'Lost Wage & Economic Loss Verification Secured'],
      autoTasks: [
        { title: 'Audit billing statements against Utah health insurance payments', priority: 'Medium', dueDays: 30, role: 'Paralegal' }
      ]
    },
    {
      id: 'inj-3',
      name: 'Pre-Litigation Settlement Demand',
      code: 'DEM',
      requiredFields: ['Comprehensive Medical Chronology Compiled', 'Policy Limits Settlement Demand Package Transmitted', '30-Day Policy Tender Deadline Monitored'],
      autoTasks: [
        { title: 'Calendar insurer 30-day bad faith response cutoff', priority: 'High', dueDays: 30, role: 'Attorney' }
      ]
    },
    {
      id: 'inj-4',
      name: 'Litigation, Mediation & Disbursement',
      code: 'RES',
      requiredFields: ['Formal Summons & Complaint Filed in District Court', 'Mediation Concluded with Executed Release', 'Utah RPC 1.5(c) Disbursement Statement Approved by Client'],
      autoTasks: [
        { title: 'Negotiate hospital and health insurance subrogation liens down', priority: 'High', dueDays: 10, role: 'Attorney' },
        { title: 'Disburse net settlement recovery check to client', priority: 'High', dueDays: 5, role: 'Billing' }
      ]
    }
  ],

  // 8. Municipal, Administrative & Water Law
  'Municipal, Administrative & Water Law': [
    {
      id: 'mun-1',
      name: 'Agency Action & Notice of Appeal',
      code: 'PET',
      requiredFields: ['Notice of Agency Action Reviewed', 'Formal Petition for Review Filed Under Utah APA', 'Stay of Administrative Enforcement Requested'],
      autoTasks: [
        { title: 'Confirm 30-day administrative appeal limitation date', priority: 'Urgent', dueDays: 5, role: 'Attorney' }
      ]
    },
    {
      id: 'mun-2',
      name: 'Administrative Hearing & Record',
      code: 'HRG',
      requiredFields: ['Official Agency Record Certified & Indexed', 'Direct Testimony & Expert Affidavits Filed', 'Evidentiary Hearing Argued Before ALJ / State Engineer'],
      autoTasks: [
        { title: 'Order certified transcript of administrative hearing', priority: 'High', dueDays: 7, role: 'Paralegal' }
      ]
    },
    {
      id: 'mun-3',
      name: 'Final Agency Order & Judicial Review',
      code: 'ORD',
      requiredFields: ['Final Administrative Order Issued', 'Petition for Judicial Review in Utah District Court Filed', 'Appellate Briefing Concluded'],
      autoTasks: [
        { title: 'Serve notice of judicial review on Utah Attorney General', priority: 'High', dueDays: 10, role: 'Attorney' }
      ]
    }
  ],

  // 9. Labor, Employment & Workforce Compliance
  'Labor, Employment & Workforce Compliance': [
    {
      id: 'lab-1',
      name: 'Intake & UALD / EEOC Charge',
      code: 'EEOC',
      requiredFields: ['Dual Charge Filed with Utah Antidiscrimination Division (UALD)', 'Statute of Limitations (180/300 Days) Calculated', 'Employer Position Statement Received'],
      autoTasks: [
        { title: 'Draft rebuttal to employer position statement', priority: 'High', dueDays: 20, role: 'Attorney' }
      ]
    },
    {
      id: 'lab-2',
      name: 'Right to Sue & Federal Complaint',
      code: 'COMP',
      requiredFields: ['Notice of Right to Sue Issued by EEOC', 'Complaint Filed in U.S. District Court (District of Utah)', 'Initial Scheduling Conference Completed'],
      autoTasks: [
        { title: 'Track strictly enforced 90-day federal filing cutoff', priority: 'Urgent', dueDays: 90, role: 'Paralegal' }
      ]
    },
    {
      id: 'lab-3',
      name: 'Discovery & Summary Judgment Defense',
      code: 'DISC',
      requiredFields: ['Depositions of Supervisors & Human Resources Completed', 'Plaintiff Deposition Defended', 'Opposition to Employer Rule 56 Motion Filed'],
      autoTasks: [
        { title: 'Compile comparator employee disciplinary records', priority: 'High', dueDays: 25, role: 'Attorney' }
      ]
    },
    {
      id: 'lab-4',
      name: 'Settlement or Federal Jury Trial',
      code: 'SET',
      requiredFields: ['Federal Magistrate Settlement Conference Attended', 'Severance / Settlement Agreement Executed', 'Confidential Consideration Disbursed'],
      autoTasks: [
        { title: 'Ensure client executes ADEA 21-day review and 7-day revocation waiver', priority: 'High', dueDays: 7, role: 'Attorney' }
      ]
    }
  ]
};

export const getWorkflowForPracticeArea = (practiceAreaName) => {
  if (!practiceAreaName) return PRACTICE_AREA_WORKFLOWS['Civil Litigation & Dispute Resolution'];
  return (
    PRACTICE_AREA_WORKFLOWS[practiceAreaName] ||
    PRACTICE_AREA_WORKFLOWS['Civil Litigation & Dispute Resolution']
  );
};


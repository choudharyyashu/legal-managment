// Mock Data for 5 Specialized Practice Workspaces (Sections 20-24)
// Built specifically for Utah Jurisdiction & District Court Rules

export const MOCK_PROBATE_CASES = [
  {
    id: 'prb-001',
    caseNumber: '243900142-PR',
    estateName: 'Estate of Arthur Pendelton Vance',
    decedent: 'Arthur Pendelton Vance',
    dateOfDeath: '2024-08-14',
    estateType: 'Testate (Supervised)',
    court: 'Third District Court - Salt Lake County (Probate Div)',
    judge: 'Hon. Elizabeth Hruby-Mills',
    personalRepresentative: 'Eleanor Vance Sterling (Daughter)',
    fiduciaryBond: 'Waived per Will § 4.2',
    lettersStatus: 'Letters Testamentary Issued (2024-09-02)',
    noticeToCreditorsDate: '2024-09-10',
    barDate: '2024-12-10', // 90 days / 3 months in Utah
    barDateStatus: 'Active (28 days remaining)',
    totalInventoryValue: 1845000,
    probateAssetsValue: 1250000,
    nonProbateAssetsValue: 595000,
    estateAccountBalance: 342150.80,
    status: 'Inventory & Claims Stage',
    inventory: [
      { id: 'inv-1', category: 'Real Property', description: 'Primary Residence: 4820 S Wasatch Blvd, Holladay, UT 84124', appraisedValue: 850000, probateType: 'Probate Asset', status: 'Appraisal Confirmed' },
      { id: 'inv-2', category: 'Liquid Accounts', description: 'Zions Bank Checking #4812 (Estate Account transferred)', appraisedValue: 342150.80, probateType: 'Probate Asset', status: 'Liquidated to Estate Account' },
      { id: 'inv-3', category: 'Securities', description: 'Fidelity Brokerage TOD to Eleanor Vance', appraisedValue: 595000, probateType: 'Non-Probate (TOD/POD)', status: 'Distributed by Operation of Law' },
      { id: 'inv-4', category: 'Personalty', description: '1967 Vintage Jaguar E-Type (Title with Estate)', appraisedValue: 57849.20, probateType: 'Probate Asset', status: 'Inspected & Titled' }
    ],
    creditorClaims: [
      { id: 'clm-1', claimant: 'Intermountain Health - St. Mark’s', amount: 14820.50, claimDate: '2024-09-25', status: 'Allowed - Awaiting Final Accounting', statutoryPriority: 'Class 4: Medical Expenses' },
      { id: 'clm-2', claimant: 'Chase Card Services', amount: 8410.22, claimDate: '2024-10-02', status: 'Disputed (Unauthorized Post-Death Charges)', statutoryPriority: 'Class 7: General Unsecured' },
      { id: 'clm-3', claimant: 'Salt Lake County Treasurer (Property Tax)', amount: 3950.00, claimDate: '2024-09-18', status: 'Paid in Full', statutoryPriority: 'Class 2: Taxes & Assessments' }
    ],
    beneficiaries: [
      { id: 'ben-1', name: 'Eleanor Vance Sterling', relation: 'Daughter / PR', share: '50% Residuary + Real Property', distributionStatus: 'Pending Final Decree' },
      { id: 'ben-2', name: 'Julian Vance', relation: 'Son', share: '50% Residuary', distributionStatus: 'Pending Final Decree' },
      { id: 'ben-3', name: 'Shriners Hospitals for Children', relation: 'Specific Bequest', share: '$25,000 Cash Bequest', distributionStatus: 'Approved for Disbursement' }
    ]
  },
  {
    id: 'prb-002',
    caseNumber: '243900289-PR',
    estateName: 'Estate of Miriam O. Christensen',
    decedent: 'Miriam O. Christensen',
    dateOfDeath: '2024-10-01',
    estateType: 'Intestate (Formal Administration)',
    court: 'Fourth District Court - Utah County (Provo)',
    judge: 'Hon. Thomas Low',
    personalRepresentative: 'David Christensen (Son - Petition Pending)',
    fiduciaryBond: '$100,000 Corporate Surety Filed',
    lettersStatus: 'Hearing on Petition Set (2024-11-28)',
    noticeToCreditorsDate: 'Pending Appointment',
    barDate: 'Uncalculated',
    barDateStatus: 'Pending Letters',
    totalInventoryValue: 620000,
    probateAssetsValue: 620000,
    nonProbateAssetsValue: 0,
    estateAccountBalance: 0,
    status: 'Initial Petition Stage',
    inventory: [
      { id: 'inv-201', category: 'Real Property', description: 'Single Family Home: 1420 N Canyon Rd, Provo, UT', appraisedValue: 510000, probateType: 'Probate Asset', status: 'Pending Title Search' },
      { id: 'inv-202', category: 'Liquid Accounts', description: 'Mountain America CU Savings', appraisedValue: 110000, probateType: 'Probate Asset', status: 'Frozen Pending Letters' }
    ],
    creditorClaims: [],
    beneficiaries: [
      { id: 'ben-201', name: 'David Christensen', relation: 'Son / Petitioner', share: '33.3% Intestate Share', distributionStatus: 'Pending PR Appointment' },
      { id: 'ben-202', name: 'Rachel Christensen Adams', relation: 'Daughter', share: '33.3% Intestate Share', distributionStatus: 'Pending PR Appointment' },
      { id: 'ben-203', name: 'Benjamin Christensen', relation: 'Son', share: '33.3% Intestate Share', distributionStatus: 'Pending PR Appointment' }
    ]
  }
];

export const MOCK_FAMILY_CASES = [
  {
    id: 'fam-001',
    caseNumber: '244901844-DM',
    caseTitle: 'Sterling v. Sterling (Divorce & Custody)',
    petitioner: 'Melissa Sterling',
    respondent: 'Garrett Sterling',
    dateOfMarriage: '2012-06-16',
    dateOfSeparation: '2024-04-10',
    court: 'Third District Court - Salt Lake City',
    judge: 'Hon. Laura Scott',
    children: [
      { name: 'Mason Sterling', age: 10, dob: '2014-03-12' },
      { name: 'Chloe Sterling', age: 7, dob: '2017-08-22' }
    ],
    custodyArrangement: 'Joint Legal Custody / Petitioner Primary Physical (245 overnights)',
    statutorySupportStatus: 'Worksheet Computed (Utah Code § 78B-12-205)',
    monthlyChildSupport: 1248.00,
    monthlyAlimony: 1850.00,
    petitionerGrossIncome: 4200.00,
    respondentGrossIncome: 11500.00,
    mandatoryDisclosuresStatus: 'Rule 26.1 Financial Declarations Exchanged',
    safetyOrders: {
      hasProtectiveOrder: false,
      hasCivilStipulation: true,
      stipulationDetails: 'Mutual restraining order against transferring marital assets; Peaceful contact via OurFamilyWizard app only'
    },
    propertySchedule: [
      { id: 'prop-1', item: 'Marital Residence (Sugar House)', fmv: 780000, encumbrance: 340000, equity: 440000, classification: 'Marital', proposedAward: 'Petitioner (Refinance Buyout $220k)' },
      { id: 'prop-2', item: 'Garrett Tech 401(k) Plan', fmv: 310000, encumbrance: 0, equity: 310000, classification: 'Marital', proposedAward: 'Equal Division via QDRO ($155k each)' },
      { id: 'prop-3', item: 'Tesla Model Y 2022', fmv: 360000, encumbrance: 18000, equity: 18000, classification: 'Marital', proposedAward: 'Respondent' },
      { id: 'prop-4', item: 'Inherited Aspen Cabin (Petitioner)', fmv: 420000, encumbrance: 0, equity: 420000, classification: 'Separate Property (Petitioner)', proposedAward: '100% Retained by Petitioner' }
    ],
    qdroStatus: 'Model QDRO Prepared for TechCorp Retirement Plan; Pre-approved by Plan Administrator'
  },
  {
    id: 'fam-002',
    caseNumber: '244902105-DM',
    caseTitle: 'Navarro v. Navarro (Parenting Modification)',
    petitioner: 'Carlos Navarro',
    respondent: 'Elena Navarro',
    dateOfMarriage: '2016-10-04',
    dateOfSeparation: '2022-01-15',
    court: 'Second District Court - Farmington',
    judge: 'Hon. David Connors',
    children: [
      { name: 'Lucas Navarro', age: 6, dob: '2018-05-19' }
    ],
    custodyArrangement: 'Petitioner Petitions for 50/50 Equal Parent-Time (182.5 overnights)',
    statutorySupportStatus: 'Recalculation Pending Mediation',
    monthlyChildSupport: 430.00,
    monthlyAlimony: 0.00,
    petitionerGrossIncome: 6500.00,
    respondentGrossIncome: 5800.00,
    mandatoryDisclosuresStatus: 'Petitioner Declaration Filed; Respondent Overdue (URCP 26.1(c))',
    safetyOrders: {
      hasProtectiveOrder: false,
      hasCivilStipulation: false,
      stipulationDetails: 'Standard URCP 109 automatic domestic injunction active'
    },
    propertySchedule: [],
    qdroStatus: 'N/A - Custody Only'
  }
];

export const MOCK_CRIMINAL_CASES = [
  {
    id: 'crm-001',
    caseNumber: '241904812-FS',
    defendant: 'Derrick Michael Vance',
    court: 'Third District Court - Salt Lake City',
    judge: 'Hon. Vernice Trease',
    prosecutor: 'Deputy DA Bradley Morris (Salt Lake County DA)',
    defenseAttorney: 'Eleanor Heugly, Esq.',
    custodyStatus: 'Released on Pretrial Supervision ($25,000 Bail Bond Posted)',
    releaseConditions: 'No alcohol/controlled substances; Weekly UA testing; GPS ankle monitor; No contact with alleged victim J.K.',
    counts: [
      { countNo: 1, charge: 'Aggravated Assault (Weapon Enhancement)', statute: 'Utah Code § 76-5-103', degree: 'Third Degree Felony', penalty: '0-5 Years Utah State Prison / $5,000 Fine', status: 'Active Plea Bargaining' },
      { countNo: 2, charge: 'Criminal Mischief ($1,500 - $5,000)', statute: 'Utah Code § 76-6-106', degree: 'Class A Misdemeanor', penalty: 'Up to 364 Days Salt Lake County Jail', status: 'Active Plea Bargaining' },
      { countNo: 3, charge: 'Intoxication in Public', statute: 'Utah Code § 76-9-701', degree: 'Class C Misdemeanor', penalty: 'Up to 90 Days Jail / $750 Fine', status: 'Dismissal Stipulation Agreed' }
    ],
    rule16Discovery: [
      { item: 'SLCPD Incident Report #24-118942', type: 'Police Narrative', status: 'Received (68 pages)', dateReceived: '2024-09-15' },
      { item: 'Axon Body-Worn Camera (Officers Peterson & Vance)', type: 'BWC Video (4 angles, 2h 45m)', status: 'Received & Logged in Evidence Vault', dateReceived: '2024-09-22' },
      { item: 'Utah State Crime Lab Ballistics/Forensic Report', type: 'Forensic Lab', status: 'Pending Production by State (Overdue 14 days)', dateReceived: 'Pending' },
      { item: 'Brady/Giglio Request regarding Officer disciplinary records', type: 'Exculpatory Material', status: 'Formal Motion to Compel Filed', dateReceived: 'Pending' }
    ],
    pleaOffer: {
      offerSummary: 'Plead guilty to Count 2 (Class A Misdemeanor); Count 1 (3rd Degree Felony) dismissed with prejudice; 24 months probation with anger management & restitution',
      expirationDate: '2024-11-20 (5 days remaining)',
      mitigationPrepared: 'Defendant completed 60-day inpatient program; clean drug screens; character letters from employer',
      clientPosition: 'Recommended Acceptance by Counsel; Pending Final Client Signing'
    },
    expungementEligibility: 'Eligible for Utah Clean Slate Petition 3 years after completion of Class A probation'
  },
  {
    id: 'crm-002',
    caseNumber: '241905201-MD',
    defendant: 'Kyle J. Robertson',
    court: 'Sandy Justice Court',
    judge: 'Hon. Paul Farr',
    prosecutor: 'City Prosecutor Marcus Green',
    defenseAttorney: 'Thomas Bludworth, Esq.',
    custodyStatus: 'Own Recognizance (OR Release)',
    releaseConditions: 'Standard statutory conditions; No contact with Maverick store on 90th South',
    counts: [
      { countNo: 1, charge: 'Retail Theft (< $500)', statute: 'Utah Code § 76-6-602', degree: 'Class B Misdemeanor', penalty: 'Up to 6 months jail / $1,000 fine', status: 'Diversion Application Pending' }
    ],
    rule16Discovery: [
      { item: 'Sandy City PD Incident Report', type: 'Police Narrative', status: 'Received', dateReceived: '2024-10-10' },
      { item: 'CCTV Surveillance Footage (Maverick Store)', type: 'Video Evidence', status: 'Received', dateReceived: '2024-10-12' }
    ],
    pleaOffer: {
      offerSummary: 'Plea in Abeyance (PIA) for 12 months: $250 court fee, 20 hours community service; Dismissal upon completion',
      expirationDate: '2024-12-05',
      mitigationPrepared: 'First-time nonviolent offender; Full restitution tendered',
      clientPosition: 'Accepted; Hearing set for Plea in Abeyance entry'
    },
    expungementEligibility: 'Automatic immediate expungement upon completion of Plea in Abeyance dismissal'
  }
];

export const MOCK_APPEALS_CASES = [
  {
    id: 'app-001',
    appellateCaseNumber: '20240412-CA',
    lowerCourtNumber: '210905189',
    caseTitle: 'Apex Industrial Corp. v. Mountain West Logistics, LLC',
    court: 'Utah Court of Appeals',
    lowerCourt: 'Third District Court - Salt Lake (Hon. Barry Lawrence)',
    partyRole: 'Appellant (Mountain West Logistics)',
    appealType: 'Direct Appeal from Final Judgment on Summary Judgment',
    standardOfReview: 'De Novo Review (Summary Judgment interpretation of contract)',
    jurisdictionalNoticeDate: '2024-06-15 (Filed on Day 28 of 30-day window under Utah R. App. P. 4)',
    recordCompleteness: {
      indexFiled: true,
      transcriptsOrdered: true,
      transcriptsDelivered: 'Completed (4 volumes, 842 pages filed by Reporter Sandra Nelson)',
      recordMasterStatus: 'Certified Record on Appeal Received from District Clerk (2024-07-20)'
    },
    briefingSchedule: [
      { phase: 'Appellant Opening Brief', wordLimit: '14,000 words (URAP 24)', dueDate: '2024-08-30', filedDate: '2024-08-28', status: 'Filed & Accepted (12,840 words)' },
      { phase: 'Appellee Response Brief', wordLimit: '14,000 words (URAP 24)', dueDate: '2024-10-15', filedDate: '2024-10-14', status: 'Filed & Accepted (13,100 words)' },
      { phase: 'Appellant Reply Brief', wordLimit: '7,000 words (URAP 24)', dueDate: '2024-11-05', filedDate: '2024-11-04', status: 'Filed & Accepted (5,420 words)' },
      { phase: 'Oral Argument', wordLimit: 'N/A', dueDate: '2024-12-12 10:00 AM', filedDate: null, status: 'Argument Scheduled (Panel: Judges Orme, Harris, Christiansen)' }
    ],
    mandateStatus: 'Briefing Complete - Awaiting Oral Argument & Appellate Opinion'
  },
  {
    id: 'app-002',
    appellateCaseNumber: '20240689-SC',
    lowerCourtNumber: '220401140',
    caseTitle: 'State of Utah v. Vance',
    court: 'Utah Supreme Court',
    lowerCourt: 'Utah Court of Appeals (Certiorari Review)',
    partyRole: 'Petitioner / Appellant',
    appealType: 'Petition for Writ of Certiorari (Utah R. App. P. 45)',
    standardOfReview: 'Constitutional Statutory Interpretation (De Novo)',
    jurisdictionalNoticeDate: '2024-09-01',
    recordCompleteness: {
      indexFiled: true,
      transcriptsOrdered: true,
      transcriptsDelivered: 'Completed',
      recordMasterStatus: 'Transferred from Court of Appeals'
    },
    briefingSchedule: [
      { phase: 'Petition for Certiorari', wordLimit: '20 pages', dueDate: '2024-09-30', filedDate: '2024-09-28', status: 'Granted by Supreme Court' },
      { phase: 'Petitioner Opening Merits Brief', wordLimit: '14,000 words', dueDate: '2024-12-15', filedDate: null, status: 'Drafting in Progress' }
    ],
    mandateStatus: 'Certiorari Granted; Merits Briefing Underway'
  }
];

export const MOCK_EVICTIONS_CASES = [
  {
    id: 'evc-001',
    caseNumber: '240908814-EV',
    propertyAddress: '1480 E 3900 S, Apt #204, Millcreek, UT 84124',
    representationRole: 'Landlord Representation (Wasatch Peak Properties)',
    tenantNames: 'Marcus Thorne & Sarah Jenkins',
    leaseType: '12-Month Residential Lease ($1,950/mo)',
    securityDeposit: 2000.00,
    delinquentRent: 5850.00, // 3 months
    lateFeesOwed: 225.00,
    totalClaimAmount: 6075.00,
    statutoryNotice: {
      type: 'Utah 3-Day Notice to Pay or Quit (Utah Code § 78B-6-802)',
      servedDate: '2024-10-02',
      serviceMethod: 'Personal In-Hand Service by Constable J. Wright',
      cureDeadline: '2024-10-05 11:59 PM',
      cureStatus: 'Expired Without Cure (Default Established)'
    },
    courtAction: {
      complaintFiledDate: '2024-10-08',
      summonsServedDate: '2024-10-10',
      occupancyHearingDate: '2024-10-22 (Third District Court - Salt Lake)',
      occupancyOutcome: 'Order of Restitution Entered by Court',
      possessionBond: 'Waived per Landlord Motion'
    },
    trebleDamagesCalculator: {
      unlawfulDetainerDays: 24,
      dailyRentRate: 65.00,
      actualRentOwed: 1560.00,
      trebleDamageMultiplier: 3,
      trebledDamagesTotal: 4680.00,
      statutoryAttorneyFees: 1250.00,
      courtCosts: 360.00,
      totalJudgmentProjected: 12140.00
    },
    sheriffEnforcement: {
      writIssuedDate: '2024-10-25',
      sheriffNoticePostedDate: '2024-10-28',
      lockoutExecutionDate: '2024-10-31 09:00 AM (Lockout Executed by Deputy Sheriff)',
      propertyStorageStatus: 'Tenant belongings inventoried per Utah Code § 78B-6-816 (30-day storage lien active)'
    }
  },
  {
    id: 'evc-002',
    caseNumber: '240402219-EV',
    propertyAddress: '880 W Center St, Unit B, Provo, UT 84601',
    representationRole: 'Tenant Defense (Representing Maria Gomez)',
    tenantNames: 'Maria Gomez',
    leaseType: 'Month-to-Month Residential ($1,400/mo)',
    securityDeposit: 1400.00,
    delinquentRent: 1400.00,
    lateFeesOwed: 0.00,
    totalClaimAmount: 1400.00,
    statutoryNotice: {
      type: 'Defective 3-Day Notice (Failed to state precise amount / No cure instructions)',
      servedDate: '2024-10-18',
      serviceMethod: 'Improper Service (Taped to exterior gate, not dwelling unit door)',
      cureDeadline: '2024-10-21',
      cureStatus: 'Defective Notice Motion to Dismiss Prepared'
    },
    courtAction: {
      complaintFiledDate: '2024-10-25',
      summonsServedDate: '2024-10-28',
      occupancyHearingDate: '2024-11-18 (Fourth District Court - Provo)',
      occupancyOutcome: 'Pending Hearing on Motion to Quash / Dismiss',
      possessionBond: 'Counter-bond requested by Tenant'
    },
    trebleDamagesCalculator: {
      unlawfulDetainerDays: 0,
      dailyRentRate: 46.66,
      actualRentOwed: 1400.00,
      trebleDamageMultiplier: 1,
      trebledDamagesTotal: 1400.00,
      statutoryAttorneyFees: 0,
      courtCosts: 0,
      totalJudgmentProjected: 0
    },
    sheriffEnforcement: {
      writIssuedDate: null,
      sheriffNoticePostedDate: null,
      lockoutExecutionDate: null,
      propertyStorageStatus: 'Tenancy Active; Rent escrowed with court registry'
    }
  }
];


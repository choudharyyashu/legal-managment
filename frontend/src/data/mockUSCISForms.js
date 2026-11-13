// Official Immigration Form Catalog & Diagnostic Inventory
// Reference: USCIS, EOIR, DOS, DOL (DEMO / SIMULATED)

export const MOCK_USCIS_FORMS = [
  {
    id: 'FORM-I-130',
    code: 'I-130',
    title: 'Petition for Alien Relative',
    agency: 'USCIS',
    category: 'Family-Based Immigrant',
    editionDate: '04/01/24 (Expires 03/31/27)',
    filingFee: 535,
    biometricsFee: 0,
    onlineFilingAvailable: true,
    description: 'Establishes qualifying family relationship for immediate relatives and family preference categories.',
    mandatoryAttachments: [
      'Proof of petitioner U.S. citizenship or lawful permanent residence (Passport/Birth Cert/Form I-551)',
      'Proof of bona fide marital relationship or parent-child civil birth record',
      'Passport-style 2x2 color photographs of petitioner and beneficiary',
      'Certified translation affidavit for all non-English foreign records'
    ],
    validationRules: [
      { field: 'petitionerCitizenshipDoc', label: 'Proof of Petitioner Citizenship', required: true },
      { field: 'marriageCertificate', label: 'Certified Marriage Certificate', required: true },
      { field: 'passportPhotos', label: '2x2 Color Passport Photos', required: true },
    ]
  },
  {
    id: 'FORM-I-485',
    code: 'I-485',
    title: 'Application to Register Permanent Residence or Adjust Status',
    agency: 'USCIS',
    category: 'Adjustment of Status (Green Card)',
    editionDate: '04/01/24',
    filingFee: 1440,
    biometricsFee: 0,
    onlineFilingAvailable: false,
    description: 'Application for foreign nationals physically present in the United States to obtain Lawful Permanent Resident status.',
    mandatoryAttachments: [
      'Copy of Form I-94 Arrival-Departure Record with valid class of admission',
      'Certified copy of applicant birth certificate with English translation',
      'Form I-693 Report of Immigration Medical Examination (Sealed Envelope)',
      'Form I-864 Affidavit of Support with petitioner Federal Tax Transcripts (IRS 1040 / W-2)',
      'Government-issued identity document with photograph'
    ],
    validationRules: [
      { field: 'i94Record', label: 'Form I-94 Arrival-Departure Record', required: true },
      { field: 'medicalExamI693', label: 'Sealed Form I-693 Medical Exam', required: true },
      { field: 'affidavitI864', label: 'Executed Form I-864 with Tax Transcripts', required: true },
    ]
  },
  {
    id: 'FORM-I-765',
    code: 'I-765',
    title: 'Application for Employment Authorization (EAD)',
    agency: 'USCIS',
    category: 'Employment Authorization',
    editionDate: '08/28/24',
    filingFee: 520,
    biometricsFee: 0,
    onlineFilingAvailable: true,
    description: 'Requests work authorization document for eligible adjustment applicants, DACA recipients, or asylum seekers.',
    mandatoryAttachments: [
      'Two identical 2x2 color passport photos taken within 30 days',
      'Copy of Form I-485 filing receipt notice (if filing concurrently or pending adjustment)',
      'Copy of prior Employment Authorization Card (front and back) if previously issued'
    ],
    validationRules: [
      { field: 'eligibilityCategory', label: 'Eligibility Code (e.g. (c)(9) Pending Adjustment)', required: true },
      { field: 'passportPhotosEAD', label: 'Two 2x2 Passport Photographs', required: true },
    ]
  },
  {
    id: 'FORM-I-131',
    code: 'I-131',
    title: 'Application for Travel Documents (Advance Parole / Reentry Permit)',
    agency: 'USCIS',
    category: 'Travel Authorization',
    editionDate: '04/01/24',
    filingFee: 630,
    biometricsFee: 0,
    onlineFilingAvailable: false,
    description: 'Enables pending adjustment applicants to travel internationally without abandoning their pending green card application.',
    mandatoryAttachments: [
      'Copy of official photo identity document (foreign passport or driver license)',
      'Copy of Form I-485 receipt notice confirming pending adjustment status',
      'Statement outlining emergent or business justification for international travel'
    ],
    validationRules: [
      { field: 'travelJustification', label: 'Travel Purpose Statement', required: true },
    ]
  },
  {
    id: 'FORM-I-864',
    code: 'I-864',
    title: 'Affidavit of Support Under Section 213A of the INA',
    agency: 'USCIS',
    category: 'Financial Affidavit & Public Charge',
    editionDate: '12/08/21',
    filingFee: 0,
    biometricsFee: 0,
    onlineFilingAvailable: false,
    description: 'Legally binding contract with U.S. Government establishing that sponsor maintains beneficiary at >= 125% HHS poverty line.',
    mandatoryAttachments: [
      'IRS Tax Return Transcripts for the most recent federal tax year',
      'Form W-2s / 1099s confirming current sustained employment',
      'Proof of sponsor U.S. citizenship or lawful permanent resident status',
      'Evidence of liquid assets if income is below 125% HHS poverty line threshold'
    ],
    validationRules: [
      { field: 'taxTranscripts', label: 'Recent IRS 1040 Tax Transcripts', required: true },
      { field: 'hhsPovertyLineTest', label: 'Income Exceeds 125% HHS Poverty Guideline', required: true },
    ]
  },
  {
    id: 'FORM-G-28',
    code: 'G-28',
    title: 'Notice of Entry of Appearance as Attorney or Accredited Representative',
    agency: 'USCIS',
    category: 'Legal Representation',
    editionDate: '05/23/22',
    filingFee: 0,
    biometricsFee: 0,
    onlineFilingAvailable: true,
    description: 'Notifies Department of Homeland Security that Heugly & Bludworth represents client in immigration proceeding.',
    mandatoryAttachments: [
      'Utah State Bar license confirmation and Bar Number for responsible partner',
      'Original signatures of attorney, petitioner, and foreign national beneficiary'
    ],
    validationRules: [
      { field: 'attorneyBarNumber', label: 'Utah State Bar Attorney Number', required: true },
      { field: 'clientSignatureG28', label: 'Dual Signatures of Client and Counsel', required: true },
    ]
  },
  {
    id: 'FORM-N-400',
    code: 'N-400',
    title: 'Application for Naturalization',
    agency: 'USCIS',
    category: 'Citizenship',
    editionDate: '04/01/24',
    filingFee: 760,
    biometricsFee: 0,
    onlineFilingAvailable: true,
    description: 'Application for lawful permanent residents to naturalize and become United States Citizens.',
    mandatoryAttachments: [
      'Copy of Lawful Permanent Resident card (Form I-551 Green Card)',
      'Proof of marital union (if applying under 3-year expedited spouse rule)',
      'Certified disposition records for any civil citations or traffic violations'
    ],
    validationRules: [
      { field: 'continuousResidence', label: '5-Year (or 3-Year) Continuous Residence', required: true },
      { field: 'goodMoralCharacter', label: 'Statutory Good Moral Character Disclosures', required: true },
    ]
  },
  {
    id: 'FORM-EOIR-42B',
    code: 'EOIR-42B',
    title: 'Application for Cancellation of Removal and Adjustment for Nonpermanent Residents',
    agency: 'EOIR',
    category: 'Immigration Court Defense',
    editionDate: '02/10/21',
    filingFee: 100,
    biometricsFee: 85,
    onlineFilingAvailable: false,
    description: 'Defense against deportation before Executive Office for Immigration Review (EOIR) Immigration Judges.',
    mandatoryAttachments: [
      'Proof of 10 years continuous physical presence in the United States prior to NTA',
      'Evidence of qualifying U.S. Citizen or LPR spouse, parent, or child',
      'Documentation of exceptional and extremely unusual hardship to qualifying relatives'
    ],
    validationRules: [
      { field: 'tenYearPresence', label: '10 Years Continuous Physical Presence Evidence', required: true },
      { field: 'qualifyingRelativeHardship', label: 'Exceptional & Extremely Unusual Hardship Package', required: true },
    ]
  }
];

export const getFormByCode = (code) => MOCK_USCIS_FORMS.find(f => f.code === code);


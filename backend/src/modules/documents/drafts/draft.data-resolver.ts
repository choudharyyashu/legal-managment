import { MissingFieldFlag } from './draft.types.js';

export interface FieldDictionaryEntity {
  entity: string;
  label: string;
  fields: Array<{ field: string; label: string; exampleTag: string; defaultFormat?: string }>;
}

export const FIELD_DICTIONARY: FieldDictionaryEntity[] = [
  {
    entity: 'Client',
    label: 'Client Profile',
    fields: [
      { field: 'name', label: 'Full Legal Name', exampleTag: '{{Client.Name}}' },
      { field: 'clientNumber', label: 'Client Number', exampleTag: '{{Client.ClientNumber}}' },
      { field: 'clientType', label: 'Client Type', exampleTag: '{{Client.ClientType}}' },
      { field: 'primaryContact', label: 'Primary Contact', exampleTag: '{{Client.PrimaryContact}}' },
      { field: 'email', label: 'Email Address', exampleTag: '{{Client.Email}}' },
      { field: 'phone', label: 'Phone Number', exampleTag: '{{Client.Phone}}', defaultFormat: 'PHONE_STANDARD' },
      { field: 'address', label: 'Mailing Address', exampleTag: '{{Client.Address}}' },
    ],
  },
  {
    entity: 'Matter',
    label: 'Legal Matter',
    fields: [
      { field: 'matterNumber', label: 'Matter Number', exampleTag: '{{Matter.MatterNumber}}' },
      { field: 'title', label: 'Matter Title / Caption', exampleTag: '{{Matter.Title}}' },
      { field: 'status', label: 'Matter Status', exampleTag: '{{Matter.Status}}' },
      { field: 'courtName', label: 'Court Name', exampleTag: '{{Matter.CourtName}}' },
      { field: 'judge', label: 'Presiding Judge', exampleTag: '{{Matter.Judge}}' },
      { field: 'caseDocketNumber', label: 'Case / Docket Number', exampleTag: '{{Matter.CaseDocketNumber}}' },
      { field: 'billingType', label: 'Billing Type', exampleTag: '{{Matter.BillingType}}' },
      { field: 'hourlyRate', label: 'Hourly Rate', exampleTag: '{{Matter.HourlyRate}}', defaultFormat: 'CURRENCY_USD' },
      { field: 'flatFeeAmount', label: 'Flat Fee Amount', exampleTag: '{{Matter.FlatFeeAmount}}', defaultFormat: 'CURRENCY_USD' },
      { field: 'contingencyPercentage', label: 'Contingency %', exampleTag: '{{Matter.ContingencyPercentage}}' },
      { field: 'openDate', label: 'Open Date', exampleTag: '{{Matter.OpenDate}}', defaultFormat: 'DATE_LONG' },
      { field: 'statuteOfLimitations', label: 'Statute of Limitations', exampleTag: '{{Matter.StatuteOfLimitations}}', defaultFormat: 'DATE_LONG' },
    ],
  },
  {
    entity: 'ResponsibleAttorney',
    label: 'Responsible Attorney',
    fields: [
      { field: 'name', label: 'Attorney Name', exampleTag: '{{Attorney.Name}}' },
      { field: 'email', label: 'Attorney Email', exampleTag: '{{Attorney.Email}}' },
      { field: 'phone', label: 'Attorney Phone', exampleTag: '{{Attorney.Phone}}', defaultFormat: 'PHONE_STANDARD' },
      { field: 'title', label: 'Title / Bar Role', exampleTag: '{{Attorney.Title}}' },
    ],
  },
  {
    entity: 'Court',
    label: 'Court & Caption',
    fields: [
      { field: 'name', label: 'Court Name', exampleTag: '{{Court.Name}}' },
      { field: 'judge', label: 'Judge Name', exampleTag: '{{Court.Judge}}' },
      { field: 'caseDocketNumber', label: 'Docket Number', exampleTag: '{{Court.CaseDocketNumber}}' },
    ],
  },
  {
    entity: 'Intake',
    label: 'Intake & Conflicts',
    fields: [
      { field: 'intakeNumber', label: 'Intake Number', exampleTag: '{{Intake.IntakeNumber}}' },
      { field: 'adverseParties', label: 'Adverse Parties', exampleTag: '{{Intake.AdverseParties}}' },
      { field: 'matterSummary', label: 'Matter Summary', exampleTag: '{{Intake.MatterSummary}}' },
      { field: 'disputeAmount', label: 'Dispute Amount', exampleTag: '{{Intake.DisputeAmount}}', defaultFormat: 'CURRENCY_USD' },
      { field: 'jurisdictionVenue', label: 'Jurisdiction / Venue', exampleTag: '{{Intake.JurisdictionVenue}}' },
    ],
  },
  {
    entity: 'Incident',
    label: 'PI Incident & Liability',
    fields: [
      { field: 'accidentDate', label: 'Incident / Accident Date', exampleTag: '{{Incident.AccidentDate}}', defaultFormat: 'DATE_LONG' },
      { field: 'accidentType', label: 'Accident Type', exampleTag: '{{Incident.AccidentType}}' },
      { field: 'incidentLocation', label: 'Incident Location', exampleTag: '{{Incident.IncidentLocation}}' },
      { field: 'policeAgency', label: 'Police Agency', exampleTag: '{{Incident.PoliceAgency}}' },
      { field: 'reportNumber', label: 'Police Report Number', exampleTag: '{{Incident.ReportNumber}}' },
      { field: 'description', label: 'Incident Description', exampleTag: '{{Incident.Description}}' },
    ],
  },
  {
    entity: 'Insurance',
    label: 'PI Insurance & Adjuster',
    fields: [
      { field: 'insuranceCompany', label: 'Carrier Name', exampleTag: '{{Insurance.CarrierName}}' },
      { field: 'policyNumber', label: 'Policy Number', exampleTag: '{{Insurance.PolicyNumber}}' },
      { field: 'claimNumber', label: 'Claim Number', exampleTag: '{{Insurance.ClaimNumber}}' },
      { field: 'adjusterName', label: 'Adjuster Name', exampleTag: '{{Insurance.AdjusterName}}' },
      { field: 'adjusterPhone', label: 'Adjuster Phone', exampleTag: '{{Insurance.AdjusterPhone}}' },
      { field: 'adjusterEmail', label: 'Adjuster Email', exampleTag: '{{Insurance.AdjusterEmail}}' },
    ],
  },
  {
    entity: 'MedicalProvider',
    label: 'Medical Provider',
    fields: [
      { field: 'name', label: 'Provider Name', exampleTag: '{{MedicalProvider.Name}}' },
      { field: 'address', label: 'Facility Address', exampleTag: '{{MedicalProvider.Address}}' },
      { field: 'phone', label: 'Provider Phone', exampleTag: '{{MedicalProvider.Phone}}' },
      { field: 'fax', label: 'Provider Fax', exampleTag: '{{MedicalProvider.Fax}}' },
    ],
  },
  {
    entity: 'Demand',
    label: 'PI Settlement Demand',
    fields: [
      { field: 'recipientCarrier', label: 'Recipient Carrier', exampleTag: '{{Demand.RecipientCarrier}}' },
      { field: 'claimNumber', label: 'Claim Number', exampleTag: '{{Demand.ClaimNumber}}' },
      { field: 'demandedAmount', label: 'Demanded Amount', exampleTag: '{{Demand.DemandedAmount}}', defaultFormat: 'CURRENCY_USD' },
      { field: 'policyLimitAmount', label: 'Policy Limit', exampleTag: '{{Demand.PolicyLimitAmount}}', defaultFormat: 'CURRENCY_USD' },
      { field: 'deadlineDate', label: 'Response Deadline', exampleTag: '{{Demand.DeadlineDate}}', defaultFormat: 'DATE_LONG' },
    ],
  },
  {
    entity: 'Litigation',
    label: 'Civil & Commercial Litigation',
    fields: [
      { field: 'courtJurisdiction', label: 'Jurisdiction', exampleTag: '{{Litigation.CourtJurisdiction}}' },
      { field: 'caseDocketNumber', label: 'Docket Number', exampleTag: '{{Litigation.CaseDocketNumber}}' },
      { field: 'presidingJudge', label: 'Presiding Judge', exampleTag: '{{Litigation.PresidingJudge}}' },
      { field: 'litigationStage', label: 'Litigation Stage', exampleTag: '{{Litigation.LitigationStage}}' },
      { field: 'trialDate', label: 'Trial Date', exampleTag: '{{Litigation.TrialDate}}', defaultFormat: 'DATE_LONG' },
      { field: 'discoveryCutoffDate', label: 'Discovery Cutoff', exampleTag: '{{Litigation.DiscoveryCutoffDate}}', defaultFormat: 'DATE_LONG' },
    ],
  },
  {
    entity: 'Bankruptcy',
    label: 'Bankruptcy Case',
    fields: [
      { field: 'chapter', label: 'Chapter (7/11/13)', exampleTag: '{{Bankruptcy.Chapter}}' },
      { field: 'caseNumber', label: 'Bankruptcy Case No.', exampleTag: '{{Bankruptcy.CaseNumber}}' },
      { field: 'courtDistrict', label: 'Court District', exampleTag: '{{Bankruptcy.CourtDistrict}}' },
      { field: 'trusteeName', label: 'Assigned Trustee', exampleTag: '{{Bankruptcy.TrusteeName}}' },
      { field: 'meeting341Date', label: '341 Meeting Date', exampleTag: '{{Bankruptcy.Meeting341Date}}', defaultFormat: 'DATE_LONG' },
      { field: 'monthlyGrossIncome', label: 'Monthly Gross Income', exampleTag: '{{Bankruptcy.MonthlyGrossIncome}}', defaultFormat: 'CURRENCY_USD' },
    ],
  },
  {
    entity: 'Immigration',
    label: 'Immigration Case',
    fields: [
      { field: 'visaCategory', label: 'Visa Category', exampleTag: '{{Immigration.VisaCategory}}' },
      { field: 'beneficiaryName', label: 'Beneficiary Name', exampleTag: '{{Immigration.BeneficiaryName}}' },
      { field: 'alienRegistrationNum', label: 'A-Number', exampleTag: '{{Immigration.AlienRegistrationNum}}' },
      { field: 'i94Number', label: 'I-94 Number', exampleTag: '{{Immigration.I94Number}}' },
      { field: 'priorityDate', label: 'Priority Date', exampleTag: '{{Immigration.PriorityDate}}', defaultFormat: 'DATE_LONG' },
    ],
  },
  {
    entity: 'Probate',
    label: 'Probate & Estate',
    fields: [
      { field: 'decedentName', label: 'Decedent Name', exampleTag: '{{Probate.DecedentName}}' },
      { field: 'dateOfDeath', label: 'Date of Death', exampleTag: '{{Probate.DateOfDeath}}', defaultFormat: 'DATE_LONG' },
      { field: 'probateType', label: 'Probate Type', exampleTag: '{{Probate.ProbateType}}' },
      { field: 'personalRepName', label: 'Personal Representative', exampleTag: '{{Probate.PersonalRepName}}' },
      { field: 'courtCaseNumber', label: 'Probate Case No.', exampleTag: '{{Probate.CourtCaseNumber}}' },
    ],
  },
  {
    entity: 'FamilyLaw',
    label: 'Family Law',
    fields: [
      { field: 'caseType', label: 'Case Type', exampleTag: '{{FamilyLaw.CaseType}}' },
      { field: 'marriageDate', label: 'Marriage Date', exampleTag: '{{FamilyLaw.MarriageDate}}', defaultFormat: 'DATE_LONG' },
      { field: 'separationDate', label: 'Separation Date', exampleTag: '{{FamilyLaw.SeparationDate}}', defaultFormat: 'DATE_LONG' },
      { field: 'custodyArrangement', label: 'Custody Arrangement', exampleTag: '{{FamilyLaw.CustodyArrangement}}' },
      { field: 'monthlyChildSupport', label: 'Monthly Child Support', exampleTag: '{{FamilyLaw.MonthlyChildSupport}}', defaultFormat: 'CURRENCY_USD' },
    ],
  },
  {
    entity: 'Criminal',
    label: 'Criminal Defense',
    fields: [
      { field: 'defendantName', label: 'Defendant Name', exampleTag: '{{Criminal.DefendantName}}' },
      { field: 'prosecutingAgency', label: 'Prosecuting Agency', exampleTag: '{{Criminal.ProsecutingAgency}}' },
      { field: 'custodyStatus', label: 'Custody Status', exampleTag: '{{Criminal.CustodyStatus}}' },
      { field: 'bailAmount', label: 'Bail Amount', exampleTag: '{{Criminal.BailAmount}}', defaultFormat: 'CURRENCY_USD' },
      { field: 'arraignmentDate', label: 'Arraignment Date', exampleTag: '{{Criminal.ArraignmentDate}}', defaultFormat: 'DATE_LONG' },
    ],
  },
  {
    entity: 'Appeals',
    label: 'Appeals',
    fields: [
      { field: 'appellateCourt', label: 'Appellate Court', exampleTag: '{{Appeals.AppellateCourt}}' },
      { field: 'appellateDocketNumber', label: 'Appellate Docket No.', exampleTag: '{{Appeals.AppellateDocketNumber}}' },
      { field: 'lowerCourtName', label: 'Lower Court Name', exampleTag: '{{Appeals.LowerCourtName}}' },
      { field: 'openingBriefDeadline', label: 'Opening Brief Deadline', exampleTag: '{{Appeals.OpeningBriefDeadline}}', defaultFormat: 'DATE_LONG' },
    ],
  },
  {
    entity: 'Evictions',
    label: 'Landlord-Tenant / Evictions',
    fields: [
      { field: 'propertyAddress', label: 'Property Address', exampleTag: '{{Evictions.PropertyAddress}}' },
      { field: 'tenantName', label: 'Tenant Name', exampleTag: '{{Evictions.TenantName}}' },
      { field: 'landlordName', label: 'Landlord Name', exampleTag: '{{Evictions.LandlordName}}' },
      { field: 'monthlyRent', label: 'Monthly Rent', exampleTag: '{{Evictions.MonthlyRent}}', defaultFormat: 'CURRENCY_USD' },
      { field: 'outstandingBalance', label: 'Outstanding Balance', exampleTag: '{{Evictions.OutstandingBalance}}', defaultFormat: 'CURRENCY_USD' },
      { field: 'noticeType', label: 'Statutory Notice Type', exampleTag: '{{Evictions.NoticeType}}' },
    ],
  },
  {
    entity: 'Firm',
    label: 'Law Firm Identity',
    fields: [
      { field: 'name', label: 'Firm Name', exampleTag: '{{Firm.Name}}' },
      { field: 'address', label: 'Firm Address', exampleTag: '{{Firm.Address}}' },
      { field: 'phone', label: 'Firm Phone', exampleTag: '{{Firm.Phone}}' },
      { field: 'email', label: 'Firm Email', exampleTag: '{{Firm.Email}}' },
    ],
  },
  {
    entity: 'CurrentDate',
    label: 'Current Date',
    fields: [
      { field: 'long', label: 'Long Date (November 25, 2026)', exampleTag: '{{CurrentDate.Long}}' },
      { field: 'short', label: 'Short Date (11/25/2026)', exampleTag: '{{CurrentDate.Short}}' },
      { field: 'court', label: 'Court Caption Date', exampleTag: '{{CurrentDate.Court}}' },
      { field: 'year', label: 'Four-Digit Year', exampleTag: '{{CurrentDate.Year}}' },
    ],
  },
  {
    entity: 'CustomField',
    label: 'Custom / Override Field',
    fields: [
      { field: 'customValue', label: 'Custom Field Key', exampleTag: '{{CustomField.CustomValue}}' },
    ],
  },
];

export class DraftDataResolver {
  private static formatOrdinal(day: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    return day + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  private static formatDate(dateVal: any, style: 'DATE_LONG' | 'DATE_SHORT' | 'DATE_COURT'): string {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return String(dateVal);

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    switch (style) {
      case 'DATE_LONG':
        return `${month} ${day}, ${year}`;
      case 'DATE_SHORT':
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
      case 'DATE_COURT':
        return `${this.formatOrdinal(day)} day of ${month}, ${year}`;
      default:
        return `${month} ${day}, ${year}`;
    }
  }

  private static formatCurrency(val: any): string {
    if (val === null || val === undefined || val === '') return '$0.00';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  }

  private static formatPhone(val: any): string {
    if (!val) return '';
    const cleaned = String(val).replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return String(val);
  }

  private static formatValue(val: any, rule?: string | null): any {
    if (val === null || val === undefined) return val;
    if (!rule || rule === 'NONE') return val;

    switch (rule) {
      case 'UPPERCASE':
        return String(val).toUpperCase();
      case 'LOWERCASE':
        return String(val).toLowerCase();
      case 'TITLECASE':
        return String(val)
          .toLowerCase()
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      case 'DATE_LONG':
      case 'DATE_SHORT':
      case 'DATE_COURT':
        return this.formatDate(val, rule);
      case 'CURRENCY_USD':
        return this.formatCurrency(val);
      case 'PHONE_STANDARD':
        return this.formatPhone(val);
      default:
        return val;
    }
  }

  private static getSourceRecordDetails(
    sourceEntity: string,
    sourceField: string
  ): {
    recordType: string;
    navigationUrl: string;
    suggestedTitle: string;
    suggestedDescription: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
  } {
    const sField = (sourceField || '').toLowerCase();
    const sEntity = (sourceEntity || '').toLowerCase();

    if (sEntity === 'insurance' || sField.includes('claim') || sField.includes('adjuster') || sField.includes('policy')) {
      return {
        recordType: 'Insurance & Claims Record',
        navigationUrl: '/personal-injury/insurance',
        suggestedTitle: sField.includes('claim')
          ? 'Follow-up: Missing Adverse Insurance Claim Number'
          : sField.includes('adjuster')
          ? 'Follow-up: Missing Adverse Adjuster Details'
          : 'Follow-up: Missing Insurance Policy Details',
        suggestedDescription: `Missing ${sourceEntity}.${sourceField} is required for document generation. Please contact the carrier or client to obtain and update this record.`,
        priority: 'High',
      };
    }

    if (sEntity === 'incident' || sField.includes('accident') || sField.includes('police') || sField.includes('reportnumber')) {
      return {
        recordType: 'Incident & Liability Investigation',
        navigationUrl: '/personal-injury/incident',
        suggestedTitle: sField.includes('report')
          ? 'Follow-up: Missing Official Police Accident Report'
          : 'Follow-up: Missing Incident & Collision Details',
        suggestedDescription: `Missing ${sourceEntity}.${sourceField} is required for representation and liability notices. Please obtain and update the incident record.`,
        priority: 'High',
      };
    }

    if (sEntity === 'medicalprovider' || sEntity === 'provider') {
      return {
        recordType: 'Treating Medical Provider',
        navigationUrl: '/personal-injury/medical',
        suggestedTitle: 'Follow-up: Missing Medical Provider Contact & Facility Details',
        suggestedDescription: `Facility address and provider details for ${sourceField} are required for medical records requests. Please update the provider registry.`,
        priority: 'Medium',
      };
    }

    if (sEntity === 'medicalrecords' || sField.includes('record')) {
      return {
        recordType: 'Medical Records Ledger',
        navigationUrl: '/personal-injury/medical',
        suggestedTitle: 'Follow-up: Overdue Medical Records Inquiry',
        suggestedDescription: `Medical records or treatment status (${sourceField}) are missing or overdue. A follow-up deficiency request is needed.`,
        priority: 'High',
      };
    }

    if (sEntity === 'demand' || sField.includes('demand') || sField.includes('policylimit')) {
      return {
        recordType: 'Settlement Demand Package',
        navigationUrl: '/personal-injury/demand',
        suggestedTitle: sField.includes('amount')
          ? 'Follow-up: Missing Settlement Demand Amount'
          : sField.includes('carrier')
          ? 'Follow-up: Missing Recipient Insurance Carrier'
          : 'Follow-up: Incomplete Settlement Demand Specification',
        suggestedDescription: `Missing ${sourceEntity}.${sourceField} is required for settlement demand package generation. Please complete the demand package details.`,
        priority: 'Critical',
      };
    }

    if (sEntity === 'damages' || sEntity === 'injuries' || sField.includes('injury') || sField.includes('futuremedical')) {
      return {
        recordType: 'PI Damages & Injury Ledger',
        navigationUrl: '/personal-injury/damages',
        suggestedTitle: 'Follow-up: Incomplete Injury & Damages Documentation',
        suggestedDescription: `Missing ${sourceEntity}.${sourceField} is needed to substantiate bodily injury damages in settlement demand.`,
        priority: 'High',
      };
    }

    if (sEntity === 'wageloss' || sField.includes('wage') || sField.includes('lostwages') || sField.includes('payrate')) {
      return {
        recordType: 'Wage Loss & Economic Damages',
        navigationUrl: '/personal-injury/damages',
        suggestedTitle: 'Follow-up: Missing Wage Loss & Lost Earnings Documentation',
        suggestedDescription: `Missing ${sourceEntity}.${sourceField} is needed to substantiate lost earning capacity. Please update employer verification.`,
        priority: 'Medium',
      };
    }

    if (sEntity === 'medicalbilling' || sEntity === 'billing' || sField.includes('billed') || sField.includes('balanceowed')) {
      return {
        recordType: 'Medical Billing Summary',
        navigationUrl: '/personal-injury/medical',
        suggestedTitle: 'Follow-up: Incomplete Medical Billing Summary',
        suggestedDescription: `Missing ${sourceEntity}.${sourceField} is required to calculate total special damages. Please update billing balances.`,
        priority: 'High',
      };
    }

    if (sEntity === 'litigation') {
      return { recordType: 'Civil Litigation Case', navigationUrl: '/litigation/dashboard', suggestedTitle: `Follow-up: Missing Litigation ${sourceField}`, suggestedDescription: `Litigation ${sourceField} is required for pleading/discovery drafting.`, priority: 'High' };
    }
    if (sEntity === 'bankruptcy') {
      return { recordType: 'Bankruptcy Case', navigationUrl: '/bankruptcy/cases', suggestedTitle: `Follow-up: Missing Bankruptcy ${sourceField}`, suggestedDescription: `Bankruptcy ${sourceField} is required for petition/schedule drafting.`, priority: 'High' };
    }
    if (sEntity === 'immigration') {
      return { recordType: 'Immigration Case', navigationUrl: '/immigration/cases', suggestedTitle: `Follow-up: Missing Immigration ${sourceField}`, suggestedDescription: `Immigration ${sourceField} is required for USCIS/EOIR filing.`, priority: 'High' };
    }
    if (sEntity === 'probate') {
      return { recordType: 'Probate Case', navigationUrl: '/probate', suggestedTitle: `Follow-up: Missing Probate ${sourceField}`, suggestedDescription: `Probate ${sourceField} is required for estate filings.`, priority: 'Medium' };
    }
    if (sEntity === 'familylaw') {
      return { recordType: 'Family Law Case', navigationUrl: '/family-law', suggestedTitle: `Follow-up: Missing Family Law ${sourceField}`, suggestedDescription: `Family law ${sourceField} is required for domestic relations filings.`, priority: 'Medium' };
    }
    if (sEntity === 'criminal') {
      return { recordType: 'Criminal Defense Case', navigationUrl: '/criminal', suggestedTitle: `Follow-up: Missing Criminal ${sourceField}`, suggestedDescription: `Criminal case ${sourceField} is required for defense filings.`, priority: 'High' };
    }
    if (sEntity === 'appeals') {
      return { recordType: 'Appellate Case', navigationUrl: '/appeals', suggestedTitle: `Follow-up: Missing Appeals ${sourceField}`, suggestedDescription: `Appellate ${sourceField} is required for appellate filings.`, priority: 'High' };
    }
    if (sEntity === 'evictions') {
      return { recordType: 'Evictions Case', navigationUrl: '/evictions', suggestedTitle: `Follow-up: Missing Evictions ${sourceField}`, suggestedDescription: `Unlawful detainer ${sourceField} is required for notice/pleading drafting.`, priority: 'High' };
    }

    if (sEntity === 'client') {
      return {
        recordType: 'Client Profile',
        navigationUrl: '/clients',
        suggestedTitle: `Follow-up: Missing Client ${sourceField}`,
        suggestedDescription: `Client ${sourceField} is required before legal instruments can be executed or served. Please update the client profile.`,
        priority: 'High',
      };
    }

    if (sEntity === 'matter') {
      return {
        recordType: 'Matter Case Docket',
        navigationUrl: '/matters',
        suggestedTitle: `Follow-up: Incomplete Matter ${sourceField}`,
        suggestedDescription: `Matter ${sourceField} is required to complete document validation. Please update the case docket record.`,
        priority: 'Medium',
      };
    }

    return {
      recordType: 'Legal Matter Records',
      navigationUrl: '/matters',
      suggestedTitle: `Follow-up: Missing ${sourceEntity}.${sourceField}`,
      suggestedDescription: `Field '${sourceEntity}.${sourceField}' is required for document drafting. Please review and update the matter records.`,
      priority: 'Medium',
    };
  }

  private static lookupFieldCaseInsensitive(obj: Record<string, any> | undefined, field: string): any {
    if (!obj || !field) return undefined;
    if (obj[field] !== undefined) return obj[field];
    const target = field.toLowerCase();
    const key = Object.keys(obj).find((k) => k.toLowerCase() === target);
    return key ? obj[key] : undefined;
  }

  static resolve(
    matter: any,
    templateVersion: any,
    customOverrides?: Record<string, any>
  ): {
    isValid: boolean;
    canGenerate: boolean;
    resolvedData: Record<string, any>;
    missingFields: MissingFieldFlag[];
    optionalMissingFields: MissingFieldFlag[];
    totalFieldsCount: number;
    missingFieldsCount: number;
    missingRequiredCount: number;
    missingOptionalCount: number;
  } {
    const missingFields: MissingFieldFlag[] = [];
    const optionalMissingFields: MissingFieldFlag[] = [];
    const resolvedData: Record<string, any> = {};

    const client = matter.client || {};
    const attorney = matter.responsibleAttorney || {};
    const pa = matter.practiceArea || {};
    const intake = matter.originatingIntakes?.[0] || {};
    const incidentRecord = matter.incidents?.[0] || {};
    const policyRecord = matter.insurancePolicies?.[0] || {};
    const providerRecord = matter.medicalProviders?.[0] || {};
    const demandPackage = matter.demandPackages?.[0] || {};
    const damagesRecord = matter.damagesRecords?.[0] || {};
    const wageLossRecord = matter.wageLossRecords?.[0] || {};
    const billingSummary = matter.medicalBillingSummaries?.[0] || {};

    const litCase = matter.litigationCase || {};
    const bkCase = matter.bankruptcyCase || {};
    const immCase = matter.immigrationCase || {};
    const probCase = matter.probateCase || {};
    const famCase = matter.familyLawCase || {};
    const crimCase = matter.criminalCase || {};
    const appCase = matter.appealsCase || {};
    const evictCase = matter.evictionsCase || {};

    const totalMedicalBilled = (matter.medicalBillingSummaries || []).reduce(
      (sum: number, b: any) => sum + Number(b.totalBilled || 0),
      0
    );
    const totalMedicalBalance = (matter.medicalBillingSummaries || []).reduce(
      (sum: number, b: any) => sum + Number(b.cachedBalanceOwed || 0),
      0
    );
    const totalLostWages = (matter.wageLossRecords || []).reduce(
      (sum: number, w: any) => sum + Number(w.totalLostWages || 0),
      0
    );
    const totalFutureMedical = (matter.damagesRecords || []).reduce(
      (sum: number, d: any) => sum + Number(d.futureMedicalEstimatedCost || 0),
      0
    );
    const calculatedSpecials =
      (totalMedicalBilled > 0 ? totalMedicalBilled : Number(billingSummary.totalBilled || 0)) +
      (totalLostWages > 0 ? totalLostWages : Number(wageLossRecord.totalLostWages || 0)) +
      (totalFutureMedical > 0 ? totalFutureMedical : Number(damagesRecord.futureMedicalEstimatedCost || 0));

    const now = new Date();

    const rawEntityLookup: Record<string, Record<string, any>> = {
      Client: {
        id: client.id,
        clientNumber: client.clientNumber,
        name: client.name,
        clientType: client.clientType,
        primaryContact: client.primaryContact,
        email: client.email,
        phone: client.phone,
        address: client.address,
        status: client.status,
      },
      Matter: {
        id: matter.id,
        matterNumber: matter.matterNumber,
        title: matter.title,
        status: matter.status,
        courtName: matter.courtName || litCase.courtName || crimCase.courtJurisdiction,
        judge: matter.judge || litCase.presidingJudge || crimCase.presidingJudge,
        caseDocketNumber: matter.caseDocketNumber || litCase.caseDocketNumber || crimCase.caseDocketNumber || famCase.courtDocketNumber,
        docketNumber: matter.caseDocketNumber || litCase.caseDocketNumber || crimCase.caseDocketNumber || famCase.courtDocketNumber,
        description: matter.description,
        billingType: matter.billingType,
        hourlyRate: matter.hourlyRate,
        flatFeeAmount: matter.flatFeeAmount,
        contingencyPercentage: matter.contingencyPercentage,
        openDate: matter.openDate,
        closeDate: matter.closeDate,
        statuteOfLimitations: matter.statuteOfLimitations,
        nextCourtDate: matter.nextCourtDate,
      },
      ResponsibleAttorney: {
        id: attorney.id,
        userCode: attorney.userCode,
        name: attorney.name || matter.responsibleAttorneyName || (matter.responsibleAttorney ? matter.responsibleAttorney.name : null),
        email: attorney.email,
        phone: attorney.phone,
        title: attorney.title,
        initials: attorney.initials,
        department: attorney.department,
        billingRate: attorney.billingRate,
      },
      Attorney: {
        id: attorney.id,
        userCode: attorney.userCode,
        name: attorney.name || matter.responsibleAttorneyName || (matter.responsibleAttorney ? matter.responsibleAttorney.name : null),
        email: attorney.email,
        phone: attorney.phone,
        title: attorney.title,
        initials: attorney.initials,
        department: attorney.department,
        billingRate: attorney.billingRate,
      },
      User: {
        id: attorney.id,
        name: attorney.name || matter.responsibleAttorneyName || (matter.responsibleAttorney ? matter.responsibleAttorney.name : null),
        email: attorney.email,
        phone: attorney.phone,
        title: attorney.title,
      },
      PracticeArea: {
        id: pa.id,
        code: pa.code,
        name: pa.name,
      },
      Court: {
        name: matter.courtName || litCase.courtName || bkCase.courtDistrict || appCase.appellateCourt,
        judge: matter.judge || litCase.presidingJudge || bkCase.assignedJudge || crimCase.presidingJudge,
        caseDocketNumber: matter.caseDocketNumber || litCase.caseDocketNumber || bkCase.caseNumber || appCase.appellateDocketNumber,
      },
      Intake: {
        intakeNumber: intake.intakeNumber,
        adverseParties: intake.adverseParties,
        matterSummary: intake.matterSummary,
        disputeAmount: intake.disputeAmount,
        jurisdictionVenue: intake.jurisdictionVenue,
      },
      Incident: {
        accidentDate: customOverrides?.accident_date || customOverrides?.incident_date || incidentRecord.incidentDate || customOverrides?.['Incident.accidentDate'] || null,
        accidentType: customOverrides?.accident_type || incidentRecord.accidentType || customOverrides?.['Incident.accidentType'] || null,
        incidentLocation: customOverrides?.incident_location || incidentRecord.incidentLocation || customOverrides?.['Incident.incidentLocation'] || null,
        policeAgency: customOverrides?.police_agency || incidentRecord.policeAgency || customOverrides?.['Incident.policeAgency'] || null,
        reportNumber: customOverrides?.report_number || incidentRecord.reportNumber || customOverrides?.['Incident.reportNumber'] || null,
        investigatingOfficer: customOverrides?.investigating_officer || incidentRecord.investigatingOfficer || null,
        description: customOverrides?.accident_description || customOverrides?.description || incidentRecord.description || null,
        mechanismOfInjury: customOverrides?.mechanism_of_injury || null,
      },
      Insurance: {
        insuranceCompany: customOverrides?.insurance_company || policyRecord.insuranceCompany || customOverrides?.['Insurance.insuranceCompany'] || null,
        carrierName: customOverrides?.insurance_company || policyRecord.insuranceCompany || customOverrides?.['Insurance.carrierName'] || null,
        claimNumber: customOverrides?.claim_number || policyRecord.claimNumber || customOverrides?.['Insurance.claimNumber'] || null,
        policyNumber: customOverrides?.policy_number || policyRecord.policyNumber || customOverrides?.['Insurance.policyNumber'] || null,
        adjusterName: customOverrides?.adjuster_name || policyRecord.adjusterName || customOverrides?.['Insurance.adjusterName'] || null,
        adjusterPhone: customOverrides?.adjuster_phone || policyRecord.adjusterPhone || customOverrides?.['Insurance.adjusterPhone'] || null,
        adjusterEmail: customOverrides?.adjuster_email || policyRecord.adjusterEmail || customOverrides?.['Insurance.adjusterEmail'] || null,
      },
      MedicalProvider: {
        name: customOverrides?.provider_name || customOverrides?.name || providerRecord.providerName || customOverrides?.['MedicalProvider.name'] || customOverrides?.['MedicalProvider.Name'] || null,
        providerName: customOverrides?.provider_name || customOverrides?.name || providerRecord.providerName || customOverrides?.['MedicalProvider.providerName'] || null,
        address: customOverrides?.facility_address || customOverrides?.provider_address || customOverrides?.address || providerRecord.facilityAddress || customOverrides?.['MedicalProvider.address'] || customOverrides?.['MedicalProvider.Address'] || null,
        facilityAddress: customOverrides?.facility_address || customOverrides?.provider_address || customOverrides?.address || providerRecord.facilityAddress || customOverrides?.['MedicalProvider.facilityAddress'] || null,
        providerType: customOverrides?.provider_type || providerRecord.providerType || customOverrides?.['MedicalProvider.providerType'] || null,
        phone: customOverrides?.provider_phone || customOverrides?.phone || providerRecord.phone || null,
        fax: customOverrides?.provider_fax || customOverrides?.fax || providerRecord.fax || null,
        treatmentDates: customOverrides?.treatment_dates || customOverrides?.dates_of_service || null,
      },
      MedicalRecords: {
        recordsStatus: customOverrides?.records_status || customOverrides?.['MedicalRecords.recordsStatus'] || null,
        requestDate: customOverrides?.request_date || customOverrides?.initial_request_date || null,
        daysOverdue: customOverrides?.days_overdue || null,
        missingRecordsSummary: customOverrides?.missing_records_summary || null,
      },
      Demand: {
        demandTitle: customOverrides?.demand_title || demandPackage.demandTitle || customOverrides?.['Demand.demandTitle'] || 'Personal Injury Settlement Demand',
        demandedAmount: customOverrides?.demand_amount !== undefined ? customOverrides.demand_amount : (demandPackage.demandedAmount !== undefined ? demandPackage.demandedAmount : customOverrides?.['Demand.demandedAmount'] || null),
        policyLimitAmount: customOverrides?.policy_limit !== undefined ? customOverrides.policy_limit : (demandPackage.policyLimitAmount !== undefined ? demandPackage.policyLimitAmount : policyRecord.policyLimits || customOverrides?.['Demand.policyLimitAmount'] || null),
        isPolicyLimitDemand: customOverrides?.is_policy_limit_demand !== undefined ? customOverrides.is_policy_limit_demand : (demandPackage.isPolicyLimitDemand !== undefined ? demandPackage.isPolicyLimitDemand : false),
        recipientCarrier: customOverrides?.recipient_carrier || demandPackage.recipientCarrier || policyRecord.insuranceCompany || customOverrides?.['Demand.recipientCarrier'] || null,
        claimNumber: customOverrides?.claim_number || demandPackage.claimNumber || policyRecord.claimNumber || customOverrides?.['Demand.claimNumber'] || null,
        deadlineDate: customOverrides?.deadline_date || demandPackage.deadlineDate || customOverrides?.['Demand.deadlineDate'] || null,
        status: demandPackage.status || customOverrides?.demand_status || 'DRAFTING',
        notes: customOverrides?.demand_notes || demandPackage.notes || null,
      },
      Damages: {
        injuryCategory: customOverrides?.injury_category || damagesRecord.injuryCategory || customOverrides?.['Damages.injuryCategory'] || null,
        anatomicalLocation: customOverrides?.anatomical_location || damagesRecord.anatomicalLocation || customOverrides?.['Damages.anatomicalLocation'] || null,
        severityGrade: customOverrides?.severity_grade || damagesRecord.severityGrade || customOverrides?.['Damages.severityGrade'] || null,
        icdCode: customOverrides?.icd_code || damagesRecord.icdCode || customOverrides?.['Damages.icdCode'] || null,
        treatmentSummary: customOverrides?.treatment_summary || damagesRecord.treatmentSummary || customOverrides?.['Damages.treatmentSummary'] || null,
        futureTreatmentProjected: customOverrides?.future_treatment_projected !== undefined ? customOverrides.future_treatment_projected : (damagesRecord.futureTreatmentProjected !== undefined ? damagesRecord.futureTreatmentProjected : false),
        futureMedicalEstimatedCost: customOverrides?.future_medical_estimated_cost !== undefined ? customOverrides.future_medical_estimated_cost : (damagesRecord.futureMedicalEstimatedCost !== undefined ? damagesRecord.futureMedicalEstimatedCost : (totalFutureMedical > 0 ? totalFutureMedical : null)),
        totalFutureMedical: totalFutureMedical > 0 ? totalFutureMedical : (damagesRecord.futureMedicalEstimatedCost || null),
      },
      WageLoss: {
        employerName: customOverrides?.employer_name || wageLossRecord.employerName || customOverrides?.['WageLoss.employerName'] || null,
        jobTitle: customOverrides?.job_title || wageLossRecord.jobTitle || customOverrides?.['WageLoss.jobTitle'] || null,
        payRateType: customOverrides?.pay_rate_type || wageLossRecord.payRateType || null,
        basePayRate: customOverrides?.base_pay_rate !== undefined ? customOverrides.base_pay_rate : (wageLossRecord.basePayRate !== undefined ? wageLossRecord.basePayRate : null),
        hoursLost: customOverrides?.hours_lost !== undefined ? customOverrides.hours_lost : (wageLossRecord.hoursLost !== undefined ? wageLossRecord.hoursLost : null),
        daysLost: customOverrides?.days_lost !== undefined ? customOverrides.days_lost : (wageLossRecord.daysLost !== undefined ? wageLossRecord.daysLost : null),
        totalLostWages: customOverrides?.total_lost_wages !== undefined ? customOverrides.total_lost_wages : (totalLostWages > 0 ? totalLostWages : (wageLossRecord.totalLostWages !== undefined ? wageLossRecord.totalLostWages : null)),
        isVerifiedByEmployer: customOverrides?.is_verified_by_employer !== undefined ? customOverrides.is_verified_by_employer : (wageLossRecord.isVerifiedByEmployer !== undefined ? wageLossRecord.isVerifiedByEmployer : false),
      },
      MedicalBilling: {
        totalBilled: customOverrides?.total_medical_bills !== undefined ? customOverrides.total_medical_bills : (totalMedicalBilled > 0 ? totalMedicalBilled : (billingSummary.totalBilled !== undefined ? billingSummary.totalBilled : null)),
        cachedBalanceOwed: customOverrides?.balance_owed !== undefined ? customOverrides.balance_owed : (totalMedicalBalance > 0 ? totalMedicalBalance : (billingSummary.cachedBalanceOwed !== undefined ? billingSummary.cachedBalanceOwed : null)),
        treatmentStatus: customOverrides?.treatment_status || billingSummary.treatmentStatus || null,
        accountNumber: billingSummary.accountNumber || null,
      },
      Specials: {
        totalMedicalBilled: totalMedicalBilled > 0 ? totalMedicalBilled : (billingSummary.totalBilled || null),
        totalLostWages: totalLostWages > 0 ? totalLostWages : (wageLossRecord.totalLostWages || null),
        totalFutureMedical: totalFutureMedical > 0 ? totalFutureMedical : (damagesRecord.futureMedicalEstimatedCost || null),
        totalSpecialDamages: customOverrides?.total_special_damages !== undefined ? customOverrides.total_special_damages : (calculatedSpecials > 0 ? calculatedSpecials : null),
        totalGeneralDamages: customOverrides?.total_general_damages !== undefined ? customOverrides.total_general_damages : null,
      },
      Litigation: {
        courtJurisdiction: litCase.courtJurisdiction || null,
        courtName: litCase.courtName || matter.courtName || null,
        caseDocketNumber: litCase.caseDocketNumber || matter.caseDocketNumber || null,
        presidingJudge: litCase.presidingJudge || matter.judge || null,
        litigationStage: litCase.litigationStage || null,
        filingDate: litCase.filingDate || null,
        trialDate: litCase.trialDate || null,
        discoveryCutoffDate: litCase.discoveryCutoffDate || null,
      },
      Bankruptcy: {
        chapter: bkCase.chapter || null,
        caseNumber: bkCase.caseNumber || matter.caseDocketNumber || null,
        courtDistrict: bkCase.courtDistrict || 'District of Utah',
        courtDivision: bkCase.courtDivision || 'Salt Lake City',
        assignedJudge: bkCase.assignedJudge || matter.judge || null,
        trusteeName: bkCase.trusteeName || null,
        debtorType: bkCase.debtorType || null,
        meeting341Date: bkCase.meeting341Date || null,
        monthlyGrossIncome: bkCase.monthlyGrossIncome || null,
        totalSecuredDebt: bkCase.totalSecuredDebt || null,
        totalUnsecuredDebt: bkCase.totalUnsecuredDebt || null,
      },
      Immigration: {
        visaCategory: immCase.visaCategory || null,
        alienRegistrationNum: immCase.alienRegistrationNum || null,
        usCISOnlineAccountNum: immCase.usCISOnlineAccountNum || null,
        beneficiaryName: immCase.beneficiaryName || client.name || null,
        countryOfCitizenship: immCase.countryOfCitizenship || null,
        currentImmigrationStatus: immCase.currentImmigrationStatus || null,
        i94Number: immCase.i94Number || null,
        priorityDate: immCase.priorityDate || null,
      },
      Probate: {
        decedentName: probCase.decedentName || null,
        dateOfDeath: probCase.dateOfDeath || null,
        countyJurisdiction: probCase.countyJurisdiction || null,
        courtCaseNumber: probCase.courtCaseNumber || matter.caseDocketNumber || null,
        probateType: probCase.probateType || null,
        personalRepName: probCase.personalRepName || null,
        inventoryValue: probCase.inventoryValue || null,
      },
      FamilyLaw: {
        caseType: famCase.caseType || null,
        courtDocketNumber: famCase.courtDocketNumber || matter.caseDocketNumber || null,
        marriageDate: famCase.marriageDate || null,
        separationDate: famCase.separationDate || null,
        custodyArrangement: famCase.custodyArrangement || null,
        monthlyChildSupport: famCase.monthlyChildSupport || null,
        monthlyAlimony: famCase.monthlyAlimony || null,
      },
      Criminal: {
        defendantName: crimCase.defendantName || client.name || null,
        courtJurisdiction: crimCase.courtJurisdiction || matter.courtName || null,
        caseDocketNumber: crimCase.caseDocketNumber || matter.caseDocketNumber || null,
        presidingJudge: crimCase.presidingJudge || matter.judge || null,
        prosecutingAgency: crimCase.prosecutingAgency || null,
        bailAmount: crimCase.bailAmount || null,
        custodyStatus: crimCase.custodyStatus || null,
        arraignmentDate: crimCase.arraignmentDate || null,
      },
      Appeals: {
        appellateCourt: appCase.appellateCourt || null,
        appellateDocketNumber: appCase.appellateDocketNumber || matter.caseDocketNumber || null,
        lowerCourtName: appCase.lowerCourtName || null,
        lowerCourtDocketNumber: appCase.lowerCourtDocketNumber || null,
        noticeOfAppealDate: appCase.noticeOfAppealDate || null,
        openingBriefDeadline: appCase.openingBriefDeadline || null,
      },
      Evictions: {
        propertyAddress: evictCase.propertyAddress || null,
        unitNumber: evictCase.unitNumber || null,
        tenantName: evictCase.tenantName || null,
        landlordName: evictCase.landlordName || client.name || null,
        monthlyRent: evictCase.monthlyRent || null,
        outstandingBalance: evictCase.outstandingBalance || null,
        noticeType: evictCase.noticeType || null,
        noticeServedDate: evictCase.noticeServedDate || null,
      },
      Firm: {
        name: 'Heugly & Bludworth, Attorneys at Law',
        address: '136 E South Temple, Suite 1400, Salt Lake City, UT 84111',
        phone: '(801) 532-7300',
        fax: '(801) 532-7301',
        email: 'info@utahslawyers.com',
        website: 'https://www.utahslawyers.com',
      },
      CurrentDate: {
        long: this.formatDate(now, 'DATE_LONG'),
        short: this.formatDate(now, 'DATE_SHORT'),
        court: this.formatDate(now, 'DATE_COURT'),
        year: now.getFullYear(),
      },
      CustomField: {
        ...(customOverrides || {}),
      },
    };

    // Pre-populate nested objects & repeating collections for docxtemplater loops
    resolvedData['client'] = { ...rawEntityLookup.Client };
    resolvedData['Client'] = { ...rawEntityLookup.Client, Name: rawEntityLookup.Client.name };
    resolvedData['matter'] = { ...rawEntityLookup.Matter };
    resolvedData['Matter'] = { ...rawEntityLookup.Matter, Title: rawEntityLookup.Matter.title, MatterNumber: rawEntityLookup.Matter.matterNumber };
    resolvedData['attorney'] = { ...rawEntityLookup.ResponsibleAttorney };
    resolvedData['Attorney'] = { ...rawEntityLookup.ResponsibleAttorney, Name: rawEntityLookup.ResponsibleAttorney.name };
    resolvedData['court'] = { ...rawEntityLookup.Court };
    resolvedData['Court'] = { ...rawEntityLookup.Court, Name: rawEntityLookup.Court.name };
    resolvedData['incident'] = { ...rawEntityLookup.Incident };
    resolvedData['insurance'] = { ...rawEntityLookup.Insurance };
    resolvedData['medicalProvider'] = { ...rawEntityLookup.MedicalProvider };
    resolvedData['medicalRecords'] = { ...rawEntityLookup.MedicalRecords };
    resolvedData['demand'] = { ...rawEntityLookup.Demand };
    resolvedData['damages'] = { ...rawEntityLookup.Damages };
    resolvedData['wageLoss'] = { ...rawEntityLookup.WageLoss };
    resolvedData['medicalBilling'] = { ...rawEntityLookup.MedicalBilling };
    resolvedData['specials'] = { ...rawEntityLookup.Specials };
    resolvedData['litigation'] = { ...rawEntityLookup.Litigation };
    resolvedData['bankruptcy'] = { ...rawEntityLookup.Bankruptcy };
    resolvedData['immigration'] = { ...rawEntityLookup.Immigration };
    resolvedData['probate'] = { ...rawEntityLookup.Probate };
    resolvedData['familyLaw'] = { ...rawEntityLookup.FamilyLaw };
    resolvedData['criminal'] = { ...rawEntityLookup.Criminal };
    resolvedData['appeals'] = { ...rawEntityLookup.Appeals };
    resolvedData['evictions'] = { ...rawEntityLookup.Evictions };
    resolvedData['firm'] = { ...rawEntityLookup.Firm };
    resolvedData['Firm'] = { ...rawEntityLookup.Firm };
    resolvedData['today'] = rawEntityLookup.CurrentDate.long;
    resolvedData['currentYear'] = rawEntityLookup.CurrentDate.year;

    // Repeating sections arrays for {{#providers}}...{{/providers}}, {{#creditors}}, etc.
    resolvedData['providers'] = matter.medicalProviders || [];
    resolvedData['policies'] = matter.insurancePolicies || [];
    resolvedData['liens'] = matter.liens || [];
    resolvedData['creditors'] = bkCase.creditors || [];
    resolvedData['beneficiaries'] = probCase.beneficiaries || [];
    resolvedData['charges'] = crimCase.charges || [];
    resolvedData['hearings'] = litCase.hearings || [];
    resolvedData['discoveryRequests'] = litCase.discoveryRequests || [];
    resolvedData['parties'] = immCase.parties || [];

    // Conditionals flags
    resolvedData['isContingency'] = matter.billingType === 'Contingency';
    resolvedData['isHourly'] = matter.billingType === 'Hourly';
    resolvedData['isFlatFee'] = matter.billingType === 'Flat Fee';
    resolvedData['hasCourt'] = Boolean(matter.courtName || litCase.courtName);
    resolvedData['hasJudge'] = Boolean(matter.judge || litCase.presidingJudge);
    resolvedData['hasDocketNumber'] = Boolean(matter.caseDocketNumber || litCase.caseDocketNumber);
    resolvedData['hasProviders'] = (matter.medicalProviders || []).length > 0;
    resolvedData['hasLiens'] = (matter.liens || []).length > 0;
    resolvedData['hasCreditors'] = (bkCase.creditors || []).length > 0;
    resolvedData['hasParties'] = (immCase.parties || []).length > 0;
    resolvedData['hasHearings'] = (litCase.hearings || []).length > 0;
    resolvedData['hasBeneficiaries'] = (probCase.beneficiaries || []).length > 0;
    resolvedData['hasCharges'] = (crimCase.charges || []).length > 0;
    resolvedData['hasDiscoveryRequests'] = (litCase.discoveryRequests || []).length > 0;

    // Process Configured Field Mappings for this Template Version
    const mappings = templateVersion.fieldMappings || [];

    for (const mapping of mappings) {
      const cleanTag = mapping.placeholderTag.replace(/^\{\{|\}\}$/g, '').trim();
      const sEntity = (mapping.sourceEntity || '').toLowerCase();
      let entity = rawEntityLookup[mapping.sourceEntity];
      if (!entity) {
        if (sEntity === 'attorney' || sEntity === 'responsibleattorney') {
          entity = rawEntityLookup.Attorney || rawEntityLookup.ResponsibleAttorney;
        } else {
          const matchKey = Object.keys(rawEntityLookup).find((k) => k.toLowerCase() === sEntity);
          entity = matchKey ? rawEntityLookup[matchKey] : {};
        }
      }
      let val = this.lookupFieldCaseInsensitive(entity, mapping.sourceField);

      if (
        (val === null || val === undefined || val === '') &&
        (cleanTag.toLowerCase() === 'attorney.name' || (sEntity.includes('attorney') && mapping.sourceField.toLowerCase() === 'name'))
      ) {
        val =
          rawEntityLookup.Attorney?.name ||
          rawEntityLookup.ResponsibleAttorney?.name ||
          attorney?.name ||
          matter?.responsibleAttorneyName ||
          matter?.responsibleAttorney?.name;
      }

      if (
        (val === null || val === undefined || val === '') &&
        (cleanTag.toLowerCase() === 'medicalprovider.name' ||
          (sEntity.includes('provider') && (mapping.sourceField.toLowerCase() === 'name' || mapping.sourceField.toLowerCase() === 'providername')))
      ) {
        val = rawEntityLookup.MedicalProvider?.name || rawEntityLookup.MedicalProvider?.providerName || providerRecord?.providerName;
      }
      if (
        (val === null || val === undefined || val === '') &&
        (cleanTag.toLowerCase() === 'medicalprovider.address' ||
          (sEntity.includes('provider') && (mapping.sourceField.toLowerCase() === 'address' || mapping.sourceField.toLowerCase() === 'facilityaddress')))
      ) {
        val = rawEntityLookup.MedicalProvider?.address || rawEntityLookup.MedicalProvider?.facilityAddress || providerRecord?.facilityAddress;
      }

      if (customOverrides && customOverrides[cleanTag] !== undefined) {
        val = customOverrides[cleanTag];
      } else if (customOverrides && customOverrides[mapping.sourceField] !== undefined) {
        val = customOverrides[mapping.sourceField];
      }

      if ((val === null || val === undefined || val === '') && mapping.defaultValue) {
        val = mapping.defaultValue;
      }

      if (val === null || val === undefined || val === '') {
        const details = this.getSourceRecordDetails(mapping.sourceEntity, mapping.sourceField);
        const flag: MissingFieldFlag = {
          placeholderTag: mapping.placeholderTag,
          sourceEntity: mapping.sourceEntity,
          sourceField: mapping.sourceField,
          reason: 'MISSING_DATA',
          isRequired: Boolean(mapping.isRequired),
          description: mapping.isRequired
            ? `Required field '${mapping.sourceEntity}.${mapping.sourceField}' is missing or empty in matter records.`
            : `Optional field '${mapping.sourceEntity}.${mapping.sourceField}' is not populated.`,
          sourceRecordType: details.recordType,
          sourceRecordNavigationUrl: details.navigationUrl,
          suggestedTaskTitle: details.suggestedTitle,
          suggestedTaskDescription: details.suggestedDescription,
          suggestedPriority: details.priority,
        };

        if (mapping.isRequired) {
          missingFields.push(flag);
        } else {
          optionalMissingFields.push(flag);
        }
      }

      const formatted = this.formatValue(val, mapping.formattingRule);

      resolvedData[cleanTag] = formatted ?? '';
      resolvedData[mapping.placeholderTag] = formatted ?? '';
      resolvedData[`{{${cleanTag}}}`] = formatted ?? '';
      resolvedData[cleanTag.toLowerCase()] = formatted ?? '';

      const parts = cleanTag.split('.');
      if (parts.length === 2) {
        if (!resolvedData[parts[0]]) resolvedData[parts[0]] = {};
        resolvedData[parts[0]][parts[1]] = formatted ?? '';
        const lowerFirst = parts[0].charAt(0).toLowerCase() + parts[0].slice(1);
        if (!resolvedData[lowerFirst]) resolvedData[lowerFirst] = {};
        resolvedData[lowerFirst][parts[1]] = formatted ?? '';
      }
    }

    // Apply any explicit customOverrides directly so ad-hoc tags resolve cleanly
    if (customOverrides) {
      for (const [k, v] of Object.entries(customOverrides)) {
        if (resolvedData[k] === undefined || resolvedData[k] === '') {
          resolvedData[k] = v;
        }
      }
    }

    const isValid = missingFields.length === 0;

    return {
      isValid,
      canGenerate: isValid,
      resolvedData,
      missingFields,
      optionalMissingFields,
      totalFieldsCount: mappings.length,
      missingFieldsCount: missingFields.length + optionalMissingFields.length,
      missingRequiredCount: missingFields.length,
      missingOptionalCount: optionalMissingFields.length,
    };
  }
}

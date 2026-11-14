import { MissingFieldFlag } from './draft.types.js';

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
      'July', 'August', 'September', 'October', 'November', 'December'
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

  /**
   * Helper mapping missing fields to their respective source records, navigation URLs, and task suggestions.
   */
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
    const sField = sourceField.toLowerCase();
    const sEntity = sourceEntity.toLowerCase();

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

    // Calculate aggregate totals from related collections
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

    // 1. Establish Standard Enterprise Field Dictionary
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
        courtName: matter.courtName,
        judge: matter.judge,
        caseDocketNumber: matter.caseDocketNumber,
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
        name: attorney.name,
        email: attorney.email,
        phone: attorney.phone,
        title: attorney.title,
        initials: attorney.initials,
        department: attorney.department,
        billingRate: attorney.billingRate,
      },
      User: {
        id: attorney.id,
        name: attorney.name,
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
        name: matter.courtName,
        judge: matter.judge,
        caseDocketNumber: matter.caseDocketNumber,
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
        claimNumber: customOverrides?.claim_number || policyRecord.claimNumber || customOverrides?.['Insurance.claimNumber'] || null,
        policyNumber: customOverrides?.policy_number || policyRecord.policyNumber || customOverrides?.['Insurance.policyNumber'] || null,
        adjusterName: customOverrides?.adjuster_name || policyRecord.adjusterName || customOverrides?.['Insurance.adjusterName'] || null,
        adjusterPhone: customOverrides?.adjuster_phone || policyRecord.adjusterPhone || customOverrides?.['Insurance.adjusterPhone'] || null,
        adjusterEmail: customOverrides?.adjuster_email || policyRecord.adjusterEmail || customOverrides?.['Insurance.adjusterEmail'] || null,
      },
      MedicalProvider: {
        providerName: customOverrides?.provider_name || providerRecord.providerName || customOverrides?.['MedicalProvider.providerName'] || null,
        providerType: customOverrides?.provider_type || providerRecord.providerType || customOverrides?.['MedicalProvider.providerType'] || null,
        facilityAddress: customOverrides?.facility_address || customOverrides?.provider_address || providerRecord.facilityAddress || null,
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
    };

    // 2. Pre-populate common token variants so docxtemplater resolves regardless of case or syntax
    resolvedData['client'] = { ...rawEntityLookup.Client };
    resolvedData['matter'] = { ...rawEntityLookup.Matter };
    resolvedData['attorney'] = { ...rawEntityLookup.ResponsibleAttorney };
    resolvedData['court'] = { ...rawEntityLookup.Court };
    resolvedData['incident'] = { ...rawEntityLookup.Incident };
    resolvedData['insurance'] = { ...rawEntityLookup.Insurance };
    resolvedData['medicalProvider'] = { ...rawEntityLookup.MedicalProvider };
    resolvedData['medicalRecords'] = { ...rawEntityLookup.MedicalRecords };
    resolvedData['firm'] = { ...rawEntityLookup.Firm };
    resolvedData['today'] = rawEntityLookup.CurrentDate.long;
    resolvedData['currentYear'] = rawEntityLookup.CurrentDate.year;

    // Conditionals flags
    resolvedData['isContingency'] = matter.billingType === 'Contingency';
    resolvedData['isHourly'] = matter.billingType === 'Hourly';
    resolvedData['isFlatFee'] = matter.billingType === 'Flat Fee';
    resolvedData['hasCourt'] = Boolean(matter.courtName);
    resolvedData['hasJudge'] = Boolean(matter.judge);
    resolvedData['hasDocketNumber'] = Boolean(matter.caseDocketNumber);

    // 3. Process Configured Field Mappings for this Template Version
    const mappings = templateVersion.fieldMappings || [];

    for (const mapping of mappings) {
      const cleanTag = mapping.placeholderTag.replace(/^\{\{|\}\}$/g, '').trim();
      const entity = rawEntityLookup[mapping.sourceEntity] || {};
      let val = entity[mapping.sourceField];

      // Check for user-provided custom overrides
      if (customOverrides && customOverrides[cleanTag] !== undefined) {
        val = customOverrides[cleanTag];
      } else if (customOverrides && customOverrides[mapping.sourceField] !== undefined) {
        val = customOverrides[mapping.sourceField];
      }

      // Fallback to default value if empty
      if ((val === null || val === undefined || val === '') && mapping.defaultValue) {
        val = mapping.defaultValue;
      }

      // Check required vs optional validation
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

      // Apply formatting rule
      const formatted = this.formatValue(val, mapping.formattingRule);

      // Populate resolved data under multiple keys to support any template syntax
      resolvedData[cleanTag] = formatted ?? '';
      resolvedData[mapping.placeholderTag] = formatted ?? '';
      resolvedData[`{{${cleanTag}}}`] = formatted ?? '';
      resolvedData[cleanTag.toLowerCase()] = formatted ?? '';

      // Also set path in nested object (e.g. Client.Name -> resolvedData.Client.Name)
      const parts = cleanTag.split('.');
      if (parts.length === 2) {
        if (!resolvedData[parts[0]]) resolvedData[parts[0]] = {};
        resolvedData[parts[0]][parts[1]] = formatted ?? '';
        const lowerFirst = parts[0].charAt(0).toLowerCase() + parts[0].slice(1);
        if (!resolvedData[lowerFirst]) resolvedData[lowerFirst] = {};
        resolvedData[lowerFirst][parts[1]] = formatted ?? '';
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

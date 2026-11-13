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

  static resolve(
    matter: any,
    templateVersion: any,
    customOverrides?: Record<string, any>
  ): {
    isValid: boolean;
    canGenerate: boolean;
    resolvedData: Record<string, any>;
    missingFields: MissingFieldFlag[];
    totalFieldsCount: number;
    missingFieldsCount: number;
  } {
    const missingFields: MissingFieldFlag[] = [];
    const resolvedData: Record<string, any> = {};

    const client = matter.client || {};
    const attorney = matter.responsibleAttorney || {};
    const pa = matter.practiceArea || {};
    const intake = matter.originatingIntakes?.[0] || {};

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
      }

      // Fallback to default value if empty
      if ((val === null || val === undefined || val === '') && mapping.defaultValue) {
        val = mapping.defaultValue;
      }

      // Check required validation
      if ((val === null || val === undefined || val === '') && mapping.isRequired) {
        missingFields.push({
          placeholderTag: mapping.placeholderTag,
          sourceEntity: mapping.sourceEntity,
          sourceField: mapping.sourceField,
          reason: 'MISSING_DATA',
          description: `Required field '${mapping.sourceEntity}.${mapping.sourceField}' is missing or empty in matter records.`,
        });
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
      totalFieldsCount: mappings.length,
      missingFieldsCount: missingFields.length,
    };
  }
}

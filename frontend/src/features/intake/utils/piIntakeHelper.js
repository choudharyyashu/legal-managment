/**
 * HEUGLY & BLUDWORTH Legal Practice Management
 * Personal Injury Intake Questionnaire Serialization & Parsing Helper
 */

export const EMPTY_PI_DATA = {
  accidentDate: '',
  accidentType: 'Motor Vehicle Collision',
  accidentLocation: '',
  incidentDescription: '',
  injuredClient: '',
  relevantParticipants: '',
  opposingParties: '',
  knownInjuries: '',
  treatingProviders: '',
  medicalFacilities: '',
  insuranceCompany: '',
  insuredName: '',
  claimNumber: '',
  policyNumber: '',
  adjusterName: '',
  adjusterPhone: '',
  adjusterEmail: '',
  knownEvidence: '',
  outstandingInformation: '',
  additionalNotes: '',
};

export function serializePIIntakeData(piData = {}, userSummary = '') {
  const cleanSummary = (userSummary || '').replace(/\[PI_INTAKE_DATA:[\s\S]*?\]/g, '').trim();

  // Create human-readable summary
  const summaryParts = [];
  if (cleanSummary) {
    summaryParts.push(cleanSummary);
  }

  const sections = [];
  if (piData.accidentDate || piData.accidentType || piData.accidentLocation) {
    sections.push(`Incident: ${piData.accidentType || 'Accident'} on ${piData.accidentDate || 'Unknown Date'} at ${piData.accidentLocation || 'Unknown Location'}.`);
  }
  if (piData.incidentDescription) {
    sections.push(`Details: ${piData.incidentDescription}`);
  }
  if (piData.opposingParties) {
    sections.push(`Opposing / Adverse Parties: ${piData.opposingParties}`);
  }
  if (piData.knownInjuries || piData.treatingProviders) {
    sections.push(`Injuries & Treatment: ${piData.knownInjuries || 'Injuries reported'}. Treating: ${piData.treatingProviders || 'Pending records'}`);
  }
  if (piData.insuranceCompany || piData.claimNumber) {
    sections.push(`Adverse Insurance: ${piData.insuranceCompany || 'Unknown Carrier'} (Claim #: ${piData.claimNumber || 'Pending'}, Adjuster: ${piData.adjusterName || 'Not Assigned'})`);
  }

  const humanReadable = summaryParts.concat(sections).join('\n\n');
  const metadataTag = `\n\n[PI_INTAKE_DATA: ${JSON.stringify(piData)}]`;

  return (humanReadable + metadataTag).trim();
}

export function parsePIIntakeData(matterSummary = '') {
  if (!matterSummary || typeof matterSummary !== 'string') {
    return { ...EMPTY_PI_DATA };
  }

  const match = matterSummary.match(/\[PI_INTAKE_DATA:\s*([\s\S]*?)\]/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      return { ...EMPTY_PI_DATA, ...parsed };
    } catch (e) {
      console.warn('Failed to parse embedded PI intake JSON:', e);
    }
  }

  return { ...EMPTY_PI_DATA };
}

export function getCleanMatterSummary(matterSummary = '') {
  if (!matterSummary || typeof matterSummary !== 'string') return '';
  return matterSummary.replace(/\[PI_INTAKE_DATA:[\s\S]*?\]/g, '').trim();
}

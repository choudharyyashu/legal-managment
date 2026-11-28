/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Communication Ingestion, Outlook / Telephony / SMS Adapter & Billing Tracking Engine
 */

export interface IngestCommunicationPayload {
  channel: 'PHONE_CALL' | 'SMS' | 'OUTLOOK_EMAIL' | 'VOIP' | 'IPHONE_SYNC';
  direction: 'INBOUND' | 'OUTBOUND';
  senderIdentifier: string; // Phone number or email
  senderName?: string;
  recipientIdentifier: string;
  recipientName?: string;
  subject?: string;
  content: string;
  timestamp?: Date | string;
  durationSeconds?: number;
  providerMessageId?: string;
  rawMetadata?: Record<string, any>;
  suggestedMatterId?: string;
  suggestedClientId?: string;
}

export interface ReviewCommunicationInput {
  status: 'APPROVED' | 'REJECTED' | 'FLAGGED';
  assignedMatterId?: string;
  assignedClientId?: string;
  isBillable?: boolean;
  billableDurationMinutes?: number;
  activityNotes?: string;
  billingRate?: number;
}

export class CommunicationIngestionEngine {
  /**
   * Sanitizes private message content to prevent sensitive leakage in logs/audit trails.
   */
  static sanitizePreview(content: string, maxLength: number = 200): string {
    if (!content) return '';
    const clean = content.replace(/[\r\n]+/g, ' ').trim();
    if (clean.length <= maxLength) return clean;
    return clean.slice(0, maxLength) + '...';
  }

  /**
   * Determines candidate matter matches based on sender/recipient phone or email.
   * Does NOT auto-attach if multiple conflicting matters match.
   */
  static evaluateMatterMatch(
    identifier: string,
    candidateMatters: Array<{ id: string; matterNumber: string; clientName?: string; clientPhone?: string; clientEmail?: string }>
  ): { status: 'EXACT_MATCH' | 'AMBIGUOUS' | 'UNMATCHED'; matchedMatterId?: string; reason: string } {
    if (!identifier || !candidateMatters || candidateMatters.length === 0) {
      return { status: 'UNMATCHED', reason: 'No matching clients or matters found for identifier.' };
    }

    const cleanId = identifier.trim().toLowerCase().replace(/[^a-z0-9@.-]/g, '');
    const matched = candidateMatters.filter((m) => {
      const email = m.clientEmail?.trim().toLowerCase();
      const phone = m.clientPhone?.trim().replace(/[^0-9]/g, '');
      const idCleanDigits = cleanId.replace(/[^0-9]/g, '');
      if (email && cleanId.includes('@') && email === cleanId) return true;
      if (phone && idCleanDigits.length >= 7 && phone.endsWith(idCleanDigits.slice(-7))) return true;
      return false;
    });

    if (matched.length === 1) {
      return {
        status: 'EXACT_MATCH',
        matchedMatterId: matched[0].id,
        reason: `Unique match found: Matter ${matched[0].matterNumber} (${matched[0].clientName || 'Client'})`,
      };
    }

    if (matched.length > 1) {
      return {
        status: 'AMBIGUOUS',
        reason: `Multiple (${matched.length}) candidate matters share this contact. Manual attorney assignment required.`,
      };
    }

    return { status: 'UNMATCHED', reason: 'No existing matter docket matched this contact info.' };
  }

  /**
   * Formats call duration in standard tenths-of-an-hour billing increments (Utah practice standard).
   */
  static calculateBillingUnits(durationMinutes: number): { units: number; billableMinutes: number } {
    if (!durationMinutes || durationMinutes <= 0) return { units: 0, billableMinutes: 0 };
    // Minimum 0.1 hour (6 minutes) rule for legal billing
    const units = Math.max(0.1, Math.ceil(durationMinutes / 6) / 10);
    return {
      units: Math.round(units * 10) / 10,
      billableMinutes: Math.round(units * 60),
    };
  }
}

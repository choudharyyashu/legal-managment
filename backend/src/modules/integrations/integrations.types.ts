/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * External Integrations Architecture Types (F05)
 * Secure Server-Side Integration Governance
 */

export type IntegrationProviderId =
  | 'cosmolex'
  | 'm365'
  | 'onedrive'
  | 'dropbox'
  | 'docusign'
  | 'lawpay'
  | 'twilio'
  | 'judicialink'
  | 'timing';

export type IntegrationStatusCode =
  | 'NOT_CONFIGURED'
  | 'CONFIGURED'
  | 'AWAITING_CREDENTIALS'
  | 'BLOCKED'
  | 'CONNECTED'
  | 'ERROR'
  | 'TOKEN_EXPIRED';

export interface IntegrationSummary {
  id: IntegrationProviderId;
  name: string;
  category: string;
  purpose: string;
  status: IntegrationStatusCode;
  statusLabel: string;
  tenant: string;
  lastSync: string;
  hasCredentials: boolean;
  maskedAccountId: string | null;
  environment: 'production' | 'sandbox' | 'not_set';
  requiresOAuth: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  status: IntegrationStatusCode;
  message: string;
  details?: {
    providerId: IntegrationProviderId;
    testedAt: string;
    verified: boolean;
    errorCode?: string;
  };
}

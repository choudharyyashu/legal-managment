import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Mail, 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  FileText, 
  CreditCard, 
  Check, 
  Trash2, 
  HelpCircle,
  SlidersHorizontal,
  Server,
  MessageSquare,
  Gavel,
  Clock
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { integrationService } from '../../../services/integrationService';

const DEFAULT_INTEGRATIONS = [
  {
    id: 'cosmolex',
    name: 'CosmoLex Accounting Engine',
    category: 'Trust & General Ledger',
    purpose: 'Official general ledger, IOLTA trust bank account sync, and billing journal transfer.',
    icon: Database,
    status: 'Ready to Configure',
    tenant: 'Pending Configuration',
    lastSync: 'Not Synchronized',
    credentials: {
      accountNumber: '',
      apiKey: '',
      environment: 'production',
      autoSyncLedger: true,
      autoSyncInterval: 'hourly',
    },
    fields: [
      { key: 'accountNumber', label: 'CosmoLex Firm Account ID', type: 'text', placeholder: 'e.g. UT-HB-88192', helper: 'Found in CosmoLex Settings > Firm Information > Account #', required: true },
      { key: 'apiKey', label: 'API Partner Secret Key', type: 'password', placeholder: 'cx_live_sec_...', helper: 'Generated under CosmoLex API & Developer Integration menu', required: true },
      { key: 'environment', label: 'Target Environment', type: 'select', options: [{ value: 'production', label: 'Production (api.cosmolex.com)' }, { value: 'sandbox', label: 'Sandbox / Demo (sandbox-api.cosmolex.com)' }] },
      { key: 'autoSyncInterval', label: 'Automatic Sync Schedule', type: 'select', options: [{ value: 'realtime', label: 'Real-time (Instant)' }, { value: 'hourly', label: 'Hourly Batch' }, { value: 'daily', label: 'Daily End-of-Day (11:59 PM)' }] },
      { key: 'autoSyncLedger', label: 'Enable Automatic 3-Way Reconciliation Sync', type: 'checkbox', helper: 'Synchronize cleared trust checks and client sub-ledgers automatically' }
    ]
  },
  {
    id: 'm365',
    name: 'Microsoft 365 & Outlook Email',
    category: 'Email & Court Calendar',
    purpose: 'Calendar event synchronization, court hearing notices, and legal mailbox archiving.',
    icon: Mail,
    status: 'Ready to Configure',
    tenant: 'Pending Azure App Registration',
    lastSync: 'Not Synchronized',
    credentials: {
      tenantId: '',
      clientId: '',
      clientSecret: '',
      mailboxEmail: '',
      syncCalendar: true,
      archiveCourtEmails: true,
    },
    fields: [
      { key: 'tenantId', label: 'Azure Active Directory Tenant ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', helper: 'Found in Azure Portal > Microsoft Entra ID > Overview', required: true },
      { key: 'clientId', label: 'Application (Client) ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', helper: 'App Registration Application ID for Heugly & Bludworth', required: true },
      { key: 'clientSecret', label: 'Client Secret Value', type: 'password', placeholder: 'Azure Client Secret', helper: 'App Registrations > Certificates & secrets > New client secret', required: true },
      { key: 'mailboxEmail', label: 'Primary Firm Mailbox / Service Account', type: 'text', placeholder: 'filings@utahslawyers.com', helper: 'Designated legal inbox for court e-filing notices', required: false },
      { key: 'syncCalendar', label: 'Two-Way Court Hearing Calendar Sync', type: 'checkbox', helper: 'Bi-directionally sync court docket appearances to attorneys Outlook calendars' },
      { key: 'archiveCourtEmails', label: 'Auto-Archive Inbound Pleadings to Matter Vault', type: 'checkbox', helper: 'Match inbound emails by Matter Docket # and store in Document Vault' }
    ]
  },
  {
    id: 'onedrive',
    name: 'Microsoft OneDrive / SharePoint Legal Vault',
    category: 'Cloud Document Storage',
    purpose: 'Cloud document storage, exhibits, discovery telemetry files, and client records.',
    icon: Cloud,
    status: 'Ready to Configure',
    tenant: 'Pending Storage Vault Link',
    lastSync: 'Not Synchronized',
    credentials: {
      siteUrl: '',
      documentLibrary: 'Matters-Legal-Vault',
      clientId: '',
      clientSecret: '',
      enableVersionSync: true,
    },
    fields: [
      { key: 'siteUrl', label: 'SharePoint Site Root URL', type: 'text', placeholder: 'https://heuglylaw.sharepoint.com/sites/LegalPractice', helper: 'Target SharePoint Online site collection', required: true },
      { key: 'documentLibrary', label: 'Target Document Library Name', type: 'text', placeholder: 'Legal-Matters-Vault', helper: 'SharePoint document library folder structure', required: true },
      { key: 'clientId', label: 'Storage Connector Client ID', type: 'text', placeholder: 'Azure Client ID with Files.ReadWrite.All scope', required: true },
      { key: 'clientSecret', label: 'Connector Client Secret', type: 'password', placeholder: 'Secret value', required: true },
      { key: 'enableVersionSync', label: 'Enforce Filevine-Style Immutable Revision Retention', type: 'checkbox', helper: 'Maintain full history and prevent deletion of prior legal drafts' }
    ]
  },
  {
    id: 'dropbox',
    name: 'Dropbox Legal Discovery Hub',
    category: 'Litigation Discovery',
    purpose: 'Large digital evidence deposit box for opposing counsel transmissions and video depositions.',
    icon: Cloud,
    status: 'Ready to Configure',
    tenant: 'Not Linked',
    lastSync: 'Not Synchronized',
    credentials: {
      appKey: '',
      appSecret: '',
      accessToken: '',
      rootFolder: '/Utah-Litigation-Discovery',
      maxUploadGb: '50',
    },
    fields: [
      { key: 'appKey', label: 'Dropbox App Key', type: 'text', placeholder: 'App Key from Dropbox Developer Console', required: true },
      { key: 'appSecret', label: 'Dropbox App Secret', type: 'password', placeholder: 'App Secret', required: true },
      { key: 'accessToken', label: 'Generated Access / Refresh Token', type: 'password', placeholder: 'sl.u.AF...', helper: 'OAuth Scopes: files.content.read, files.content.write, sharing.write', required: true },
      { key: 'rootFolder', label: 'Discovery Root Folder', type: 'text', placeholder: '/Utah-Litigation-Discovery', helper: 'Root directory for shared opposing counsel discovery folders' }
    ]
  },
  {
    id: 'docusign',
    name: 'DocuSign Legal e-Signature',
    category: 'e-Signatures & Retainers',
    purpose: 'Digital execution of Utah RPC-compliant Retainer Agreements, HIPAA Waivers, and Settlements.',
    icon: FileText,
    status: 'Ready to Configure',
    tenant: 'Pending Integration Key',
    lastSync: 'Not Synchronized',
    credentials: {
      integrationKey: '',
      accountId: '',
      secretKey: '',
      environment: 'production',
      enforceSignerAuth: true,
    },
    fields: [
      { key: 'integrationKey', label: 'DocuSign Integration Key (Client ID)', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', helper: 'Found in DocuSign eSignature Admin > Integrations > Apps and Keys', required: true },
      { key: 'accountId', label: 'DocuSign API Account ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', helper: 'Your organization account identifier', required: true },
      { key: 'secretKey', label: 'Secret Key / RSA Private Key', type: 'password', placeholder: 'DocuSign Secret Key', helper: 'JWT or Authorization Code secret', required: true },
      { key: 'environment', label: 'DocuSign Server Environment', type: 'select', options: [{ value: 'production', label: 'Production (account.docusign.com)' }, { value: 'demo', label: 'Developer Sandbox (account-d.docusign.com)' }] },
      { key: 'enforceSignerAuth', label: 'Require SMS / Access Code Signer Authentication', type: 'checkbox', helper: 'Enforces Utah electronic signature verification standard for client protection' }
    ]
  },
  {
    id: 'lawpay',
    name: 'LawPay Legal Payment Gateway',
    category: 'IOLTA Trust & Card Processing',
    purpose: 'Utah RPC 1.15 compliant credit card retainers with strict Trust vs Operating fee isolation.',
    icon: CreditCard,
    status: 'Ready to Configure',
    tenant: 'Pending Gateway Credentials',
    lastSync: 'Not Synchronized',
    credentials: {
      merchantId: '',
      publicKey: '',
      secretKey: '',
      trustAccountRouting: '',
      separateProcessingFees: true,
    },
    fields: [
      { key: 'merchantId', label: 'LawPay Merchant ID', type: 'text', placeholder: 'lp_merch_...', helper: 'AffiniPay / LawPay Merchant ID', required: true },
      { key: 'publicKey', label: 'Publishable API Key', type: 'text', placeholder: 'pk_live_...', helper: 'Used for client-side card tokenization', required: true },
      { key: 'secretKey', label: 'Secret API Key', type: 'password', placeholder: 'sk_live_...', helper: 'Kept confidential on backend server', required: true },
      { key: 'trustAccountRouting', label: 'Designated IOLTA Trust Account', type: 'text', placeholder: 'Zions Bank Trust #****4491', helper: 'Client retainer deposits are routed directly to this trust account', required: true },
      { key: 'separateProcessingFees', label: 'Strict Fee Isolation (RPC 1.15)', type: 'checkbox', helper: 'Processing fees must NEVER be deducted from trust accounts; charge operating account only' }
    ]
  },
  {
    id: 'twilio',
    name: 'Twilio Legal SMS & Court Reminders',
    category: 'Client Messaging',
    purpose: 'Automated appointment reminders and court appearance notifications via SMS.',
    icon: MessageSquare,
    status: 'Ready to Configure',
    tenant: 'Pending Phone Number Assignment',
    lastSync: 'Not Synchronized',
    credentials: {
      accountSid: '',
      authToken: '',
      phoneNumber: '',
    },
    fields: [
      { key: 'accountSid', label: 'Twilio Account SID', type: 'text', placeholder: 'ACxxxxxxxx...', helper: 'Twilio Console Project Account SID', required: true },
      { key: 'authToken', label: 'Twilio Auth Token', type: 'password', placeholder: 'Auth Token', helper: 'Twilio Console API Secret Auth Token', required: true },
      { key: 'phoneNumber', label: 'Twilio Sender Phone Number', type: 'text', placeholder: '+18015550199', helper: 'Firm SMS phone number configured for two-way messaging', required: true },
    ]
  },
  {
    id: 'judicialink',
    name: 'Judicialink Utah Court e-Filing Bridge',
    category: 'Utah Courts & Pleadings',
    purpose: 'Direct Utah State Courts GreenFiling docket integration and electronic pleading service.',
    icon: Gavel,
    status: 'Ready to Configure',
    tenant: 'Awaiting Utah Bar Credentials',
    lastSync: 'Not Synchronized',
    credentials: {
      firmCode: '',
      apiKey: '',
      courtDistrict: 'Third Judicial District',
    },
    fields: [
      { key: 'firmCode', label: 'Utah State Bar Firm E-Filing ID', type: 'text', placeholder: 'UT-HB-8819', helper: 'Utah State Courts e-filing firm identifier', required: true },
      { key: 'apiKey', label: 'Judicialink API Gateway Key', type: 'password', placeholder: 'jlink_sec_...', helper: 'Secure API token from Judicialink gateway', required: true },
    ]
  },
  {
    id: 'timing',
    name: 'Timing Automatic Billing Telemetry',
    category: 'Time & Activity Capture',
    purpose: 'Automated desktop legal research and document activity capture for suggested billing entries.',
    icon: Clock,
    status: 'Ready to Configure',
    tenant: 'Pending Timing Team ID',
    lastSync: 'Not Synchronized',
    credentials: {
      teamId: '',
      apiToken: '',
    },
    fields: [
      { key: 'teamId', label: 'Timing Team Identifier', type: 'text', placeholder: 'team_...', helper: 'Organization identifier from Timing Web', required: true },
      { key: 'apiToken', label: 'Timing Developer API Token', type: 'password', placeholder: 'timing_tok_...', helper: 'Generated under Timing Web integrations', required: true },
    ]
  }
];

export function ExternalIntegrations() {
  const { addToast } = useToast();

  const [integrations, setIntegrations] = useState(DEFAULT_INTEGRATIONS);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [modalForm, setModalForm] = useState({});
  const [showSecrets, setShowSecrets] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Load authoritative server-side integration status
  const loadStatuses = async () => {
    setLoading(true);
    try {
      const serverList = await integrationService.getStatuses();
      if (Array.isArray(serverList) && serverList.length > 0) {
        setIntegrations((prev) =>
          prev.map((item) => {
            const serverItem = serverList.find((s) => s.id === item.id);
            if (serverItem) {
              return {
                ...item,
                status: serverItem.status === 'CONNECTED'
                  ? 'Connected'
                  : serverItem.status === 'CONFIGURED'
                  ? 'Configured'
                  : 'Credentials Required',
                statusCode: serverItem.status,
                statusLabel: serverItem.statusLabel,
                tenant: serverItem.tenant,
                lastSync: serverItem.lastSync,
                hasCredentials: serverItem.hasCredentials,
              };
            }
            return item;
          })
        );
      }
    } catch (err) {
      console.warn('Could not load integrations status from backend:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // F05: Purge legacy client-side localStorage credentials on mount
    try {
      localStorage.removeItem('hb_external_integrations_config_v2');
      localStorage.removeItem('hb_external_integrations_config');
    } catch (_) {}
    loadStatuses();
  }, []);

  // Open modal for specific integration
  const handleOpenConfig = (item) => {
    setSelectedIntegration(item);
    setModalForm({ ...item.credentials });
    setShowSecrets({});
    setTestResult(null);
  };

  const handleCloseModal = () => {
    setSelectedIntegration(null);
    setModalForm({});
    setTestResult(null);
  };

  const handleFieldChange = (key, value) => {
    setModalForm(prev => ({
      ...prev,
      [key]: value
    }));
    setTestResult(null);
  };

  const toggleSecretVisibility = (key) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Test Handshake via Backend Verification
  const handleTestConnection = async () => {
    if (!selectedIntegration) return;

    // Check required fields
    const missing = selectedIntegration.fields
      .filter(f => f.required && !modalForm[f.key]?.trim())
      .map(f => f.label);

    if (missing.length > 0) {
      setTestResult({
        success: false,
        message: `Missing required credentials: ${missing.join(', ')}`
      });
      addToast('Please fill in all required API credentials.', 'warning');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await integrationService.testConnection(selectedIntegration.id, modalForm);
      setTestResult(res);
      if (res?.success) {
        addToast(`${selectedIntegration.name} connection verified!`, 'success');
      } else {
        addToast(res?.message || 'Server reports integration credentials required.', 'warning');
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err?.response?.data?.message || err?.message || 'Connection test failed at backend gateway.'
      });
      addToast('Connection test failed. Check server logs.', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // Save Credentials (Secure Server-Side Persistence & Live Handshake)
  const [isSaving, setIsSaving] = useState(false);
  const handleSaveConfig = async (e) => {
    e?.preventDefault();
    if (!selectedIntegration) return;

    // Validate required fields
    const missing = selectedIntegration.fields
      .filter(f => f.required && !modalForm[f.key]?.trim())
      .map(f => f.label);

    if (missing.length > 0) {
      addToast(`Required: ${missing[0]} cannot be empty.`, 'error');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Save credentials to secure server storage
      const saveRes = await integrationService.saveConfig(selectedIntegration.id, modalForm);
      
      // 2. Perform live connection test
      const testRes = await integrationService.testConnection(selectedIntegration.id, modalForm);
      setTestResult(testRes);

      if (testRes?.success) {
        addToast(`${selectedIntegration.name} configuration saved & verified! Connection active.`, 'success');
      } else {
        addToast(
          saveRes?.message || `${selectedIntegration.name} credentials saved. Live status updated.`,
          'info'
        );
      }

      await loadStatuses();
      handleCloseModal();
    } catch (err) {
      addToast(err?.response?.data?.message || err?.message || 'Failed to save integration configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Disconnect & Clear
  const handleDisconnect = async (id) => {
    try {
      await integrationService.disconnect(id);
      addToast('Integration disconnected and credentials cleared from backend session.', 'info');
    } catch {
      addToast('Integration status reset to unconfigured.', 'info');
    }
    loadStatuses();
    if (selectedIntegration?.id === id) {
      handleCloseModal();
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'Connected').length;
  const configuredCount = integrations.filter(i => i.status === 'Configured').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Third-Party Integrations &amp; Cloud Bridges"
        subtitle="Manage live production connectors for CosmoLex accounting, Microsoft 365, Dropbox, DocuSign, and LawPay."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/settings/users' }, { label: 'Integrations' }]}
      />

      {/* Status Bar */}
      <div className="p-4 bg-white border border-[#D9D6CF] rounded-lg shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#06244B]/10 flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-[#06244B]" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#06244B] flex items-center gap-2">
              <span>Production Credential Vault &amp; Live Bridges</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#287A55]/10 text-[#287A55]">
                {connectedCount} Connected, {configuredCount} Configured of {integrations.length} Gateways
              </span>
            </h4>
            <p className="text-xs text-[#667085] mt-0.5">
              Enter API keys, Azure App Secrets, or OAuth tokens directly from this interface to link external practice software.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#287A55]" />
          <span className="text-[#202A35] font-semibold">End-to-End Encrypted Storage</span>
        </div>
      </div>

      {/* Grid of Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((item) => {
          const Icon = item.icon;
          const isConnected = item.status === 'Connected';

          return (
            <div 
              key={item.id} 
              className={`bg-white rounded-lg border transition-all duration-150 flex flex-col justify-between shadow-subtle ${
                isConnected ? 'border-[#287A55]/40 ring-1 ring-[#287A55]/20' : 'border-[#D9D6CF]'
              }`}
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isConnected ? 'bg-[#287A55] text-white' : 'bg-[#06244B] text-white'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A4432B]">
                        {item.category}
                      </span>
                      <h3 className="font-serif font-bold text-sm text-[#06244B] leading-tight mt-0.5">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F5F0E5]/40 px-3 py-2 rounded border border-[#D9D6CF]/50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085] text-[11px]">Status:</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#D9D6CF]/40">
                    <span className="text-[#667085] text-[11px]">Connection:</span>
                    <span className="font-mono text-[11px] font-medium text-[#06244B] truncate max-w-[140px]">
                      {item.tenant}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#202A35] leading-relaxed">
                  {item.purpose}
                </p>
              </div>

              <div className="p-4 bg-[#F5F0E5]/20 border-t border-[#D9D6CF]/60 flex items-center justify-between text-xs">
                <span className="text-[#667085] text-[11px]">
                  Last Synced: <strong className="text-[#202A35]">{item.lastSync}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenConfig(item)}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-[#06244B]" />
                        Configure
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenConfig(item)}
                    >
                      <Key className="w-3.5 h-3.5 mr-1" />
                      Add Key &amp; Connect
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration & Key Entry Modal */}
      {selectedIntegration && (
        <Modal
          isOpen={!!selectedIntegration}
          onClose={handleCloseModal}
          maxWidth="max-w-2xl"
          title={`Configure ${selectedIntegration.name}`}
          subtitle={`Set up your live API credentials and synchronization settings for ${selectedIntegration.category}.`}
          footer={
            <div className="flex items-center justify-between w-full">
              <div>
                {selectedIntegration.status === 'Connected' && (
                  <Button
                    type="button"
                    variant="outline"
                    className="text-[#B42318] border-[#B42318]/30 hover:bg-[#B42318]/10"
                    onClick={() => handleDisconnect(selectedIntegration.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Disconnect &amp; Clear Keys
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testing Handshake...' : 'Test Connection'}
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveConfig}
                  disabled={isSaving || isTesting}
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  {isSaving ? 'Saving & Verifying...' : 'Save & Connect'}
                </Button>
              </div>
            </div>
          }
        >
          <form onSubmit={handleSaveConfig} className="space-y-4 py-2">
            {/* Test Connection Result Box */}
            {testResult && (
              <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-[#287A55]/10 border-[#287A55]/30 text-[#287A55]'
                  : 'bg-[#B42318]/10 border-[#B42318]/30 text-[#B42318]'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#287A55]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#B42318]" />
                )}
                <div>
                  <strong className="font-semibold block">
                    {testResult.success ? 'Connectivity Verified' : 'Connection Failed'}
                  </strong>
                  <span>{testResult.message}</span>
                </div>
              </div>
            )}

            {/* Dynamic Fields for Selected Integration */}
            <div className="space-y-4">
              {selectedIntegration.fields.map((field) => {
                const isSecret = field.type === 'password';
                const showCurrentSecret = showSecrets[field.key];
                const value = modalForm[field.key] ?? '';

                if (field.type === 'checkbox') {
                  return (
                    <div key={field.key} className="p-3 bg-[#F5F0E5]/30 border border-[#D9D6CF] rounded flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={`field-${field.key}`}
                        checked={Boolean(value)}
                        onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-[#D9D6CF] text-[#06244B] focus:ring-[#06244B]"
                      />
                      <label htmlFor={`field-${field.key}`} className="text-xs cursor-pointer">
                        <span className="font-semibold text-[#06244B] block">{field.label}</span>
                        {field.helper && <span className="text-[#667085] text-[11px] mt-0.5 block">{field.helper}</span>}
                      </label>
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div key={field.key} className="space-y-1">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#06244B]">
                        {field.label} {field.required && <span className="text-[#A4432B]">*</span>}
                      </label>
                      <select
                        value={value}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full text-xs rounded border border-[#D9D6CF] bg-white py-2 px-3 text-[#202A35] focus:border-[#06244B] focus:outline-none focus:ring-1 focus:ring-[#06244B]"
                      >
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {field.helper && <p className="text-[11px] text-[#667085] mt-1">{field.helper}</p>}
                    </div>
                  );
                }

                return (
                  <div key={field.key} className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#06244B]">
                      {field.label} {field.required && <span className="text-[#A4432B]">*</span>}
                    </label>

                    <div className="relative">
                      <input
                        type={isSecret ? (showCurrentSecret ? 'text' : 'password') : 'text'}
                        value={value}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className={`w-full text-xs rounded border border-[#D9D6CF] bg-white py-2 px-3 text-[#202A35] font-mono focus:border-[#06244B] focus:outline-none focus:ring-1 focus:ring-[#06244B] ${
                          isSecret ? 'pr-10' : ''
                        }`}
                      />

                      {isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(field.key)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#667085] hover:text-[#06244B]"
                          tabIndex={-1}
                        >
                          {showCurrentSecret ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {field.helper && (
                      <p className="text-[11px] text-[#667085] mt-0.5">{field.helper}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-start gap-2 mt-4">
              <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Utah RPC 1.6 Confidentiality Notice:</strong> API keys and Client Secrets are used strictly for authorized firm tenant synchronization and encrypted in storage.
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}



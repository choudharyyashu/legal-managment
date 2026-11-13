import React, { useState } from 'react';
import { Database, Mail, Cloud, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export function ExternalIntegrations() {
  const { addToast } = useToast();

  const [integrations, setIntegrations] = useState([
    {
      id: 'cosmolex',
      name: 'CosmoLex Accounting Engine',
      purpose: 'Official general ledger, trust bank account sync, and billing export transfer.',
      icon: Database,
      status: 'Connected',
      tenant: 'Heugly & Bludworth LLC (Account #UT-88192)',
      lastSync: '2026-11-04 18:30',
    },
    {
      id: 'm365',
      name: 'Microsoft 365 & Outlook Email',
      purpose: 'Calendar event synchronization, court hearing notices, and legal mailbox archiving.',
      icon: Mail,
      status: 'Connected',
      tenant: 'utahslawyers.com (Azure AD Enterprise)',
      lastSync: '2026-11-06 12:00',
    },
    {
      id: 'onedrive',
      name: 'Microsoft OneDrive / SharePoint Legal Vault',
      purpose: 'Cloud document storage, exhibits, and discovery telemetry files.',
      icon: Cloud,
      status: 'Connected',
      tenant: 'SharePoint Legal Document Vault',
      lastSync: '2026-11-06 14:10',
    },
    {
      id: 'dropbox',
      name: 'Dropbox Legal Discovery Hub',
      purpose: 'Large digital evidence deposit box for opposing counsel transmissions.',
      icon: Cloud,
      status: 'Ready to Configure',
      tenant: 'Not Linked',
      lastSync: 'Never',
    }
  ]);

  const toggleConnect = (id) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Connected' ? 'Ready to Configure' : 'Connected';
        addToast(`${item.name} state changed to ${nextStatus}.`, 'info');
        return {
          ...item,
          status: nextStatus,
          lastSync: nextStatus === 'Connected' ? 'Just now' : 'Never'
        };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Third-Party Integrations &amp; Cloud Bridges"
        subtitle="Manage secure connectors for CosmoLex accounting, Microsoft 365, and cloud storage providers."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/settings/users' }, { label: 'Integrations' }]}
      />

      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0" />
          <span>Integration sandbox demo mode. Connectors demonstrate UI workflows without making real third-party API calls.</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Mock Connectors</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => {
          const Icon = item.icon;
          const isConnected = item.status === 'Connected';

          return (
            <div key={item.id} className="bg-white p-5 rounded border border-[#D9D6CF] shadow-subtle flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#06244B] text-white flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#A4432B]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#06244B]">{item.name}</h3>
                      <p className="text-[11px] text-[#667085] mt-0.5">{item.tenant}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <p className="text-xs text-[#202A35] mt-3 leading-relaxed">
                  {item.purpose}
                </p>
              </div>

              <div className="pt-3 border-t border-[#D9D6CF]/60 flex items-center justify-between text-xs">
                <span className="text-[#667085]">
                  Last Synced: <strong>{item.lastSync}</strong>
                </span>

                <Button
                  size="sm"
                  variant={isConnected ? 'outline' : 'primary'}
                  onClick={() => toggleConnect(item.id)}
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


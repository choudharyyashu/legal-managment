import React, { useState } from 'react';
import { SlidersHorizontal, Check, RefreshCw, Palette, Building, Scale } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

const BRANDING_STORAGE_KEY = 'hb_firm_branding_config';

const DEFAULT_BRANDING = {
  firmName: 'HEUGLY & BLUDWORTH, LLC',
  tagline: 'ATTORNEYS AT LAW • ESTABLISHED PRACTICE',
  primaryPhone: '(801) 555-0100',
  primaryEmail: 'contact@utahslawyers.com',
  address: '250 State Street, Suite 800, Salt Lake City, UT 84111',
};

export function FirmBranding() {
  const { addToast } = useToast();

  const [branding, setBranding] = useState(() => {
    try {
      const saved = localStorage.getItem(BRANDING_STORAGE_KEY);
      return saved ? { ...DEFAULT_BRANDING, ...JSON.parse(saved) } : DEFAULT_BRANDING;
    } catch {
      return DEFAULT_BRANDING;
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
      addToast('Firm branding and letterhead configuration saved successfully.', 'success');
    } catch (err) {
      addToast('Failed to save firm branding configuration.', 'error');
    }
  };

  const handleReset = () => {
    setBranding(DEFAULT_BRANDING);
    try {
      localStorage.removeItem(BRANDING_STORAGE_KEY);
    } catch {}
    addToast('Branding reset to official Utah Law defaults.', 'info');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Firm Identity &amp; Branding"
        subtitle="Visual identity system inspired by Utah's Lawyers: Deep Navy, Warm Cream, and Terracotta."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/settings/users' }, { label: 'Firm Branding' }]}
      />

      {/* Brand Color Tokens Preview */}
      <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <h3 className="font-serif font-bold text-base text-[#06244B] border-b border-[#D9D6CF]/60 pb-2 flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#A4432B]" />
          <span>Active Visual Design Tokens</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded bg-[#06244B] text-white space-y-1 shadow-sm">
            <span className="font-serif font-bold text-sm block">Deep Navy</span>
            <span className="font-mono text-[11px] opacity-80">#06244B</span>
            <span className="text-[10px] block opacity-70">Sidebar &amp; Primary Headings</span>
          </div>

          <div className="p-4 rounded bg-[#F5F0E5] text-[#202A35] border border-[#D9D6CF] space-y-1 shadow-sm">
            <span className="font-serif font-bold text-sm block">Warm Cream</span>
            <span className="font-mono text-[11px] text-[#667085]">#F5F0E5</span>
            <span className="text-[10px] block text-[#667085]">Application Background Canvas</span>
          </div>

          <div className="p-4 rounded bg-[#A4432B] text-white space-y-1 shadow-sm">
            <span className="font-serif font-bold text-sm block">Terracotta</span>
            <span className="font-mono text-[11px] opacity-80">#A4432B</span>
            <span className="text-[10px] block opacity-70">Primary Buttons &amp; Accents</span>
          </div>

          <div className="p-4 rounded bg-[#202A35] text-white space-y-1 shadow-sm">
            <span className="font-serif font-bold text-sm block">Charcoal Text</span>
            <span className="font-mono text-[11px] opacity-80">#202A35</span>
            <span className="text-[10px] block opacity-70">Primary Typography &amp; Grid Data</span>
          </div>
        </div>
      </div>

      {/* Formal Letterhead Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <h3 className="font-serif font-bold text-base text-[#06244B] border-b border-[#D9D6CF]/60 pb-2 flex items-center gap-2">
          <Building className="w-4 h-4 text-[#06244B]" />
          <span>Formal Practice Information (Invoices &amp; Pleadings)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Legal Entity Name"
              required
              value={branding.firmName}
              onChange={(e) => setBranding({ ...branding, firmName: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Practice Subtitle / Letterhead Tagline"
              value={branding.tagline}
              onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Primary Law Firm Telephone"
              value={branding.primaryPhone}
              onChange={(e) => setBranding({ ...branding, primaryPhone: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Official Firm Notice Email"
              value={branding.primaryEmail}
              onChange={(e) => setBranding({ ...branding, primaryEmail: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Headquarters Street Address"
              value={branding.address}
              onChange={(e) => setBranding({ ...branding, address: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#D9D6CF]">
          <Button type="button" variant="outline" size="sm" icon={RefreshCw} onClick={handleReset}>
            Reset Defaults
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={Check}>
            Save Practice Branding
          </Button>
        </div>
      </form>
    </div>
  );
}


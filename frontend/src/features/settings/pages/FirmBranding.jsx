import React, { useState } from 'react';
import { SlidersHorizontal, Check, RefreshCw, Palette, Building, Scale } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

export function FirmBranding() {
  const { addToast } = useToast();

  const [firmName, setFirmName] = useState('HEUGLY & BLUDWORTH, LLC');
  const [tagline, setTagline] = useState('ATTORNEYS AT LAW • ESTABLISHED PRACTICE');
  const [primaryPhone, setPrimaryPhone] = useState('(801) 555-0100');
  const [primaryEmail, setPrimaryEmail] = useState('contact@utahslawyers.com');
  const [address, setAddress] = useState('250 State Street, Suite 800, Salt Lake City, UT 84111');

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Firm branding and letterhead configuration updated.', 'success');
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
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Practice Subtitle / Letterhead Tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Primary Law Firm Telephone"
              value={primaryPhone}
              onChange={(e) => setPrimaryPhone(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Official Firm Notice Email"
              value={primaryEmail}
              onChange={(e) => setPrimaryEmail(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Headquarters Street Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#D9D6CF]">
          <Button type="submit" variant="primary" size="sm">
            Save Practice Branding
          </Button>
        </div>
      </form>
    </div>
  );
}


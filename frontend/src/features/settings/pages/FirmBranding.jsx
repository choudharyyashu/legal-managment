import React, { useState, useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  Check,
  RefreshCw,
  Palette,
  Building,
  Scale,
  Upload,
  Trash2,
  Image as ImageIcon,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { useBranding } from '../../../context/BrandingContext';
import { useAuth } from '../../../hooks/useAuth';

export function FirmBranding() {
  const { branding, loading, updateBranding, resetBranding } = useBranding();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  // Authorization check: Super Admin or supervisor or user with branding:manage permission
  const isAuthorized =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'supervisor' ||
    currentUser?.permissions?.includes('branding:manage');

  const [formState, setFormState] = useState({
    firmName: branding?.firmName || 'HEUGLY & BLUDWORTH, LLC',
    tagline: branding?.tagline || 'ATTORNEYS AT LAW • ESTABLISHED PRACTICE',
    primaryPhone: branding?.primaryPhone || '(801) 555-0100',
    primaryEmail: branding?.primaryEmail || 'contact@utahslawyers.com',
    address: branding?.address || '250 State Street, Suite 800, Salt Lake City, UT 84111',
    logoUrl: branding?.logoUrl || null,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Synchronize local form state whenever branding context updates from backend
  useEffect(() => {
    if (branding) {
      setFormState({
        firmName: branding.firmName || 'HEUGLY & BLUDWORTH, LLC',
        tagline: branding.tagline || 'ATTORNEYS AT LAW • ESTABLISHED PRACTICE',
        primaryPhone: branding.primaryPhone || '(801) 555-0100',
        primaryEmail: branding.primaryEmail || 'contact@utahslawyers.com',
        address: branding.address || '250 State Street, Suite 800, Salt Lake City, UT 84111',
        logoUrl: branding.logoUrl || null,
      });
    }
  }, [branding]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      addToast('Logo file size must not exceed 2MB.', 'error');
      return;
    }

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      addToast('Invalid file format. Please upload PNG, JPEG, WebP, or SVG.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({ ...prev, logoUrl: reader.result }));
      addToast('Logo selected. Click "Save Practice Branding" to persist changes.', 'info');
    };
    reader.onerror = () => {
      addToast('Failed to read logo image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormState((prev) => ({ ...prev, logoUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    addToast('Logo removed from letterhead preview. Click Save to persist.', 'info');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      addToast('Access denied. Administrator privileges required to save branding.', 'error');
      return;
    }

    if (!formState.firmName || formState.firmName.trim().length < 2) {
      addToast('Legal entity name must be at least 2 characters.', 'error');
      return;
    }

    if (formState.primaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.primaryEmail.trim())) {
      addToast('Please enter a valid official firm notice email address.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateBranding({
        firmName: formState.firmName.trim(),
        tagline: formState.tagline.trim(),
        primaryPhone: formState.primaryPhone.trim(),
        primaryEmail: formState.primaryEmail.trim(),
        address: formState.address.trim(),
        logoUrl: formState.logoUrl || null,
      });
      addToast('Firm branding and letterhead configuration saved successfully.', 'success');
    } catch (err) {
      console.error('Failed to save branding:', err);
      addToast(err?.message || 'Failed to save firm branding configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!isAuthorized) {
      addToast('Access denied. Administrator privileges required to reset branding.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await resetBranding();
      if (fileInputRef.current) fileInputRef.current.value = '';
      addToast('Branding reset to official Utah Law defaults.', 'info');
    } catch (err) {
      console.error('Failed to reset branding:', err);
      addToast('Failed to reset firm branding configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Firm Identity &amp; Branding"
        subtitle="Visual identity system inspired by Utah's Lawyers: Deep Navy, Warm Cream, and Terracotta."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/settings/users' }, { label: 'Firm Branding' }]}
      />

      {/* Read-Only Mode Banner for Non-Admin Personnel */}
      {!isAuthorized && (
        <div className="p-4 rounded border border-amber-300 bg-amber-50 flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Read-Only View</span>
            <p className="mt-0.5 leading-relaxed">
              You are viewing the active firm branding configuration. Only authorized administrators (Super Admin or
              users with <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">branding:manage</code> permission)
              can modify practice letterhead and visual assets.
            </p>
          </div>
        </div>
      )}

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

      {/* Firm Logo Management & Letterhead Header Preview */}
      <div className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <h3 className="font-serif font-bold text-base text-[#06244B] border-b border-[#D9D6CF]/60 pb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#A4432B]" />
            <span>Practice Logo &amp; Official Letterhead Emblem</span>
          </span>
          <span className="text-[11px] text-[#667085] font-normal">
            Used on official invoices, pleadings &amp; engagement letters
          </span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-[#F5F0E5]/40 rounded-lg border border-[#D9D6CF]/70">
          {/* Logo Visual Box */}
          <div className="w-36 h-24 bg-white border border-[#D9D6CF] rounded-lg flex items-center justify-center p-2 shadow-xs overflow-hidden flex-shrink-0">
            {formState.logoUrl ? (
              <img
                src={formState.logoUrl}
                alt="Firm Logo Preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center text-[#667085] space-y-1">
                <Scale className="w-8 h-8 text-[#A4432B] mx-auto opacity-70" />
                <span className="text-[10px] font-semibold block text-[#06244B]">Utah Bar Scales</span>
              </div>
            )}
          </div>

          {/* Logo Controls */}
          <div className="space-y-2 flex-1 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-[#06244B] block">
                {formState.logoUrl ? 'Active Practice Logo' : 'Default Official Seal'}
              </span>
              <p className="text-[11px] text-[#667085] leading-relaxed">
                Accepted image formats: PNG, JPEG, SVG, WebP (maximum file size 2MB). Recommended transparent
                background with high-DPI resolution for crisp PDF rendering.
              </p>
            </div>

            {isAuthorized && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving || loading}
                >
                  {formState.logoUrl ? 'Replace Logo' : 'Upload Firm Logo'}
                </Button>

                {formState.logoUrl && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={handleRemoveLogo}
                    disabled={isSaving || loading}
                  >
                    Remove Logo
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formal Letterhead Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-4">
        <h3 className="font-serif font-bold text-base text-[#06244B] border-b border-[#D9D6CF]/60 pb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#06244B]" />
            <span>Formal Practice Information (Invoices &amp; Pleadings)</span>
          </span>
          {branding?.updatedAt && (
            <span className="text-[11px] text-[#667085] font-normal flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#667085]" />
              <span>
                Saved: {new Date(branding.updatedAt).toLocaleDateString()} by {branding.updatedBy || 'Administrator'}
              </span>
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Legal Entity Name"
              required
              disabled={!isAuthorized || isSaving}
              value={formState.firmName}
              onChange={(e) => setFormState({ ...formState, firmName: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Practice Subtitle / Letterhead Tagline"
              disabled={!isAuthorized || isSaving}
              value={formState.tagline}
              onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Primary Law Firm Telephone"
              disabled={!isAuthorized || isSaving}
              value={formState.primaryPhone}
              onChange={(e) => setFormState({ ...formState, primaryPhone: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Official Firm Notice Email"
              disabled={!isAuthorized || isSaving}
              value={formState.primaryEmail}
              onChange={(e) => setFormState({ ...formState, primaryEmail: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Headquarters Street Address"
              disabled={!isAuthorized || isSaving}
              value={formState.address}
              onChange={(e) => setFormState({ ...formState, address: e.target.value })}
            />
          </div>
        </div>

        {isAuthorized && (
          <div className="flex items-center justify-between pt-3 border-t border-[#D9D6CF]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={handleReset}
              disabled={isSaving || loading}
            >
              Reset Defaults
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Check}
              disabled={isSaving || loading}
            >
              {isSaving ? 'Saving...' : 'Save Practice Branding'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

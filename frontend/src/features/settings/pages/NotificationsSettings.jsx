import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Check,
  Shield,
  Info,
} from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { useNotificationPreferences } from '../../../context/NotificationContext';
import { useAuth } from '../../../hooks/useAuth';

export function NotificationsSettings() {
  const { preferences, gatewayStatus, loading, updatePreferences, resetPreferences } = useNotificationPreferences();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [formState, setFormState] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormState(preferences);
    }
  }, [preferences]);

  const handleToggle = (key) => {
    setFormState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangeLeadTime = (e) => {
    setFormState((prev) => ({ ...prev, courtDeadlineLeadTime: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updatePreferences(formState);
      addToast('Notification preferences successfully saved and synchronized.', 'success');
    } catch (err) {
      console.error('Failed to save notification preferences:', err);
      addToast(err?.message || 'Failed to save notification preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      await resetPreferences();
      addToast('Notification preferences reset to default Utah Law configuration.', 'info');
    } catch (err) {
      console.error('Failed to reset notification preferences:', err);
      addToast('Failed to reset notification preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification &amp; Alert Settings"
        subtitle="Manage email, in-app badges, and SMS alerts for court appearances, impending discovery deadlines, and partner approvals."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/settings/users' }, { label: 'Notifications' }]}
      />

      {/* Gateway Capability Status Banner */}
      <div className="p-4 rounded-lg border border-[#D9D6CF] bg-white shadow-xs space-y-2 text-xs">
        <div className="flex items-center justify-between border-b border-[#D9D6CF]/60 pb-2">
          <span className="font-bold text-[#06244B] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#A4432B]" />
            <span>Firm External Dispatch Infrastructure Status</span>
          </span>
          <span className="text-[11px] text-[#667085]">
            User Account: <strong className="text-[#06244B]">{currentUser?.name || 'Staff Member'}</strong> ({currentUser?.role || 'User'})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-2.5 rounded bg-[#F9FAFB] border border-[#EAECF0] flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-[#06244B] mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-[#06244B] block">Email Dispatch Gateway</span>
              <p className="text-[11px] text-[#667085] mt-0.5">
                Status:{' '}
                <strong className={gatewayStatus.emailConfigured ? 'text-emerald-700' : 'text-amber-700'}>
                  {gatewayStatus.emailConfigured ? 'Configured (Active)' : 'Unconfigured (In-App Only)'}
                </strong>
                {!gatewayStatus.emailConfigured && ' — External SMTP relay inactive. Alerts route to In-App Topbar.'}
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#F9FAFB] border border-[#EAECF0] flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-[#A4432B] mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-[#06244B] block">SMS Cellular Dispatch</span>
              <p className="text-[11px] text-[#667085] mt-0.5">
                Status:{' '}
                <strong className={gatewayStatus.smsConfigured ? 'text-emerald-700' : 'text-amber-700'}>
                  {gatewayStatus.smsConfigured ? 'Configured (Twilio Cloud)' : 'Unconfigured (In-App Only)'}
                </strong>
                {!gatewayStatus.smsConfigured && ' — Mobile SMS delivery inactive. High-priority badges shown in-app.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-6">
        {/* Section 1: Court Deadlines & Malpractice Alert Protocol */}
        <div className="space-y-4">
          <div className="border-b border-[#D9D6CF]/60 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif font-bold text-base text-[#06244B] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#A4432B]" />
                <span>Court Deadlines &amp; Malpractice Alert Protocol</span>
              </h3>
              <p className="text-xs text-[#667085] mt-0.5">
                High-priority alerts for trial appearances, motions, hearings, and discovery cutoffs.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Court Appearance Email Reminders */}
            <div className="flex items-center justify-between p-3.5 rounded bg-[#F5F0E5]/60 border border-[#D9D6CF] hover:bg-[#F5F0E5]/80 transition-colors">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#06244B] text-sm">Court Appearance Email Reminders</span>
                  {!gatewayStatus.emailConfigured && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                      In-App Fallback
                    </span>
                  )}
                </div>
                <span className="text-[#667085] block">
                  Notify lead counsel and assigned litigation staff of scheduled hearings and docket cutoffs.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formState.courtDeadlineEmail}
                onChange={() => handleToggle('courtDeadlineEmail')}
                disabled={isSaving || loading}
                className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
              />
            </div>

            {/* Urgent Court SMS Alerts */}
            <div className="flex items-center justify-between p-3.5 rounded bg-[#F5F0E5]/60 border border-[#D9D6CF] hover:bg-[#F5F0E5]/80 transition-colors">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#06244B] text-sm">Urgent Court SMS Alerts</span>
                  {!gatewayStatus.smsConfigured && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                      In-App Fallback
                    </span>
                  )}
                </div>
                <span className="text-[#667085] block">
                  Dispatch priority text alerts to attorney mobile device for hearings within critical window.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formState.courtDeadlineSms}
                onChange={() => handleToggle('courtDeadlineSms')}
                disabled={isSaving || loading}
                className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
              />
            </div>

            {/* Court Deadline Lead Time Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded bg-[#F5F0E5]/60 border border-[#D9D6CF] gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-[#06244B] text-sm block">Court Appearance Alert Lead Time</span>
                <span className="text-[#667085] block">
                  Select how far in advance court appearance alerts and docket notices begin surfacing.
                </span>
              </div>
              <div className="flex-shrink-0">
                <select
                  value={formState.courtDeadlineLeadTime || '48'}
                  onChange={handleChangeLeadTime}
                  disabled={isSaving || loading}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#D9D6CF] rounded text-[#06244B] focus:outline-none focus:ring-2 focus:ring-[#06244B]"
                >
                  <option value="24">24 Hours Prior (1 Day)</option>
                  <option value="48">48 Hours Prior (2 Days — Recommended)</option>
                  <option value="72">72 Hours Prior (3 Days)</option>
                  <option value="168">168 Hours Prior (1 Week)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Case & Practice Workflow Notifications */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-[#D9D6CF]/60 pb-3">
            <h3 className="font-serif font-bold text-base text-[#06244B] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#06244B]" />
              <span>Practice &amp; Internal Workflow Notifications</span>
            </h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Alerts for ethical conflict reviews, billing supervisor queue updates, and client portal activity.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Conflict Check Clearance Alerts */}
            <div className="flex items-center justify-between p-3.5 rounded bg-[#F5F0E5]/60 border border-[#D9D6CF] hover:bg-[#F5F0E5]/80 transition-colors">
              <div className="space-y-0.5 pr-4">
                <span className="font-bold text-[#06244B] text-sm block">Conflict Check Clearance Alerts</span>
                <span className="text-[#667085] block">
                  Notify submitting staff member when Utah RPC 1.7 conflict check outcome is resolved or flagged.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formState.conflictCheckNotices}
                onChange={() => handleToggle('conflictCheckNotices')}
                disabled={isSaving || loading}
                className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
              />
            </div>

            {/* Time Approval Queue Notifications */}
            <div className="flex items-center justify-between p-3.5 rounded bg-[#F5F0E5]/60 border border-[#D9D6CF] hover:bg-[#F5F0E5]/80 transition-colors">
              <div className="space-y-0.5 pr-4">
                <span className="font-bold text-[#06244B] text-sm block">Time Approval Queue Notifications</span>
                <span className="text-[#667085] block">
                  Alert billing partners and supervisors when submitted time entries require approval before invoicing.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formState.timeApprovalAlerts}
                onChange={() => handleToggle('timeApprovalAlerts')}
                disabled={isSaving || loading}
                className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
              />
            </div>

            {/* Daily Practice Digest Email */}
            <div className="flex items-center justify-between p-3.5 rounded bg-[#F5F0E5]/60 border border-[#D9D6CF] hover:bg-[#F5F0E5]/80 transition-colors">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#06244B] text-sm">Daily Morning Practice Digest</span>
                  {!gatewayStatus.emailConfigured && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                      In-App Center
                    </span>
                  )}
                </div>
                <span className="text-[#667085] block">
                  Compile daily summary of morning tasks, court conferences, and unreviewed time entries at 8:00 AM MT.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formState.dailyDigestEmail}
                onChange={() => handleToggle('dailyDigestEmail')}
                disabled={isSaving || loading}
                className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
              />
            </div>

            {/* Client Message Notification */}
            <div className="flex items-center justify-between p-3.5 rounded bg-[#F5F0E5]/60 border border-[#D9D6CF] hover:bg-[#F5F0E5]/80 transition-colors">
              <div className="space-y-0.5 pr-4">
                <span className="font-bold text-[#06244B] text-sm block">Client Portal &amp; Direct Message Alerts</span>
                <span className="text-[#667085] block">
                  Instant badge notifications when a client uploads discovery documents or submits a portal message.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formState.clientMessageNotification}
                onChange={() => handleToggle('clientMessageNotification')}
                disabled={isSaving || loading}
                className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#D9D6CF]">
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
            {isSaving ? 'Saving Preferences...' : 'Save Notification Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
}

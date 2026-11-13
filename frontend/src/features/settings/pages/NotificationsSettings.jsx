import React, { useState } from 'react';
import { Bell, Mail, Smartphone, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export function NotificationsSettings() {
  const { addToast } = useToast();

  const [settings, setSettings] = useState({
    courtDeadlineEmail: true,
    courtDeadlineSms: true,
    courtDeadlineLeadTime: '48',
    timeApprovalAlerts: true,
    conflictCheckNotices: true,
    dailyDigestEmail: false,
    clientMessageNotification: true,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Notification preferences successfully saved.', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification &amp; Alert Settings"
        subtitle="Manage email, in-app badges, and SMS alerts for court appearances, impending discovery deadlines, and partner approvals."
        breadcrumbs={[{ label: 'Reports & Settings', to: '/settings/users' }, { label: 'Notifications' }]}
      />

      <form onSubmit={handleSave} className="bg-white p-6 rounded border border-[#D9D6CF] shadow-subtle space-y-6">
        <div className="border-b border-[#D9D6CF]/60 pb-3">
          <h3 className="font-serif font-bold text-base text-[#06244B]">
            Court Deadlines &amp; Malpractice Alert Protocol
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">High-priority alerts for trial appearances, motions, and discovery cutoffs.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded bg-[#F5F0E5]/60 border border-[#D9D6CF]">
            <div>
              <span className="font-bold text-[#06244B] block text-sm">Court Appearance Email Reminders</span>
              <span className="text-[#667085]">Notify lead counsel and assigned paralegal of scheduled hearings.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.courtDeadlineEmail}
              onChange={() => handleToggle('courtDeadlineEmail')}
              className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-[#F5F0E5]/60 border border-[#D9D6CF]">
            <div>
              <span className="font-bold text-[#06244B] block text-sm">Urgent Court SMS Alerts</span>
              <span className="text-[#667085]">Dispatch text alerts to attorney mobile device for hearings within 24 hours.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.courtDeadlineSms}
              onChange={() => handleToggle('courtDeadlineSms')}
              className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-[#F5F0E5]/60 border border-[#D9D6CF]">
            <div>
              <span className="font-bold text-[#06244B] block text-sm">Conflict Check Clearance Alerts</span>
              <span className="text-[#667085]">Notify submitting staff member when conflict check outcome is recorded.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.conflictCheckNotices}
              onChange={() => handleToggle('conflictCheckNotices')}
              className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-[#F5F0E5]/60 border border-[#D9D6CF]">
            <div>
              <span className="font-bold text-[#06244B] block text-sm">Time Approval Queue Notifications</span>
              <span className="text-[#667085]">Send daily digest to billing partners of unapproved submitted time entries.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.timeApprovalAlerts}
              onChange={() => handleToggle('timeApprovalAlerts')}
              className="w-4 h-4 rounded text-[#A4432B] focus:ring-[#A4432B] cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#D9D6CF]">
          <Button type="submit" variant="primary" size="sm">
            Save Notification Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}


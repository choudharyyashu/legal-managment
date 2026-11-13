import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  UserCheck,
  Shield,
  Stethoscope,
  Briefcase,
  FileText,
  DollarSign,
  Calculator,
  ChevronRight,
  FolderOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const PI_NAV_ITEMS = [
  { label: 'PI Dashboard', path: '/personal-injury/dashboard', icon: LayoutDashboard },
  { label: 'Incident & Liability', path: '/personal-injury/incident-liability', icon: ShieldAlert },
  { label: 'Client & Damages', path: '/personal-injury/client-damages', icon: UserCheck },
  { label: 'Insurance Tracking', path: '/personal-injury/insurance', icon: Shield },
  { label: 'Medical Treatment & Records', path: '/personal-injury/medical-treatment', icon: Stethoscope },
  { label: 'Vendor Assignments', path: '/personal-injury/vendor-assignments', icon: Briefcase },
  { label: 'Demand Packages', path: '/personal-injury/demand-packages', icon: FileText },
  { label: 'Lien Register', path: '/personal-injury/lien-register', icon: DollarSign },
  { label: 'Settlement Calculator', path: '/personal-injury/settlement-calculator', icon: Calculator },
];

export function PINavigationHeader({
  activeCaseId,
  onCaseChange,
  cases = [],
  title,
  subtitle,
  actions
}) {
  const location = useLocation();

  const selectedCase = cases.find(c => c.id === activeCaseId) || cases[0];

  return (
    <div className="mb-6 space-y-4">
      {/* Top Banner & Context Bar */}
      <div className="bg-[#06244B] text-white rounded-xl p-5 shadow-sm border border-[#0B356D]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold tracking-wider uppercase text-slate-300 font-mono">
              <span className="whitespace-nowrap">Specialty Practice</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#A4432B] shrink-0" />
              <span className="text-white">Personal Injury &amp; Wrongful Death</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              {title || 'Personal Injury Workspace'}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Quick Case Switcher & Action Area */}
          <div className="flex flex-wrap items-center gap-2.5 xl:justify-end shrink-0">
            {cases.length > 0 && onCaseChange && (
              <div className="flex items-center gap-2 bg-[#041833] border border-[#0B356D] rounded-lg px-3 py-2 text-xs text-[#F5F0E5]">
                <FolderOpen className="w-4 h-4 text-[#A4432B]" />
                <span className="font-semibold text-slate-300">Active PI Matter:</span>
                <select
                  value={activeCaseId || ''}
                  onChange={(e) => onCaseChange(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1 max-w-[210px] truncate"
                >
                  <option value="ALL" className="bg-[#06244B] text-white">All Active PI Matters ({cases.length})</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#06244B] text-white">
                      {c.matterNumber} – {c.clientName} ({c.accidentType?.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>
        </div>

        {/* Selected Matter Quick Metadata Strip */}
        {selectedCase && activeCaseId !== 'ALL' && (
          <div className="mt-4 pt-3 border-t border-[#0B356D]/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block">Lead Matter:</span>
              <span className="font-semibold text-white truncate block">{selectedCase.matterTitle}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Accident Date &amp; Location:</span>
              <span className="font-semibold text-white truncate block">{selectedCase.incidentDate} • {selectedCase.incidentLocation?.split(',')[0]}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Case Status:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#A4432B] text-white mt-0.5">
                {selectedCase.status}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Utah SoL Bar Date:</span>
              <span className="font-semibold text-amber-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {selectedCase.statuteOfLimitations}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 9 Dedicated Navigation Tabs */}
      <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm p-1.5">
        <nav className="flex flex-wrap items-center gap-1">
          {PI_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-150 ${isActive
                    ? 'bg-[#06244B] text-white shadow-sm'
                    : 'text-[#667085] hover:text-[#06244B] hover:bg-slate-100'
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#A4432B]' : 'text-[#667085]'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}


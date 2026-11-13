import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Scale,
  LayoutDashboard,
  FileCheck2,
  Send,
  Calendar,
  Search,
  BookOpen,
  Briefcase
} from 'lucide-react';

export function LitigationNavigationHeader({ activeCase, cases = [], onSelectCase }) {
  const navTabs = [
    { label: 'Litigation Dashboard', to: '/litigation/dashboard', icon: LayoutDashboard },
    { label: 'Case Assessment & Issues Matrix', to: '/litigation/assessment', icon: FileCheck2 },
    { label: 'Pleadings & Party Service', to: '/litigation/pleadings-service', icon: Send },
    { label: 'Court Events & Rule 6 Scheduling', to: '/litigation/scheduling', icon: Calendar },
    { label: 'Discovery & Privilege Log', to: '/litigation/discovery', icon: Search },
    { label: 'Trial Notebook & Enforcement', to: '/litigation/trial', icon: BookOpen },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#D9D6CF] shadow-sm mb-6 overflow-hidden">
      {/* Top Banner with Active Case Selector */}
      <div className="p-4 bg-[#06244B] text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg text-amber-300 shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-base text-white">
                Civil &amp; Commercial Litigation Workspace
              </h2>
              <span className="text-[10px] font-mono font-bold bg-[#A4432B] px-2 py-0.5 rounded text-white uppercase">
                URCP Rule 1-65A
              </span>
            </div>
            <p className="text-xs text-slate-300">
              State of Utah Third Judicial District &amp; U.S. District Court • Sections 3–8 Architectural Blueprint
            </p>
          </div>
        </div>

        {cases.length > 0 && activeCase && (
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-lg border border-white/20">
            <span className="text-xs text-amber-200 font-semibold pl-2">Active Docket:</span>
            <select
              value={activeCase.id}
              onChange={(e) => {
                const found = cases.find(c => c.id === e.target.value);
                if (found && onSelectCase) onSelectCase(found);
              }}
              className="text-xs font-mono font-bold bg-[#06244B] text-white border-0 focus:ring-0 p-1 rounded cursor-pointer max-w-xs truncate"
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} — {c.caseTitle}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 px-4 bg-[#F5F0E5] border-b border-[#D9D6CF] overflow-x-auto text-xs">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/litigation/dashboard'}
              className={({ isActive }) =>
                `py-3 px-3.5 font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#A4432B] text-[#A4432B] bg-white shadow-sm'
                    : 'border-transparent text-[#667085] hover:text-[#06244B] hover:bg-white/40'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}


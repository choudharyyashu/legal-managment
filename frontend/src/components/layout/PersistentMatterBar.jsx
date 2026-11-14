import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FolderOpen,
  FileText,
  CheckSquare,
  Clock,
  CreditCard,
  ShieldAlert,
  Shield,
  Stethoscope,
  Building,
  Calculator,
  ChevronDown,
  X,
  Scale,
  Layers,
  Globe,
  Landmark,
  User,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useMatters } from '../../context/MatterContext';

export function PersistentMatterBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeMatter, matters, setActiveMatter, clearActiveMatter } = useMatters();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');
  const switcherRef = useRef(null);

  // Close switcher on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setIsSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredMatters = matters.filter((m) => {
    if (!switcherSearch.trim()) return true;
    const q = switcherSearch.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.matterNumber.toLowerCase().includes(q) ||
      m.clientName.toLowerCase().includes(q) ||
      m.practiceAreaName.toLowerCase().includes(q)
    );
  });

  const isPI = activeMatter?.practiceAreaName?.toLowerCase().includes('personal injury') ||
    activeMatter?.practiceAreaName?.toLowerCase().includes('wrongful death') ||
    activeMatter?.practiceAreaId === 'pa-pi';

  const isBankruptcy = activeMatter?.practiceAreaName?.toLowerCase().includes('bankruptcy') ||
    activeMatter?.practiceAreaId === 'pa-bankruptcy';

  const isImmigration = activeMatter?.practiceAreaName?.toLowerCase().includes('immigration') ||
    activeMatter?.practiceAreaId === 'pa-immigration';

  // Navigation items scoped to the active matter context
  const contextualNavItems = activeMatter ? [
    {
      id: 'docket',
      label: 'Matter Docket',
      to: `/matters/${activeMatter.id}`,
      icon: FolderOpen,
    },
    ...(isPI ? [
      { id: 'pi-incident', label: 'Incident & Liability', to: '/personal-injury/incident-liability', icon: ShieldAlert },
      { id: 'pi-insurance', label: 'Insurance Tracking', to: '/personal-injury/insurance', icon: Shield },
      { id: 'pi-medical', label: 'Medical Treatment', to: '/personal-injury/medical-treatment', icon: Stethoscope },
      { id: 'pi-vendors', label: 'Vendor Assignments', to: '/personal-injury/vendor-assignments', icon: Building },
      { id: 'pi-demands', label: 'Demand Packages', to: '/personal-injury/demand-packages', icon: FileText },
      { id: 'pi-liens', label: 'Lien Register', to: '/personal-injury/lien-register', icon: Building },
      { id: 'pi-settlement', label: 'Settlement Calculator', to: '/personal-injury/settlement-calculator', icon: Calculator },
    ] : []),
    ...(isBankruptcy ? [
      { id: 'bk-cases', label: 'Bankruptcy Docket', to: '/bankruptcy/cases', icon: Landmark },
      { id: 'bk-schedules', label: 'Schedules Ledger', to: '/bankruptcy/schedules', icon: Layers },
      { id: 'bk-means', label: 'Means Test', to: '/bankruptcy/means-test', icon: Calculator },
      { id: 'bk-exemptions', label: 'Utah Exemptions', to: '/bankruptcy/exemptions', icon: Scale },
      { id: 'bk-plan', label: 'Chapter 13 Plan', to: '/bankruptcy/plan', icon: FileText },
    ] : []),
    ...(isImmigration ? [
      { id: 'im-cases', label: 'Immigration Docket', to: '/immigration/cases', icon: Globe },
      { id: 'im-parties', label: 'Parties Directory', to: '/immigration/parties', icon: User },
      { id: 'im-receipts', label: 'USCIS Receipts', to: '/immigration/receipts', icon: FileText },
    ] : []),
    {
      id: 'documents',
      label: 'Case Documents',
      to: '/documents',
      icon: FileText,
    },
    {
      id: 'tasks',
      label: 'Matter Tasks',
      to: '/tasks/mine',
      icon: CheckSquare,
    },
    {
      id: 'time',
      label: 'Time Entries',
      to: '/time',
      icon: Clock,
    },
    {
      id: 'billing',
      label: 'Billing & Ledgers',
      to: '/billing',
      icon: CreditCard,
    },
  ] : [];

  // ==========================================
  // STATE A: ALL-MATTERS MODE (Firm-Wide View)
  // ==========================================
  if (!activeMatter) {
    return (
      <div className="bg-[#FAF8F5] border-b border-[#E4E7EC] px-3.5 sm:px-6 lg:px-8 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          {/* Mode Description */}
          <div className="flex items-center gap-2 text-[#475467]">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#E4E7EC] text-[#344054] tracking-wide uppercase font-mono">
              <Globe className="w-3 h-3 text-[#A4432B]" />
              All-Matters Mode
            </span>
            <span className="hidden sm:inline text-[#98A2B3]">|</span>
            <span className="text-[#475467] font-medium hidden md:inline">
              Firm-wide aggregated view. Select a specific matter to lock client context across all modules.
            </span>
          </div>

          {/* Quick Select Matter Dropdown */}
          <div className="relative w-full sm:w-auto" ref={switcherRef}>
            <button
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="w-full sm:w-auto inline-flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-[#D0D5DD] hover:border-[#06244B] rounded-lg text-xs font-semibold text-[#06244B] shadow-sm hover:bg-[#F9FAFB] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-[#A4432B]" />
                <span>Select Matter Workspace...</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#667085]" />
            </button>

            {isSwitcherOpen && (
              <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white border border-[#D0D5DD] rounded-xl shadow-xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2.5 bg-[#F8F9FA] border-b border-[#EAECF0]">
                  <input
                    type="text"
                    value={switcherSearch}
                    onChange={(e) => setSwitcherSearch(e.target.value)}
                    placeholder="Search matters by title, ID, or client..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D0D5DD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#06244B]"
                    autoFocus
                  />
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#EAECF0]">
                  {filteredMatters.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#667085]">
                      No matters found matching your search.
                    </div>
                  ) : (
                    filteredMatters.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveMatter(m);
                          setIsSwitcherOpen(false);
                          setSwitcherSearch('');
                          navigate(`/matters/${m.id}`);
                        }}
                        className="w-full text-left p-2.5 hover:bg-[#F5F0E5] transition-colors cursor-pointer group block"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#06244B] group-hover:text-[#A4432B] truncate block">
                            {m.title}
                          </span>
                          <span className="text-[10px] font-mono text-[#A4432B] font-bold shrink-0 ml-2">
                            {m.matterNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#667085]">
                          <span>Client: <strong className="text-[#344054]">{m.clientName}</strong></span>
                          <span>•</span>
                          <span className="truncate">{m.practiceAreaName}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-2 bg-[#F8F9FA] border-t border-[#EAECF0] text-center">
                  <button
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      navigate('/matters');
                    }}
                    className="text-[11px] font-semibold text-[#06244B] hover:text-[#A4432B] inline-flex items-center gap-1 cursor-pointer"
                  >
                    View All Matters Directory <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATE B: SINGLE-MATTER ACTIVE CONTEXT MODE
  // ==========================================
  return (
    <div className="bg-[#FDFBF7] border-b border-[#D9D6CF] shadow-xs relative z-30 transition-all">
      {/* Top Banner Accent Line */}
      <div className="h-1 bg-gradient-to-r from-[#06244B] via-[#A4432B] to-[#06244B]" />

      <div className="px-3.5 sm:px-6 lg:px-8 py-3 max-w-7xl mx-auto space-y-2.5">
        {/* Row 1: Active Matter Metadata & Action Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left Metadata Stack */}
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            {/* Context Badge with Status Pulse */}
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#06244B] text-white text-[11px] font-bold tracking-wider uppercase font-mono shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Context</span>
            </div>

            {/* Matter Info Header */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="font-serif font-bold text-base sm:text-lg text-[#06244B] tracking-tight truncate max-w-xl">
                  {activeMatter.title}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#D9D6CF] text-[#A4432B]">
                  {activeMatter.matterNumber}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#F5F0E5] border border-[#E4E7EC] text-[#06244B] font-medium">
                  {activeMatter.practiceAreaName}
                </span>
              </div>

              {/* Subtitle Details: Client, Lead Counsel, Billing */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#667085] mt-0.5">
                <span>
                  Client: <strong className="text-[#06244B] font-semibold">{activeMatter.clientName}</strong>
                </span>
                <span>•</span>
                <span>
                  Lead: <strong className="text-[#344054] font-medium">{activeMatter.responsibleAttorneyName}</strong>
                </span>
                <span>•</span>
                <span>
                  Status: <strong className="text-emerald-700 font-medium">{activeMatter.status}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Switch Matter & Clear Context */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center" ref={switcherRef}>
            {/* Quick Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#D0D5DD] hover:border-[#06244B] text-[#06244B] shadow-xs hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                title="Switch active matter workspace"
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#A4432B]" />
                <span className="hidden sm:inline">Switch Matter</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#667085]" />
              </button>

              {isSwitcherOpen && (
                <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white border border-[#D0D5DD] rounded-xl shadow-xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-2.5 bg-[#F8F9FA] border-b border-[#EAECF0]">
                    <input
                      type="text"
                      value={switcherSearch}
                      onChange={(e) => setSwitcherSearch(e.target.value)}
                      placeholder="Search matters by title, ID, or client..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D0D5DD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#06244B]"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-[#EAECF0]">
                    {filteredMatters.map((m) => {
                      const isCurrent = m.id === activeMatter.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setActiveMatter(m);
                            setIsSwitcherOpen(false);
                            setSwitcherSearch('');
                            navigate(`/matters/${m.id}`);
                          }}
                          className={`w-full text-left p-2.5 transition-colors cursor-pointer group block ${
                            isCurrent ? 'bg-[#F5F0E5]/70 border-l-4 border-l-[#A4432B]' : 'hover:bg-[#F9FAFB]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-[#06244B] group-hover:text-[#A4432B] truncate block">
                              {m.title}
                            </span>
                            <span className="text-[10px] font-mono text-[#A4432B] font-bold shrink-0 ml-2">
                              {m.matterNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#667085]">
                            <span>Client: <strong className="text-[#344054]">{m.clientName}</strong></span>
                            <span>•</span>
                            <span className="truncate">{m.practiceAreaName}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-2 bg-[#F8F9FA] border-t border-[#EAECF0] text-center">
                    <button
                      onClick={() => {
                        setIsSwitcherOpen(false);
                        navigate('/matters');
                      }}
                      className="text-[11px] font-semibold text-[#06244B] hover:text-[#A4432B] inline-flex items-center gap-1 cursor-pointer"
                    >
                      View All Matters Directory <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Clear Matter Context Button (Returns to Firm-Wide Mode) */}
            <button
              onClick={() => {
                clearActiveMatter();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#F5F0E5] hover:bg-[#EAE4D6] border border-[#D9D6CF] text-[#667085] hover:text-[#B42318] transition-colors cursor-pointer"
              title="Exit single-matter context and return to firm-wide All-Matters view"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Context</span>
            </button>
          </div>
        </div>

        {/* Row 2: Horizontal Contextual Navigation Pills */}
        <div className="pt-1 overflow-x-auto scrollbar-none flex items-center gap-1.5 -mx-1 px-1">
          {contextualNavItems.map((item) => {
            const Icon = item.icon;
            const isDocket = item.id === 'docket';
            const isActive = isDocket
              ? location.pathname === item.to || location.pathname === `/matters/${activeMatter.id}`
              : location.pathname === item.to || location.pathname.startsWith(item.to + '/');

            return (
              <NavLink
                key={item.id}
                to={item.to}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#06244B] text-white shadow-xs font-semibold'
                    : 'bg-white hover:bg-[#F5F0E5] text-[#475467] hover:text-[#06244B] border border-[#EAECF0]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#A4432B]' : 'text-[#667085]'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
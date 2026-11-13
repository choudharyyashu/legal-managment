import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  Briefcase,
  Calendar,
  Clock,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle2,
  Building,
  Database,
  FileText,
  Users,
  Menu,
  X,
  Layers,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  SlidersHorizontal,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { PRACTICE_AREAS } from '../../../data/practiceAreas';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const coreModules = [
    {
      number: '01',
      title: '1. Executive Dashboard',
      description: 'Centralized command center displaying active clients, pre-trial matters, pending court deadlines, recent client communications, and real-time partner workload stats.',
      icon: Scale,
      badge: 'Live KPI Feeds',
      highlights: ['Active Case Dockets', 'Court Deadlines & Hearings', 'Pending Partner Approvals', 'Recent Client Messages'],
    },
    {
      number: '02',
      title: '2. Clients & Matters Docket',
      description: 'Master matter files supporting Utah RPC 1.7 adverse conflict checks, pleadings vault, multi-staff assignments, and privileged work-product separation.',
      icon: Briefcase,
      badge: 'RPC 1.7 Clearance',
      highlights: ['Client & Contact Vault', 'All 9 Practice Area Dockets', 'Pleadings & File Uploads', 'Client Portal Simulation'],
    },
    {
      number: '03',
      title: '3. Tasks & Master Calendar',
      description: 'Litigation activity hub coordinating court Rule 26 discovery cutoffs, personal and team task queues, daily time review, and automated workflow checklists.',
      icon: Calendar,
      badge: 'Rule 26 Tracking',
      highlights: ['My Tasks & Team Tasks', 'Master Court Calendar', 'Daily Time Review Grid', 'AI Suggested Billing Entries'],
    },
    {
      number: '04',
      title: '4. Billing & CosmoLex Bridge',
      description: 'Comprehensive financial tracking supporting hourly, flat-fee, and contingency billing models with automated export of approved hours directly into CosmoLex.',
      icon: CreditCard,
      badge: 'Official Accounting Sync',
      highlights: ['Billable Hours & Expenses', 'Formal Client Invoices', 'CosmoLex Batch Transfer', 'Operating Account Overview'],
    },
    {
      number: '05',
      title: '5. Reports & Governance',
      description: 'Executive governance layer providing attorney realization reports, 5-role permissions administration, firm branding customization, and security audit trails.',
      icon: SlidersHorizontal,
      badge: 'Role-Based Access',
      highlights: ['Staff Realization Reports', '50+ User Management', 'Granular Role Permissions', 'Security & Audit Logging'],
    },
  ];

  const userRoles = [
    {
      title: 'Super Admin',
      person: 'Eleanor Heugly, Esq.',
      subtitle: 'Managing Partner',
      scope: 'Unrestricted governance across all matters, financial ledgers, user credentials, and security policies.',
    },
    {
      title: 'Attorney',
      person: 'Thomas Bludworth, Esq.',
      subtitle: 'Senior Litigation Partner',
      scope: 'Case docket leadership, client advisory, conflict review, and billable time entry submission.',
    },
    {
      title: 'Paralegal / Staff',
      person: 'Marcus Vance',
      subtitle: 'Senior Litigation Paralegal',
      scope: 'Pleading filings, discovery index management, court deadline tracking, and task execution.',
    },
    {
      title: 'Billing Staff',
      person: 'Rachel Adams',
      subtitle: 'Billing & Accounting Director',
      scope: 'Invoice preparation, disbursements, fee accounting, and batch export to CosmoLex ledger.',
    },
    {
      title: 'Practice Supervisor',
      person: 'David Sterling, Esq.',
      subtitle: 'Practice Supervisor & Of Counsel',
      scope: 'Team task monitoring, legal work-product oversight, and associate time review & approval.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E5] text-[#202A35] font-sans selection:bg-[#A4432B]/20 selection:text-[#06244B]">
      {/* 2. MAIN HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#06244B] border-b border-[#0B356D] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 rounded bg-[#A4432B] flex items-center justify-center font-serif font-bold text-white text-xl shadow-sm flex-shrink-0">
              HB
            </div>
            <div>
              <span className="font-serif font-bold text-base sm:text-lg tracking-wider text-[#F5F0E5] block leading-tight">
                HEUGLY &amp; BLUDWORTH
              </span>
              <span className="text-[10px] tracking-widest text-[#B8C0C4] font-semibold uppercase block mt-0.5">
                ATTORNEYS AT LAW • LEGAL PRACTICE SAAS
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-medium text-[#B8C0C4]">
            <a href="#modules" className="hover:text-white transition-colors">5 Core Modules</a>
            <a href="#practice-areas" className="hover:text-white transition-colors">9 Practice Areas</a>
            <a href="#roles" className="hover:text-white transition-colors">Role Governance</a>
            <a href="#compliance" className="hover:text-white transition-colors">Compliance &amp; CosmoLex</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={() => navigate('/dashboard')}
                className="font-semibold shadow-xs"
              >
                Go to Dashboard ({currentUser.name.split(',')[0]})
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={Lock}
                onClick={() => navigate('/login')}
                className="font-semibold shadow-xs"
              >
                Sign In to Legal Portal
              </Button>
            )}
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded text-[#B8C0C4] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#041833] border-b border-[#0B356D] px-4 py-4 space-y-3 text-sm text-[#F5F0E5]">
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#B8C0C4] hover:text-white"
            >
              5 Core Modules
            </a>
            <a
              href="#practice-areas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#B8C0C4] hover:text-white"
            >
              9 Practice Areas
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#B8C0C4] hover:text-white"
            >
              Role Governance
            </a>
            <a
              href="#compliance"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#B8C0C4] hover:text-white"
            >
              Compliance &amp; CosmoLex
            </a>
            <div className="pt-2 border-t border-[#0B356D]">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Sign In to Legal Portal
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#06244B] text-white pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#0B356D]">
        {/* Subtle background decorative shapes */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/[0.03] pointer-events-none" />
        <div className="absolute left-1/3 -bottom-32 w-80 h-80 rounded-full bg-[#A4432B]/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-[#F5F0E5] font-medium backdrop-blur-xs">
                <Scale className="w-3.5 h-3.5 text-[#A4432B]" />
                <span>Integrated Practice &amp; Litigation Management SaaS</span>
              </div>

              <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#F5F0E5] leading-[1.15] tracking-tight">
                Precision Legal Practice Management Engineered for Utah Litigators.
              </h1>

              <p className="text-sm sm:text-base text-[#B8C0C4] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                The centralized operational portal for <strong>Heugly &amp; Bludworth</strong>: uniting active case dockets across 9 practice areas, automated Utah RPC 1.7 conflict clearance, master court calendaring, and seamless CosmoLex accounting ledger synchronization.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-7 py-3 text-sm font-semibold shadow-md"
                >
                  Access Firm Workspace
                </Button>

                <a
                  href="#practice-areas"
                  className="w-full sm:w-auto px-5 py-3 rounded border border-white/20 hover:border-white/40 hover:bg-white/5 text-xs font-semibold text-[#F5F0E5] text-center transition-colors"
                >
                  Explore 9 Practice Areas
                </a>
              </div>

              {/* Trust Badges Row */}
              <div className="pt-6 border-t border-[#0B356D] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div>
                  <span className="block font-serif text-xl sm:text-2xl font-bold text-[#F5F0E5]">9 Areas</span>
                  <span className="text-[11px] text-[#B8C0C4]">Practice Dockets</span>
                </div>
                <div>
                  <span className="block font-serif text-xl sm:text-2xl font-bold text-[#F5F0E5]">RPC 1.7</span>
                  <span className="text-[11px] text-[#B8C0C4]">Conflict Clearance</span>
                </div>
                <div>
                  <span className="block font-serif text-xl sm:text-2xl font-bold text-[#F5F0E5]">CosmoLex</span>
                  <span className="text-[11px] text-[#B8C0C4]">Official Bridge</span>
                </div>
                <div>
                  <span className="block font-serif text-xl sm:text-2xl font-bold text-[#F5F0E5]">5 Roles</span>
                  <span className="text-[11px] text-[#B8C0C4]">RBAC Security</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-[#041833] rounded-xl border border-[#0B356D] shadow-2xl p-5 sm:p-6 text-xs text-[#F5F0E5] space-y-4">
                {/* Window Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#0B356D]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-serif text-xs font-semibold text-[#F5F0E5]">Firm Live Docket</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800/60">
                    STATUS: SECURE
                  </span>
                </div>

                {/* KPI Preview Mini-Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#B8C0C4] block uppercase">Active Matters</span>
                    <span className="font-serif text-xl font-bold text-[#F5F0E5]">7 Cases</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Pre-trial &amp; litigation</span>
                  </div>
                  <div className="p-3 rounded bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#B8C0C4] block uppercase">Total Clients</span>
                    <span className="font-serif text-xl font-bold text-[#F5F0E5]">7 Roster</span>
                    <span className="text-[10px] text-[#A4432B] block mt-0.5">Utah Third District</span>
                  </div>
                </div>

                {/* Active Docket Item */}
                <div className="p-3 rounded bg-white/[0.03] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F5F0E5] truncate">Wasatch Logistics v. Interstate</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#A4432B] text-white text-[9px] font-bold">CIV-2026-089</span>
                  </div>
                  <p className="text-[11px] text-[#B8C0C4] line-clamp-2">
                    Commercial carrier cargo spoilage dispute. Expert fact discovery cutoff in 48 hours.
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-[#B8C0C4]">
                    <span>Lead: Thomas Bludworth, Esq.</span>
                    <span className="text-emerald-400 font-semibold">Conflict Cleared</span>
                  </div>
                </div>

                {/* CosmoLex Sync Status Indicator */}
                <div className="p-2.5 rounded bg-[#06244B] border border-[#0B356D] flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-[#A4432B]" />
                    <span className="text-[#F5F0E5]">CosmoLex Bridge</span>
                  </div>
                  <span className="text-[#287A55] font-semibold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Synchronized
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center text-xs font-semibold"
                  onClick={() => navigate('/login')}
                >
                  Enter Portal &amp; Test Live Demo &rarr;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 5 CORE MODULES SHOWCASE (MATCHING CLIENT'S 5 MAIN MENUS) */}
      <section id="modules" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A4432B] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>5 Primary Navigation Modules</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#06244B]">
            Engineered Around the Firm's Five Core Workflow Pillars
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            Strictly built according to Heugly &amp; Bludworth's MVP specifications: 5 primary menus, one streamlined executive dashboard, and role-based permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-[#D9D6CF] shadow-subtle p-6 space-y-4 hover:border-[#06244B]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded bg-[#F5F0E5] text-[#06244B] flex items-center justify-center border border-[#D9D6CF]">
                      <Icon className="w-5 h-5 text-[#A4432B]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A4432B] px-2 py-0.5 rounded bg-[#A4432B]/10">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#06244B]">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-[#667085] leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D9D6CF]/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block mb-1">
                    Included Features:
                  </span>
                  {mod.highlights.map((item, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2 text-xs text-[#202A35]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#287A55] flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* 6th Card: Utah RPC & CosmoLex Assurance */}
          <div className="bg-[#06244B] text-white rounded-lg border border-[#0B356D] shadow-subtle p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded bg-[#A4432B] text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#F5F0E5]">
                Utah Bar &amp; Ethics Guardrails
              </h3>
              <p className="text-xs text-[#B8C0C4] leading-relaxed">
                Automated guardrails protecting confidential attorney work product under Utah RPC 1.6 and preventing adverse representations under Utah RPC 1.7.
              </p>
            </div>

            <div className="pt-4 border-t border-[#0B356D] space-y-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center text-xs font-semibold"
                onClick={() => navigate('/login')}
              >
                Log In to Workspace &rarr;
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ALL 9 PRACTICE AREAS DOCKET SHOWCASE */}
      <section id="practice-areas" className="py-16 sm:py-24 bg-white border-y border-[#D9D6CF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A4432B] uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Full Practice Area Support</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#06244B]">
              Comprehensive Dockets for All Nine Legal Practice Areas
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Every matter file in the system is custom-configured with billing models, court filing checklists, and document categories tailored to Utah law practice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {PRACTICE_AREAS.map((pa, idx) => (
              <div
                key={pa.id}
                className="p-5 rounded-lg border border-[#D9D6CF] bg-[#F5F0E5]/30 hover:bg-[#F5F0E5] transition-colors space-y-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-[#D9D6CF] text-[#06244B]">
                    {pa.code}
                  </span>
                  <span className="text-[10px] text-[#667085] font-semibold uppercase">
                    Practice #{idx + 1}
                  </span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#06244B]">
                    {pa.name}
                  </h4>
                  <p className="text-xs text-[#667085] mt-1 leading-snug">
                    Dedicated litigation checklists, case dockets, and Utah district court deadline models.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#D9D6CF]/50 flex items-center justify-between text-[11px] font-medium text-[#A4432B]">
                  <span>Active Dockets Configured</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 5 USER ROLES & GOVERNANCE */}
      <section id="roles" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A4432B] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#06244B]">
            Five Client-Defined User Roles with Strict Ethical Boundaries
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            The software enforces granular permissions across menus, submenus, pages, and actions according to the law firm's strict hierarchy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {userRoles.map((role, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-[#D9D6CF] shadow-subtle p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-[#A4432B] uppercase tracking-wider block">
                  Role {idx + 1}
                </span>
                <h3 className="font-serif font-bold text-base text-[#06244B] mt-1">
                  {role.title}
                </h3>
                <p className="text-xs font-semibold text-[#202A35] mt-0.5">
                  {role.person}
                </p>
                <span className="text-[10px] text-[#667085] block">
                  {role.subtitle}
                </span>
                <p className="text-[11px] text-[#667085] mt-2.5 leading-relaxed">
                  {role.scope}
                </p>
              </div>

              <div className="pt-3 border-t border-[#D9D6CF]/60">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-center text-[11px] font-semibold text-[#06244B] hover:text-[#A4432B] hover:underline cursor-pointer"
                >
                  Test Role View &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. COMPLIANCE & COSMOLEX ASSURANCE BANNER */}
      <section id="compliance" className="py-16 bg-[#041833] text-white border-t border-[#0B356D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#06244B] rounded-xl border border-[#0B356D] p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#A4432B]/20 text-[#A4432B] text-xs font-bold uppercase tracking-wider">
                <Database className="w-3.5 h-3.5" />
                <span>CosmoLex Accounting Bridge</span>
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#F5F0E5]">
                CosmoLex Remains the Firm's Official Accounting System
              </h2>
              <p className="text-xs sm:text-sm text-[#B8C0C4] leading-relaxed">
                All approved billable hours and disbursements pass through audit approval before synchronization into CosmoLex general and client trust ledgers, keeping legal timekeeping and firm accounting perfectly aligned.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                icon={Lock}
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 font-semibold shadow-md"
              >
                Sign In to Legal Portal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-[#041833] text-[#B8C0C4] py-12 border-t border-[#0B356D] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Identity */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#A4432B] flex items-center justify-center font-serif font-bold text-white text-sm">
                  HB
                </div>
                <div>
                  <span className="font-serif font-bold text-sm tracking-wide text-[#F5F0E5] block">
                    HEUGLY &amp; BLUDWORTH
                  </span>
                  <span className="text-[10px] tracking-widest text-[#B8C0C4] uppercase block">
                    ATTORNEYS AT LAW
                  </span>
                </div>
              </div>
              <p className="text-[#667085] max-w-md text-xs leading-relaxed">
                Confidential legal practice management software engineered for litigation attorneys, court docket tracking, client conflict clearance, and CosmoLex financial synchronization.
              </p>
            </div>

            {/* Col 2: Practice Office */}
            <div className="space-y-2">
              <span className="font-serif font-bold text-[#F5F0E5] text-sm block">Firm Practice Office</span>
              <div className="space-y-1 text-xs text-[#B8C0C4]">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#A4432B] flex-shrink-0" />
                  <span>250 State Street, Suite 800, Salt Lake City, UT 84111</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#A4432B] flex-shrink-0" />
                  <span>(801) 555-0100</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#A4432B] flex-shrink-0" />
                  <span>contact@utahslawyers.com</span>
                </p>
              </div>
            </div>

            {/* Col 3: Portal Links */}
            <div className="space-y-2">
              <span className="font-serif font-bold text-[#F5F0E5] text-sm block">Legal SaaS Access</span>
              <ul className="space-y-1.5 text-xs text-[#B8C0C4]">
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">
                    Attorney &amp; Staff Login &rarr;
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/client-portal')} className="hover:text-white transition-colors cursor-pointer">
                    Client Portal Preview &rarr;
                  </button>
                </li>
                <li>
                  <a href="#compliance" className="hover:text-white transition-colors">
                    Utah RPC 1.6 &amp; 1.7 Clearance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#0B356D] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#667085]">
            <p>© 2026 HEUGLY &amp; BLUDWORTH, LLC. All Rights Reserved. Attorney Work Product.</p>
            <p>Protected by 256-Bit SSL Encryption • Utah Third Judicial District Court &amp; Bar Approved Standards</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


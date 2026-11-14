import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { RoleRoute } from '../components/layout/RoleRoute';

// Authentication
import { Login } from '../features/auth/pages/Login';

// Module 1: Dashboard
import { Dashboard } from '../features/dashboard/pages/Dashboard';

// Module 2: Clients & Matters
import { ClientsList } from '../features/clients/pages/ClientsList';
import { ClientDetails } from '../features/clients/pages/ClientDetails';
import { MattersList } from '../features/matters/pages/MattersList';
import { MatterDetails } from '../features/matters/pages/MatterDetails';
import { IntakeList } from '../features/intake/pages/IntakeList';
import { DocumentsList } from '../features/documents/pages/DocumentsList';
import { CommunicationsList } from '../features/communications/pages/CommunicationsList';
import { ClientPortalPreview } from '../features/clients/pages/ClientPortalPreview';

// Phase 2 Specialty Practice: Immigration (Docketwise Model)
import { ImmigrationCasesList } from '../features/immigration/pages/ImmigrationCasesList';
import { ImmigrationPartiesDirectory } from '../features/immigration/pages/ImmigrationPartiesDirectory';
import { ImmigrationFormLibrary } from '../features/immigration/pages/ImmigrationFormLibrary';
import { USCISReceiptTracker } from '../features/immigration/pages/USCISReceiptTracker';
import { MultilingualQuestionnaires } from '../features/immigration/pages/MultilingualQuestionnaires';

// Phase 2 Specialty Practice: Bankruptcy (Best Case / Clio Model)
import { BankruptcyCasesList } from '../features/bankruptcy/pages/BankruptcyCasesList';
import { BankruptcySchedulesLedger } from '../features/bankruptcy/pages/BankruptcySchedulesLedger';
import { MeansTestCalculator } from '../features/bankruptcy/pages/MeansTestCalculator';
import { UtahExemptionsTool } from '../features/bankruptcy/pages/UtahExemptionsTool';
import { Chapter13PlanCalculator } from '../features/bankruptcy/pages/Chapter13PlanCalculator';
import { CreditorMatrixGenerator } from '../features/bankruptcy/pages/CreditorMatrixGenerator';

// Specialty Practice: Personal Injury & Wrongful Death Workspace
import { PIDashboard } from '../features/personal-injury/pages/PIDashboard';
import { IncidentLiability } from '../features/personal-injury/pages/IncidentLiability';
import { ClientDamages } from '../features/personal-injury/pages/ClientDamages';
import { InsuranceManagement } from '../features/personal-injury/pages/InsuranceManagement';
import { MedicalTreatment } from '../features/personal-injury/pages/MedicalTreatment';
import { VendorAssignments } from '../features/personal-injury/pages/VendorAssignments';
import { DemandPackages } from '../features/personal-injury/pages/DemandPackages';
import { LienRegister } from '../features/personal-injury/pages/LienRegister';
import { SettlementCalculator as PISettlementCalculator } from '../features/personal-injury/pages/SettlementCalculator';

// Specialty Practice: Civil & Commercial Litigation Workspace (Sections 3-8)
import { LitigationDashboard } from '../features/litigation/pages/LitigationDashboard';
import { CaseAssessment } from '../features/litigation/pages/CaseAssessment';
import { PleadingsService } from '../features/litigation/pages/PleadingsService';
import { CourtScheduling } from '../features/litigation/pages/CourtScheduling';
import { DiscoveryManagement } from '../features/litigation/pages/DiscoveryManagement';
import { TrialNotebook } from '../features/litigation/pages/TrialNotebook';

// 5 Specialized Practice Workspaces (Sections 20-24)
import { ProbateWorkspace } from '../features/specialty-practices/probate/pages/ProbateWorkspace';
import { FamilyLawWorkspace } from '../features/specialty-practices/family-law/pages/FamilyLawWorkspace';
import { CriminalWorkspace } from '../features/specialty-practices/criminal/pages/CriminalWorkspace';
import { AppealsWorkspace } from '../features/specialty-practices/appeals/pages/AppealsWorkspace';
import { EvictionsWorkspace } from '../features/specialty-practices/evictions/pages/EvictionsWorkspace';

// Module 3: Tasks & Activities
import { MyTasks } from '../features/tasks/pages/MyTasks';
import { TeamTasks } from '../features/tasks/pages/TeamTasks';
import { CalendarPage } from '../features/calendar/pages/CalendarPage';
import { CourtDeadlines } from '../features/calendar/pages/CourtDeadlines';
import { TimeTracking } from '../features/time-tracking/pages/TimeTracking';
import { DailyTimeReview } from '../features/time-tracking/pages/DailyTimeReview';
import { TimeApprovals } from '../features/time-tracking/pages/TimeApprovals';
import { SuggestedBilling } from '../features/time-tracking/pages/SuggestedBilling';
import { WorkflowChecklists } from '../features/tasks/pages/WorkflowChecklists';

// Module 4: Billing & Accounting
import { BillingOverview } from '../features/billing/pages/BillingOverview';
import { BillableHours } from '../features/billing/pages/BillableHours';
import { ExpensesList } from '../features/billing/pages/ExpensesList';
import { InvoicesList } from '../features/billing/pages/InvoicesList';
import { PaymentRecords } from '../features/billing/pages/PaymentRecords';
import { BillingReports } from '../features/billing/pages/BillingReports';
import { OperatingAccount } from '../features/billing/pages/OperatingAccount';
import { TrustAccount } from '../features/billing/pages/TrustAccount';
import { ChartOfAccounts } from '../features/billing/pages/ChartOfAccounts';
import { GeneralLedgerView } from '../features/billing/pages/GeneralLedgerView';
import { ThreeWayReconciliation } from '../features/billing/pages/ThreeWayReconciliation';
import { SettlementCalculator } from '../features/billing/pages/SettlementCalculator';
import { CosmoLexSettings } from '../features/integrations/pages/CosmoLexSettings';

// Module 5: Reports & Settings
import { StaffReports } from '../features/reports/pages/StaffReports';
import { MatterReports } from '../features/reports/pages/MatterReports';
import { FinancialReports } from '../features/reports/pages/FinancialReports';
import { ComplianceMatrix } from '../features/reports/pages/ComplianceMatrix';
import { UserManagement } from '../features/settings/pages/UserManagement';
import { RolesPermissions } from '../features/settings/pages/RolesPermissions';
import { TemplatesSettings } from '../features/settings/pages/TemplatesSettings';
import { WorkflowManager } from '../features/settings/pages/WorkflowManager';
import { ExternalIntegrations } from '../features/settings/pages/ExternalIntegrations';
import { FirmBranding } from '../features/settings/pages/FirmBranding';
import { NotificationsSettings } from '../features/settings/pages/NotificationsSettings';
import { AuditLogs } from '../features/settings/pages/AuditLogs';
import { SecuritySettings } from '../features/settings/pages/SecuritySettings';
import { LandingPage } from '../features/landing/pages/LandingPage';

export const router = createBrowserRouter([
  // Public Landing Page (Root & /landing)
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/landing',
    element: <LandingPage />,
  },
  // Standalone Auth Route
  {
    path: '/login',
    element: <Login />,
  },
  // Authenticated Application Shell
  {
    element: <AppLayout />,
    children: [
      // Module 1
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      // Module 2: Clients & Matters
      {
        path: 'clients',
        element: <ClientsList />,
      },
      {
        path: 'clients/:clientId',
        element: <ClientDetails />,
      },
      {
        path: 'matters',
        element: <MattersList />,
      },
      {
        path: 'matters/:matterId',
        element: <MatterDetails />,
      },
      {
        path: 'intake',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal']}>
            <IntakeList />
          </RoleRoute>
        ),
      },
      {
        path: 'documents',
        element: <DocumentsList />,
      },
      {
        path: 'communications',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal']}>
            <CommunicationsList />
          </RoleRoute>
        ),
      },
      {
        path: 'client-portal',
        element: <ClientPortalPreview />,
      },
      // Phase 2: Specialty Practice - Immigration
      {
        path: 'immigration',
        element: <Navigate to="/immigration/cases" replace />,
      },
      {
        path: 'immigration/cases',
        element: <ImmigrationCasesList />,
      },
      {
        path: 'immigration/parties',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal']}>
            <ImmigrationPartiesDirectory />
          </RoleRoute>
        ),
      },
      {
        path: 'immigration/forms',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal']}>
            <ImmigrationFormLibrary />
          </RoleRoute>
        ),
      },
      {
        path: 'immigration/receipts',
        element: <USCISReceiptTracker />,
      },
      {
        path: 'immigration/questionnaires',
        element: <MultilingualQuestionnaires />,
      },
      // Phase 2: Specialty Practice - Bankruptcy
      {
        path: 'bankruptcy',
        element: <Navigate to="/bankruptcy/cases" replace />,
      },
      {
        path: 'bankruptcy/cases',
        element: <BankruptcyCasesList />,
      },
      {
        path: 'bankruptcy/schedules',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal', 'billing']}>
            <BankruptcySchedulesLedger />
          </RoleRoute>
        ),
      },
      {
        path: 'bankruptcy/means-test',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal']}>
            <MeansTestCalculator />
          </RoleRoute>
        ),
      },
      {
        path: 'bankruptcy/exemptions',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal']}>
            <UtahExemptionsTool />
          </RoleRoute>
        ),
      },
      {
        path: 'bankruptcy/plan',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal', 'billing']}>
            <Chapter13PlanCalculator />
          </RoleRoute>
        ),
      },
      {
        path: 'bankruptcy/creditor-matrix',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal']}>
            <CreditorMatrixGenerator />
          </RoleRoute>
        ),
      },
      // Specialty Practice: Personal Injury & Wrongful Death Workspace
      {
        path: 'personal-injury',
        element: <Navigate to="/personal-injury/dashboard" replace />,
      },
      {
        path: 'personal-injury/dashboard',
        element: <PIDashboard />,
      },
      {
        path: 'personal-injury/incident-liability',
        element: <IncidentLiability />,
      },
      {
        path: 'personal-injury/incident',
        element: <Navigate to="/personal-injury/incident-liability" replace />,
      },
      {
        path: 'personal-injury/client-damages',
        element: <ClientDamages />,
      },
      {
        path: 'personal-injury/insurance',
        element: <InsuranceManagement />,
      },
      {
        path: 'personal-injury/medical-treatment',
        element: <MedicalTreatment />,
      },
      {
        path: 'personal-injury/medical',
        element: <Navigate to="/personal-injury/medical-treatment" replace />,
      },
      {
        path: 'personal-injury/vendor-assignments',
        element: <VendorAssignments />,
      },
      {
        path: 'personal-injury/vendors',
        element: <Navigate to="/personal-injury/vendor-assignments" replace />,
      },
      {
        path: 'personal-injury/demand-packages',
        element: <DemandPackages />,
      },
      {
        path: 'personal-injury/demands',
        element: <Navigate to="/personal-injury/demand-packages" replace />,
      },
      {
        path: 'personal-injury/lien-register',
        element: <LienRegister />,
      },
      {
        path: 'personal-injury/liens',
        element: <Navigate to="/personal-injury/lien-register" replace />,
      },
      {
        path: 'personal-injury/settlement-calculator',
        element: <PISettlementCalculator />,
      },
      {
        path: 'personal-injury/settlement',
        element: <Navigate to="/personal-injury/settlement-calculator" replace />,
      },
      // Specialty Practice: Civil & Commercial Litigation Workspace (Sections 3-8)
      {
        path: 'litigation',
        element: <Navigate to="/litigation/dashboard" replace />,
      },
      {
        path: 'litigation/dashboard',
        element: <LitigationDashboard />,
      },
      {
        path: 'litigation/assessment',
        element: <CaseAssessment />,
      },
      {
        path: 'litigation/pleadings-service',
        element: <PleadingsService />,
      },
      {
        path: 'litigation/scheduling',
        element: <CourtScheduling />,
      },
      {
        path: 'litigation/discovery',
        element: <DiscoveryManagement />,
      },
      {
        path: 'litigation/trial',
        element: <TrialNotebook />,
      },

      // 5 Specialized Practice Workspaces (Sections 20-24)
      {
        path: 'probate',
        element: <ProbateWorkspace />,
      },
      {
        path: 'family-law',
        element: <FamilyLawWorkspace />,
      },
      {
        path: 'criminal',
        element: <CriminalWorkspace />,
      },
      {
        path: 'appeals',
        element: <AppealsWorkspace />,
      },
      {
        path: 'evictions',
        element: <EvictionsWorkspace />,
      },

      // Module 3: Tasks & Activities
      {
        path: 'tasks',
        element: <Navigate to="/tasks/mine" replace />,
      },
      {
        path: 'tasks/mine',
        element: <MyTasks />,
      },
      {
        path: 'tasks/team',
        element: <TeamTasks />,
      },
      {
        path: 'calendar',
        element: <CalendarPage />,
      },
      {
        path: 'deadlines',
        element: <CourtDeadlines />,
      },
      {
        path: 'time',
        element: <TimeTracking />,
      },
      {
        path: 'time/review',
        element: <DailyTimeReview />,
      },
      {
        path: 'time/approvals',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'billing']}>
            <TimeApprovals />
          </RoleRoute>
        ),
      },
      {
        path: 'time/suggested',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney']}>
            <SuggestedBilling />
          </RoleRoute>
        ),
      },
      {
        path: 'checklists',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal']}>
            <WorkflowChecklists />
          </RoleRoute>
        ),
      },
      // Module 4: Billing & Accounting
      {
        path: 'billing',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'billing']}>
            <BillingOverview />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/hours',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'billing']}>
            <BillableHours />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/expenses',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'billing']}>
            <ExpensesList />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/invoices',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'billing']}>
            <InvoicesList />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/payments',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'billing']}>
            <PaymentRecords />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/reports',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'billing']}>
            <BillingReports />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/operating',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'billing']}>
            <OperatingAccount />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/trust',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'billing']}>
            <TrustAccount />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/chart-of-accounts',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'billing']}>
            <ChartOfAccounts />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/general-ledger',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'billing']}>
            <GeneralLedgerView />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/reconciliation',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'billing']}>
            <ThreeWayReconciliation />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/settlements',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'billing']}>
            <SettlementCalculator />
          </RoleRoute>
        ),
      },
      {
        path: 'billing/cosmolex',
        element: <Navigate to="/billing/reconciliation" replace />,
      },
      // Module 5: Reports & Settings
      {
        path: 'reports',
        element: <Navigate to="/reports/matters" replace />,
      },
      {
        path: 'reports/staff',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'billing']}>
            <StaffReports />
          </RoleRoute>
        ),
      },
      {
        path: 'reports/matters',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal']}>
            <MatterReports />
          </RoleRoute>
        ),
      },
      {
        path: 'reports/financial',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'billing']}>
            <FinancialReports />
          </RoleRoute>
        ),
      },
      {
        path: 'compliance',
        element: <ComplianceMatrix />,
      },
      {
        path: 'reports/compliance',
        element: <ComplianceMatrix />,
      },
      {
        path: 'settings',
        element: <Navigate to="/settings/users" replace />,
      },
      {
        path: 'settings/users',
        element: (
          <RoleRoute allowedRoles={['super_admin']}>
            <UserManagement />
          </RoleRoute>
        ),
      },
      {
        path: 'settings/roles',
        element: (
          <RoleRoute allowedRoles={['super_admin']}>
            <RolesPermissions />
          </RoleRoute>
        ),
      },
      {
        path: 'settings/templates',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney', 'paralegal']}>
            <TemplatesSettings />
          </RoleRoute>
        ),
      },
      {
        path: 'settings/workflows',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor']}>
            <WorkflowManager />
          </RoleRoute>
        ),
      },
      {
        path: 'settings/integrations',
        element: (
          <RoleRoute allowedRoles={['super_admin']}>
            <ExternalIntegrations />
          </RoleRoute>
        ),
      },
      {
        path: 'settings/branding',
        element: (
          <RoleRoute allowedRoles={['super_admin']}>
            <FirmBranding />
          </RoleRoute>
        ),
      },
      {
        path: 'settings/notifications',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'attorney']}>
            <NotificationsSettings />
          </RoleRoute>
        ),
      },
      {
        path: 'settings/audit-logs',
        element: (
          <RoleRoute allowedRoles={['super_admin', 'supervisor', 'billing']}>
            <AuditLogs />
          </RoleRoute>
        ),
      },
      {
        path: 'settings/security',
        element: (
          <RoleRoute allowedRoles={['super_admin']}>
            <SecuritySettings />
          </RoleRoute>
        ),
      },
      // Fallback
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

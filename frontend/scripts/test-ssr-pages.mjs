import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

console.log('--- STARTING COMPONENT RENDER INTEGRITY TEST ---');

async function testComponentRenders() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: 'frontend'
  });

  const pagesToTest = [
    '/src/features/dashboard/pages/Dashboard.jsx',
    '/src/features/clients/pages/ClientsList.jsx',
    '/src/features/clients/pages/ClientDetails.jsx',
    '/src/features/clients/pages/ClientPortalPreview.jsx',
    '/src/features/matters/pages/MattersList.jsx',
    '/src/features/matters/pages/MatterDetails.jsx',
    '/src/features/intake/pages/IntakeList.jsx',
    '/src/features/documents/pages/DocumentsList.jsx',
    '/src/features/communications/pages/CommunicationsList.jsx',
    '/src/features/immigration/pages/ImmigrationCasesList.jsx',
    '/src/features/immigration/pages/ImmigrationPartiesDirectory.jsx',
    '/src/features/immigration/pages/ImmigrationFormLibrary.jsx',
    '/src/features/immigration/pages/USCISReceiptTracker.jsx',
    '/src/features/immigration/pages/MultilingualQuestionnaires.jsx',
    '/src/features/bankruptcy/pages/BankruptcyCasesList.jsx',
    '/src/features/bankruptcy/pages/BankruptcySchedulesLedger.jsx',
    '/src/features/bankruptcy/pages/MeansTestCalculator.jsx',
    '/src/features/bankruptcy/pages/UtahExemptionsTool.jsx',
    '/src/features/bankruptcy/pages/Chapter13PlanCalculator.jsx',
    '/src/features/bankruptcy/pages/CreditorMatrixGenerator.jsx',
    '/src/features/tasks/pages/MyTasks.jsx',
    '/src/features/tasks/pages/TeamTasks.jsx',
    '/src/features/tasks/pages/WorkflowChecklists.jsx',
    '/src/features/calendar/pages/CalendarPage.jsx',
    '/src/features/calendar/pages/CourtDeadlines.jsx',
    '/src/features/billing/pages/BillingOverview.jsx',
    '/src/features/billing/pages/ChartOfAccounts.jsx',
    '/src/features/billing/pages/GeneralLedgerView.jsx',
    '/src/features/billing/pages/OperatingAccount.jsx',
    '/src/features/billing/pages/TrustAccount.jsx',
    '/src/features/billing/pages/InvoicesList.jsx',
    '/src/features/billing/pages/PaymentRecords.jsx',
    '/src/features/settings/pages/SecuritySettings.jsx',
    '/src/features/settings/pages/AuditLogs.jsx',
    '/src/features/settings/pages/RolesPermissions.jsx',
    '/src/features/settings/pages/UserManagement.jsx',

    // Modals & Specialized Feature Components
    '/src/features/settings/components/MfaSetupModal.jsx',
    '/src/features/settings/components/BackupRestoreModal.jsx',
    '/src/features/bankruptcy/components/AmendedSchedulesModal.jsx',
    '/src/features/calendar/components/RecurringTaskModal.jsx',
    '/src/features/billing/components/BankReconciliationModal.jsx',
    '/src/features/billing/components/PaymentAllocationModal.jsx',
    '/src/features/billing/components/SettlementStatementModal.jsx',
    '/src/features/communications/components/OutlookMailBridgeModal.jsx',
    '/src/features/communications/components/TextMessageThreadModal.jsx',
    '/src/features/intake/components/ConflictSearchModal.jsx',
    '/src/features/clients/components/EngagementLetterModal.jsx',
    '/src/features/documents/components/SignatureTrackingModal.jsx',
    '/src/features/matters/components/StageProgressBar.jsx',
    '/src/features/calendar/components/RelativeDeadlineCalculator.jsx',
    '/src/features/bankruptcy/components/AddCreditorModal.jsx',
    '/src/features/immigration/components/ImmigrationCaseDrawer.jsx',
    '/src/features/immigration/components/FilingPackageAssemblerModal.jsx',
    '/src/features/immigration/components/PartyModal.jsx',
  ];

  let passed = 0;
  let failed = 0;
  const failureDetails = [];

  for (const pagePath of pagesToTest) {
    try {
      const mod = await vite.ssrLoadModule(pagePath);
      // Check that it exports at least one React component (PascalCase export or default)
      const exportNames = Object.keys(mod);
      const componentName = exportNames.find(name => /^[A-Z]/.test(name));
      if (!componentName && !mod.default) {
        throw new Error(`No React component export found in ${pagePath}. Exports: [${exportNames.join(', ')}]`);
      }
      passed++;
      console.log(`  [PASS] ${pagePath} -> exported ${componentName || 'default'}`);
    } catch (err) {
      failed++;
      console.error(`  [FAIL] ${pagePath}: ${err.message}`);
      failureDetails.push({ path: pagePath, error: err.message });
    }
  }

  await vite.close();

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${pagesToTest.length} primary page components.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testComponentRenders().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

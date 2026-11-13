import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

console.log('--- STARTING DEEP REACT SERVER-RENDER INTEGRITY TEST ---');

async function testFullRenders() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: 'frontend'
  });

  const { MemoryRouter } = await vite.ssrLoadModule('react-router-dom');
  const { AppProvider } = await vite.ssrLoadModule('/src/app/providers/AppProvider.jsx');

  const componentsToRender = [
    { name: 'Dashboard', path: '/src/features/dashboard/pages/Dashboard.jsx' },
    { name: 'ClientsList', path: '/src/features/clients/pages/ClientsList.jsx' },
    { name: 'ClientPortalPreview', path: '/src/features/clients/pages/ClientPortalPreview.jsx' },
    { name: 'MattersList', path: '/src/features/matters/pages/MattersList.jsx' },
    { name: 'IntakeList', path: '/src/features/intake/pages/IntakeList.jsx' },
    { name: 'DocumentsList', path: '/src/features/documents/pages/DocumentsList.jsx' },
    { name: 'CommunicationsList', path: '/src/features/communications/pages/CommunicationsList.jsx' },
    { name: 'ImmigrationCasesList', path: '/src/features/immigration/pages/ImmigrationCasesList.jsx' },
    { name: 'ImmigrationPartiesDirectory', path: '/src/features/immigration/pages/ImmigrationPartiesDirectory.jsx' },
    { name: 'ImmigrationFormLibrary', path: '/src/features/immigration/pages/ImmigrationFormLibrary.jsx' },
    { name: 'USCISReceiptTracker', path: '/src/features/immigration/pages/USCISReceiptTracker.jsx' },
    { name: 'MultilingualQuestionnaires', path: '/src/features/immigration/pages/MultilingualQuestionnaires.jsx' },
    { name: 'BankruptcyCasesList', path: '/src/features/bankruptcy/pages/BankruptcyCasesList.jsx' },
    { name: 'BankruptcySchedulesLedger', path: '/src/features/bankruptcy/pages/BankruptcySchedulesLedger.jsx' },
    { name: 'MeansTestCalculator', path: '/src/features/bankruptcy/pages/MeansTestCalculator.jsx' },
    { name: 'UtahExemptionsTool', path: '/src/features/bankruptcy/pages/UtahExemptionsTool.jsx' },
    { name: 'Chapter13PlanCalculator', path: '/src/features/bankruptcy/pages/Chapter13PlanCalculator.jsx' },
    { name: 'CreditorMatrixGenerator', path: '/src/features/bankruptcy/pages/CreditorMatrixGenerator.jsx' },
    { name: 'MyTasks', path: '/src/features/tasks/pages/MyTasks.jsx' },
    { name: 'TeamTasks', path: '/src/features/tasks/pages/TeamTasks.jsx' },
    { name: 'WorkflowChecklists', path: '/src/features/tasks/pages/WorkflowChecklists.jsx' },
    { name: 'CalendarPage', path: '/src/features/calendar/pages/CalendarPage.jsx' },
    { name: 'CourtDeadlines', path: '/src/features/calendar/pages/CourtDeadlines.jsx' },
    { name: 'BillingOverview', path: '/src/features/billing/pages/BillingOverview.jsx' },
    { name: 'ChartOfAccounts', path: '/src/features/billing/pages/ChartOfAccounts.jsx' },
    { name: 'GeneralLedgerView', path: '/src/features/billing/pages/GeneralLedgerView.jsx' },
    { name: 'OperatingAccount', path: '/src/features/billing/pages/OperatingAccount.jsx' },
    { name: 'TrustAccount', path: '/src/features/billing/pages/TrustAccount.jsx' },
    { name: 'InvoicesList', path: '/src/features/billing/pages/InvoicesList.jsx' },
    { name: 'PaymentRecords', path: '/src/features/billing/pages/PaymentRecords.jsx' },
    { name: 'SecuritySettings', path: '/src/features/settings/pages/SecuritySettings.jsx' },
    { name: 'AuditLogs', path: '/src/features/settings/pages/AuditLogs.jsx' },
    { name: 'RolesPermissions', path: '/src/features/settings/pages/RolesPermissions.jsx' },
    { name: 'UserManagement', path: '/src/features/settings/pages/UserManagement.jsx' },
  ];

  let passed = 0;
  let failed = 0;

  for (const item of componentsToRender) {
    try {
      const mod = await vite.ssrLoadModule(item.path);
      const Component = mod[item.name] || mod.default;
      if (!Component) {
        throw new Error(`Export ${item.name} not found in ${item.path}`);
      }

      const html = renderToString(
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/'] },
          React.createElement(
            AppProvider,
            null,
            React.createElement(Component, null)
          )
        )
      );

      if (typeof html !== 'string' || html.length === 0) {
        throw new Error('renderToString returned empty string');
      }

      passed++;
      console.log(`  [PASS] Rendered ${item.name} (${html.length} bytes HTML output)`);
    } catch (err) {
      failed++;
      console.error(`  [FAIL] ${item.name} (${item.path}): ${err.message}`);
    }
  }

  await vite.close();

  console.log(`\nRender Results: ${passed} passed, ${failed} failed out of ${componentsToRender.length} components.`);
  if (failed > 0) process.exit(1);
}

testFullRenders().catch(err => {
  console.error('Fatal SSR render error:', err);
  process.exit(1);
});


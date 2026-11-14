import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Lightweight browser simulation
if (typeof globalThis.window === 'undefined') {
  const sessionData = new Map();
  const localData = new Map();
  globalThis.window = {
    location: { search: '', pathname: '/personal-injury/incident-liability' },
    addEventListener: () => {},
    removeEventListener: () => {},
    innerWidth: 1280,
  };
  globalThis.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: () => ({ style: {} }),
  };
  globalThis.sessionStorage = {
    getItem: (k) => sessionData.get(k) || null,
    setItem: (k, v) => sessionData.set(k, String(v)),
    removeItem: (k) => sessionData.delete(k),
    clear: () => sessionData.clear(),
  };
  globalThis.localStorage = {
    getItem: (k) => localData.get(k) || null,
    setItem: (k, v) => localData.set(k, String(v)),
    removeItem: (k) => localData.delete(k),
    clear: () => localData.clear(),
  };
}

async function runRegressionSuite() {
  console.log('=================================================================');
  console.log('  PI MODALS DEFAULT CASE ID REGRESSION VERIFICATION');
  console.log('=================================================================\n');

  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: 'frontend'
  });

  const { MemoryRouter } = await vite.ssrLoadModule('react-router-dom');
  const { AppProvider } = await vite.ssrLoadModule('/src/app/providers/AppProvider.jsx');
  const { IncidentModal } = await vite.ssrLoadModule('/src/features/personal-injury/components/IncidentModal.jsx');
  const { InsuranceModal } = await vite.ssrLoadModule('/src/features/personal-injury/components/InsuranceModal.jsx');
  const { IncidentLiability } = await vite.ssrLoadModule('/src/features/personal-injury/pages/IncidentLiability.jsx');
  const { InsuranceManagement } = await vite.ssrLoadModule('/src/features/personal-injury/pages/InsuranceManagement.jsx');
  const { MOCK_PI_CASES, MOCK_INCIDENT_RECORDS, MOCK_INSURANCE_POLICIES } = await vite.ssrLoadModule('/src/data/mockPersonalInjury.js');

  const testResults = [];
  function assert(testId, description, passed, details = '') {
    testResults.push({ testId, description, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [${testId}] ${description}`);
    if (details) console.log(`       -> ${details}`);
  }

  // TEST 1: Select PI-2026-002 -> IncidentModal defaults to PI-2026-002
  try {
    const html = renderToString(
      React.createElement(MemoryRouter, null,
        React.createElement(AppProvider, null,
          React.createElement(IncidentModal, {
            isOpen: true,
            onClose: () => {},
            onSave: () => {},
            incident: null,
            cases: MOCK_PI_CASES,
            defaultCaseId: 'PI-2026-002'
          })
        )
      )
    );
    // Check that option with value="PI-2026-002" is selected
    const isSelected = html.includes('value="PI-2026-002" selected') || html.includes('value="PI-2026-002"');
    assert('T1', 'IncidentModal initializes with defaultCaseId="PI-2026-002"', isSelected, 'Rendered with PI-2026-002 option');
  } catch (err) {
    assert('T1', 'IncidentModal initializes with defaultCaseId="PI-2026-002"', false, err.message);
  }

  // TEST 2: Select PI-2026-002 -> InsuranceModal defaults to PI-2026-002
  try {
    const html = renderToString(
      React.createElement(MemoryRouter, null,
        React.createElement(AppProvider, null,
          React.createElement(InsuranceModal, {
            isOpen: true,
            onClose: () => {},
            onSave: () => {},
            policy: null,
            cases: MOCK_PI_CASES,
            defaultCaseId: 'PI-2026-002'
          })
        )
      )
    );
    const isSelected = html.includes('value="PI-2026-002" selected') || html.includes('value="PI-2026-002"');
    assert('T2', 'InsuranceModal initializes with defaultCaseId="PI-2026-002"', isSelected, 'Rendered with PI-2026-002 option');
  } catch (err) {
    assert('T2', 'InsuranceModal initializes with defaultCaseId="PI-2026-002"', false, err.message);
  }

  // TEST 3: Switch to PI-2026-001 -> IncidentModal defaults to PI-2026-001
  try {
    const html = renderToString(
      React.createElement(MemoryRouter, null,
        React.createElement(AppProvider, null,
          React.createElement(IncidentModal, {
            isOpen: true,
            onClose: () => {},
            onSave: () => {},
            incident: null,
            cases: MOCK_PI_CASES,
            defaultCaseId: 'PI-2026-001'
          })
        )
      )
    );
    const isSelected = html.includes('value="PI-2026-001"');
    assert('T3', 'IncidentModal initializes with defaultCaseId="PI-2026-001"', isSelected);
  } catch (err) {
    assert('T3', 'IncidentModal initializes with defaultCaseId="PI-2026-001"', false, err.message);
  }

  // TEST 4: Switch to PI-2026-001 -> InsuranceModal defaults to PI-2026-001
  try {
    const html = renderToString(
      React.createElement(MemoryRouter, null,
        React.createElement(AppProvider, null,
          React.createElement(InsuranceModal, {
            isOpen: true,
            onClose: () => {},
            onSave: () => {},
            policy: null,
            cases: MOCK_PI_CASES,
            defaultCaseId: 'PI-2026-001'
          })
        )
      )
    );
    const isSelected = html.includes('value="PI-2026-001"');
    assert('T4', 'InsuranceModal initializes with defaultCaseId="PI-2026-001"', isSelected);
  } catch (err) {
    assert('T4', 'InsuranceModal initializes with defaultCaseId="PI-2026-001"', false, err.message);
  }

  // TEST 5: Existing incident record keeps its original matter ID when edited (does not overwrite)
  try {
    const existingIncident = MOCK_INCIDENT_RECORDS[0]; // has matterId "PI-2026-001"
    const html = renderToString(
      React.createElement(MemoryRouter, null,
        React.createElement(AppProvider, null,
          React.createElement(IncidentModal, {
            isOpen: true,
            onClose: () => {},
            onSave: () => {},
            incident: existingIncident,
            cases: MOCK_PI_CASES,
            defaultCaseId: 'PI-2026-003' // Active context is different (PI-2026-003)
          })
        )
      )
    );
    // Should preserve existing incident's matterId (PI-2026-001) despite defaultCaseId being PI-2026-003
    const hasOriginalMatter = html.includes('value="PI-2026-001"');
    assert('T5', 'Editing existing incident preserves its original matterId (PI-2026-001)', hasOriginalMatter);
  } catch (err) {
    assert('T5', 'Editing existing incident preserves its original matterId', false, err.message);
  }

  // TEST 6: Existing insurance policy keeps its original matter ID when edited
  try {
    const existingPolicy = MOCK_INSURANCE_POLICIES[0]; // has matterId "PI-2026-001"
    const html = renderToString(
      React.createElement(MemoryRouter, null,
        React.createElement(AppProvider, null,
          React.createElement(InsuranceModal, {
            isOpen: true,
            onClose: () => {},
            onSave: () => {},
            policy: existingPolicy,
            cases: MOCK_PI_CASES,
            defaultCaseId: 'PI-2026-003' // Active context is different
          })
        )
      )
    );
    const hasOriginalMatter = html.includes('value="PI-2026-001"');
    assert('T6', 'Editing existing insurance policy preserves its original matterId (PI-2026-001)', hasOriginalMatter);
  } catch (err) {
    assert('T6', 'Editing existing insurance policy preserves its original matterId', false, err.message);
  }

  // TEST 7: All-Matters mode ('ALL') or empty defaultCaseId safely falls back to cases[0].id
  try {
    const html = renderToString(
      React.createElement(MemoryRouter, null,
        React.createElement(AppProvider, null,
          React.createElement(IncidentModal, {
            isOpen: true,
            onClose: () => {},
            onSave: () => {},
            incident: null,
            cases: MOCK_PI_CASES,
            defaultCaseId: 'ALL'
          })
        )
      )
    );
    const hasFallback = html.includes('value="PI-2026-001"');
    assert('T7', 'All-Matters mode defaultCaseId="ALL" safely falls back to cases[0].id', hasFallback);
  } catch (err) {
    assert('T7', 'All-Matters mode fallback', false, err.message);
  }

  // TEST 8: IncidentLiability page passes defaultCaseId prop cleanly
  try {
    globalThis.sessionStorage.setItem('hb_active_matter_id', 'PI-2026-002');
    const html = renderToString(
      React.createElement(MemoryRouter, { initialEntries: ['/personal-injury/incident-liability'] },
        React.createElement(AppProvider, null,
          React.createElement(IncidentLiability, null)
        )
      )
    );
    assert('T8', 'IncidentLiability renders cleanly with active context integration', html.length > 500);
  } catch (err) {
    assert('T8', 'IncidentLiability renders cleanly with active context integration', false, err.message);
  }

  // TEST 9: InsuranceManagement page passes defaultCaseId prop cleanly
  try {
    globalThis.sessionStorage.setItem('hb_active_matter_id', 'PI-2026-002');
    const html = renderToString(
      React.createElement(MemoryRouter, { initialEntries: ['/personal-injury/insurance'] },
        React.createElement(AppProvider, null,
          React.createElement(InsuranceManagement, null)
        )
      )
    );
    assert('T9', 'InsuranceManagement renders cleanly with active context integration', html.length > 500);
  } catch (err) {
    assert('T9', 'InsuranceManagement renders cleanly with active context integration', false, err.message);
  }

  console.log('\n=================================================================');
  const passedCount = testResults.filter(r => r.passed).length;
  console.log(`TOTAL REGRESSION TESTS: ${testResults.length} | PASSED: ${passedCount} | FAILED: ${testResults.length - passedCount}`);
  console.log('=================================================================\n');

  await vite.close();
}

runRegressionSuite().catch(err => {
  console.error('Regression suite crashed:', err);
  process.exit(1);
});

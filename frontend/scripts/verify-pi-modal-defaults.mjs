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
  console.log('  PI MODALS ALL-MATTERS & DATA INTEGRITY REGRESSION SUITE');
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

  // 1. SINGLE-MATTER MODE: defaultCaseId="PI-2026-002" preselects PI-2026-002
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
    const hasPI2 = html.includes('value="PI-2026-002"');
    assert('R1', 'Single-Matter mode: IncidentModal defaults to active matter PI-2026-002', hasPI2);
  } catch (err) {
    assert('R1', 'Single-Matter mode: IncidentModal defaults to active matter', false, err.message);
  }

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
    const hasPI2 = html.includes('value="PI-2026-002"');
    assert('R2', 'Single-Matter mode: InsuranceModal defaults to active matter PI-2026-002', hasPI2);
  } catch (err) {
    assert('R2', 'Single-Matter mode: InsuranceModal defaults to active matter', false, err.message);
  }

  // 2. ALL-MATTERS MODE: defaultCaseId="ALL" leaves matterId empty, does NOT silently select cases[0]
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
    // Must display placeholder '-- Select Associated PI Matter --' and not have cases[0] selected
    const hasPlaceholder = html.includes('-- Select Associated PI Matter --');
    assert('R3', 'All-Matters mode: IncidentModal requires explicit selection (shows placeholder)', hasPlaceholder);
  } catch (err) {
    assert('R3', 'All-Matters mode: IncidentModal requires explicit selection', false, err.message);
  }

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
            defaultCaseId: 'ALL'
          })
        )
      )
    );
    const hasPlaceholder = html.includes('-- Select Associated PI Matter --');
    assert('R4', 'All-Matters mode: InsuranceModal requires explicit selection (shows placeholder)', hasPlaceholder);
  } catch (err) {
    assert('R4', 'All-Matters mode: InsuranceModal requires explicit selection', false, err.message);
  }

  // 3. EDIT MODE: Preserves existing record's matterId even if defaultCaseId is different
  try {
    const existingIncident = MOCK_INCIDENT_RECORDS[0]; // matterId is 'PI-2026-001'
    const html = renderToString(
      React.createElement(MemoryRouter, null,
        React.createElement(AppProvider, null,
          React.createElement(IncidentModal, {
            isOpen: true,
            onClose: () => {},
            onSave: () => {},
            incident: existingIncident,
            cases: MOCK_PI_CASES,
            defaultCaseId: 'PI-2026-003' // Context is switched to PI-2026-003
          })
        )
      )
    );
    const preservesOriginal = html.includes('value="PI-2026-001"');
    assert('R5', 'Edit mode: IncidentModal preserves original matterId (PI-2026-001)', preservesOriginal);
  } catch (err) {
    assert('R5', 'Edit mode: IncidentModal preserves original matterId', false, err.message);
  }

  try {
    const existingPolicy = MOCK_INSURANCE_POLICIES[0]; // matterId is 'PI-2026-001'
    const html = renderToString(
      React.createElement(MemoryRouter, null,
        React.createElement(AppProvider, null,
          React.createElement(InsuranceModal, {
            isOpen: true,
            onClose: () => {},
            onSave: () => {},
            policy: existingPolicy,
            cases: MOCK_PI_CASES,
            defaultCaseId: 'PI-2026-003' // Context is switched to PI-2026-003
          })
        )
      )
    );
    const preservesOriginal = html.includes('value="PI-2026-001"');
    assert('R6', 'Edit mode: InsuranceModal preserves original matterId (PI-2026-001)', preservesOriginal);
  } catch (err) {
    assert('R6', 'Edit mode: InsuranceModal preserves original matterId', false, err.message);
  }

  // 4. EMPTY MATTER LIST: cases=[] handled gracefully with informative placeholder
  try {
    const html = renderToString(
      React.createElement(MemoryRouter, null,
        React.createElement(AppProvider, null,
          React.createElement(IncidentModal, {
            isOpen: true,
            onClose: () => {},
            onSave: () => {},
            incident: null,
            cases: [],
            defaultCaseId: ''
          })
        )
      )
    );
    const handlesEmpty = html.includes('No active PI matters available');
    assert('R7', 'Empty Matter list: IncidentModal displays graceful placeholder', handlesEmpty);
  } catch (err) {
    assert('R7', 'Empty Matter list: IncidentModal displays graceful placeholder', false, err.message);
  }

  try {
    const html = renderToString(
      React.createElement(MemoryRouter, null,
        React.createElement(AppProvider, null,
          React.createElement(InsuranceModal, {
            isOpen: true,
            onClose: () => {},
            onSave: () => {},
            policy: null,
            cases: [],
            defaultCaseId: ''
          })
        )
      )
    );
    const handlesEmpty = html.includes('No active PI matters available');
    assert('R8', 'Empty Matter list: InsuranceModal displays graceful placeholder', handlesEmpty);
  } catch (err) {
    assert('R8', 'Empty Matter list: InsuranceModal displays graceful placeholder', false, err.message);
  }

  // 5. SWITCHING CONTEXT: Switching matter to PI-2026-001
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
    const hasPI1 = html.includes('value="PI-2026-001"');
    assert('R9', 'Context Switching: IncidentModal updates to newly selected matter PI-2026-001', hasPI1);
  } catch (err) {
    assert('R9', 'Context Switching: IncidentModal updates to newly selected matter', false, err.message);
  }

  // 6. PAGE RENDERING INTEGRATION: IncidentLiability & InsuranceManagement render clean HTML
  try {
    const htmlInc = renderToString(
      React.createElement(MemoryRouter, { initialEntries: ['/personal-injury/incident-liability'] },
        React.createElement(AppProvider, null,
          React.createElement(IncidentLiability, null)
        )
      )
    );
    assert('R10', 'IncidentLiability page renders cleanly in All-Matters mode', htmlInc.length > 500);

    const htmlIns = renderToString(
      React.createElement(MemoryRouter, { initialEntries: ['/personal-injury/insurance'] },
        React.createElement(AppProvider, null,
          React.createElement(InsuranceManagement, null)
        )
      )
    );
    assert('R11', 'InsuranceManagement page renders cleanly in All-Matters mode', htmlIns.length > 500);
  } catch (err) {
    assert('R10/R11', 'Page rendering in All-Matters mode', false, err.message);
  }

  console.log('\n=================================================================');
  const passedCount = testResults.filter(r => r.passed).length;
  console.log(`TOTAL DATA INTEGRITY TESTS: ${testResults.length} | PASSED: ${passedCount} | FAILED: ${testResults.length - passedCount}`);
  console.log('=================================================================\n');

  await vite.close();
}

runRegressionSuite().catch(err => {
  console.error('Regression suite crashed:', err);
  process.exit(1);
});

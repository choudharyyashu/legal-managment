import { CommunicationIngestionEngine } from '../modules/communications/communication-ingestion.js';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runPriority3TestSuite() {
  console.log('================================================================');
  console.log('LEGALPRO PRIORITY 3: COMMUNICATIONS & INGESTION TEST SUITE');
  console.log('================================================================\n');

  // Test 1: Content Sanitization
  console.log('Test 1: Content sanitization (excluding sensitive leakage)...');
  const rawText = 'Confidential client discussion regarding alimony.\nMore sensitive text details here.';
  const preview = CommunicationIngestionEngine.sanitizePreview(rawText, 50);
  assert(!preview.includes('\n'), 'Sanitized preview must not contain newlines');
  assert(preview.length <= 53, 'Sanitized preview length must respect limit');
  console.log(`   Preview generated: "${preview}"`);
  console.log('   ✓ Test 1 PASSED.\n');

  // Test 2: Matter Matching - Unique Exact Match
  console.log('Test 2: Matter matching - Unique Exact Match...');
  const candidateMatters = [
    { id: 'm-1', matterNumber: '26-FAM-0101', clientName: 'David John', clientPhone: '2344565632', clientEmail: 'davide@gmail.com' },
    { id: 'm-2', matterNumber: '26-PI-0102', clientName: 'Alice Smith', clientPhone: '8015551234', clientEmail: 'alice@example.com' },
  ];

  const uniqueMatch = CommunicationIngestionEngine.evaluateMatterMatch('2344565632', candidateMatters);
  assert(uniqueMatch.status === 'EXACT_MATCH', `Expected EXACT_MATCH, got ${uniqueMatch.status}`);
  assert(uniqueMatch.matchedMatterId === 'm-1', `Expected m-1, got ${uniqueMatch.matchedMatterId}`);
  console.log(`   Evaluation result: ${uniqueMatch.status} -> ${uniqueMatch.reason}`);
  console.log('   ✓ Test 2 PASSED.\n');

  // Test 3: Matter Matching - Ambiguous Match (Multiple candidate matters for same client)
  console.log('Test 3: Matter matching - Ambiguous Match (Multiple matching dockets)...');
  const multiMatters = [
    { id: 'm-1', matterNumber: '26-FAM-0101', clientName: 'David John', clientPhone: '2344565632', clientEmail: 'davide@gmail.com' },
    { id: 'm-3', matterNumber: '26-CIV-0103', clientName: 'David John', clientPhone: '2344565632', clientEmail: 'davide@gmail.com' },
  ];

  const ambigMatch = CommunicationIngestionEngine.evaluateMatterMatch('2344565632', multiMatters);
  assert(ambigMatch.status === 'AMBIGUOUS', `Expected AMBIGUOUS to prevent incorrect auto-filing, got ${ambigMatch.status}`);
  assert(ambigMatch.matchedMatterId === undefined, 'Ambiguous match must not auto-assign a matter ID');
  console.log(`   Evaluation result: ${ambigMatch.status} -> ${ambigMatch.reason}`);
  console.log('   ✓ Test 3 PASSED.\n');

  // Test 4: Matter Matching - Unmatched Contact
  console.log('Test 4: Matter matching - Unknown Sender...');
  const unmatched = CommunicationIngestionEngine.evaluateMatterMatch('8019999999', candidateMatters);
  assert(unmatched.status === 'UNMATCHED', `Expected UNMATCHED, got ${unmatched.status}`);
  console.log(`   Evaluation result: ${unmatched.status} -> ${unmatched.reason}`);
  console.log('   ✓ Test 4 PASSED.\n');

  // Test 5: Legal Billing Increments Calculation (Tenths of an Hour / 6-minute rule)
  console.log('Test 5: Tenths-of-an-hour billing increments...');
  const units5min = CommunicationIngestionEngine.calculateBillingUnits(5);
  assert(units5min.units === 0.1, `5 minutes should bill 0.1 units, got ${units5min.units}`);

  const units15min = CommunicationIngestionEngine.calculateBillingUnits(15);
  assert(units15min.units === 0.3, `15 minutes should bill 0.3 units, got ${units15min.units}`);

  const units60min = CommunicationIngestionEngine.calculateBillingUnits(60);
  assert(units60min.units === 1.0, `60 minutes should bill 1.0 units, got ${units60min.units}`);
  console.log('   ✓ Test 5 PASSED.\n');

  console.log('================================================================');
  console.log('ALL PRIORITY 3 LOGIC & REASONING TESTS PASSED SUCCESSFULLY');
  console.log('================================================================');
}

runPriority3TestSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function verifyPriority1() {
  console.log('================================================================');
  console.log('LEGALPRO PRIORITY 1: FULL AUTOMATED VERIFICATION AUDIT');
  console.log('================================================================');

  // Test 1: Verify all 9 Practice Areas exist with valid stages
  const practiceAreas = await prisma.practiceArea.findMany({
    include: {
      workflowStages: {
        orderBy: { stageOrder: 'asc' },
      },
    },
    orderBy: { code: 'asc' },
  });

  console.log(`\n1. Practice Areas & Stage Counts (${practiceAreas.length} Total):`);
  const expectedCodes = ['APP', 'BK', 'CIV', 'CRIM', 'EVICT', 'FAM', 'IMM', 'PI', 'PROB'];
  for (const pa of practiceAreas) {
    console.log(`   - [${pa.code}] ${pa.name} (ID: ${pa.id}): ${pa.workflowStages.length} stages`);
  }

  const missingCodes = expectedCodes.filter((c) => !practiceAreas.some((p) => p.code === c));
  if (missingCodes.length > 0) {
    throw new Error(`Missing practice areas: ${missingCodes.join(', ')}`);
  }
  console.log('   ✓ All 9 canonical practice areas verified.');

  // Test 2: Verify Probate has exactly 7 procedural stages
  const probateStages = await prisma.workflowStage.findMany({
    where: { practiceAreaId: 'pa-prob' },
    orderBy: { stageOrder: 'asc' },
  });

  console.log(`\n2. Probate 7-Stage Workflow Verification (${probateStages.length} stages):`);
  const expectedProbateNames = [
    'Appointment of Fiduciary',
    'Statutory Notices to Heirs & Creditors',
    'Creditor Claims Evaluation',
    'Estate Inventory & Appraisal',
    'Estate Accounting & Tax Clearance',
    'Distribution to Beneficiaries',
    'Closing & Discharge of Fiduciary',
  ];

  probateStages.forEach((st, idx) => {
    const reqs = Array.isArray(st.requiredFields) ? st.requiredFields.length : 0;
    const tasks = Array.isArray(st.autoTasks) ? (st.autoTasks as any[]).length : 0;
    console.log(`   Stage ${st.stageOrder}: [${st.stageCode}] ${st.stageName} (Gatekeepers: ${reqs}, AutoTasks: ${tasks})`);
    if (st.stageName !== expectedProbateNames[idx]) {
      throw new Error(`Stage ${idx + 1} name mismatch: expected "${expectedProbateNames[idx]}", got "${st.stageName}"`);
    }
  });

  if (probateStages.length !== 7) {
    throw new Error(`Probate stage count expected 7, found ${probateStages.length}`);
  }
  console.log('   ✓ All 7 Probate stages match client specification exactly.');

  // Test 3: Test Workflow persistence: update stage gatekeepers and auto-tasks, verify persistence
  console.log('\n3. Testing Stage Persistence in MySQL:');
  const testStage = probateStages[0];
  const initialGatekeepers = Array.isArray(testStage.requiredFields) ? (testStage.requiredFields as string[]) : [];
  
  const testCondition = `Audit Test Condition ${Date.now()}`;
  const updatedGatekeepers = [...initialGatekeepers, testCondition];

  await prisma.workflowStage.update({
    where: { id: testStage.id },
    data: { requiredFields: updatedGatekeepers },
  });

  const persisted = await prisma.workflowStage.findUnique({ where: { id: testStage.id } });
  const persistedGatekeepers = Array.isArray(persisted?.requiredFields) ? (persisted?.requiredFields as string[]) : [];
  if (!persistedGatekeepers.includes(testCondition)) {
    throw new Error('Database persistence test failed: updated condition not found.');
  }
  console.log('   ✓ Updated gatekeeper condition successfully persisted to MySQL.');

  // Revert test condition
  await prisma.workflowStage.update({
    where: { id: testStage.id },
    data: { requiredFields: initialGatekeepers },
  });
  console.log('   ✓ Cleaned up test condition.');

  // Test 4: Verify Matter stage default behavior
  console.log('\n4. Verifying Matter Stage Assignment Logic:');
  const sampleClient = await prisma.client.findFirst({ where: { status: 'Active' } });
  const sampleAttorney = await prisma.user.findFirst({ where: { role: 'attorney', status: 'Active' } });

  if (sampleClient && sampleAttorney) {
    const firstProbateStage = await prisma.workflowStage.findFirst({
      where: { practiceAreaId: 'pa-prob', isActive: true },
      orderBy: { stageOrder: 'asc' },
    });

    console.log(`   - Default stage for pa-prob resolves to: [${firstProbateStage?.stageCode}] ${firstProbateStage?.stageName} (ID: ${firstProbateStage?.id})`);
    if (firstProbateStage?.id !== 'ws-prob-1') {
      throw new Error(`Default stage resolution error: expected ws-prob-1, got ${firstProbateStage?.id}`);
    }
    console.log('   ✓ Initial stage resolution verified.');
  }

  console.log('\n================================================================');
  console.log('ALL PRIORITY 1 VERIFICATION TESTS PASSED SUCCESSFULLY');
  console.log('================================================================');
}

verifyPriority1()
  .catch((e) => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

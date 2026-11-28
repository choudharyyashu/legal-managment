import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('=== VERIFYING PRIORITY 1 IMPLEMENTATION IN DATABASE ===');

  // 1. Verify 9 Practice Areas have workflow stages
  const practiceAreas = await prisma.practiceArea.findMany({
    include: {
      workflowStages: {
        orderBy: { stageOrder: 'asc' },
      },
    },
    orderBy: { code: 'asc' },
  });

  console.log(`Found ${practiceAreas.length} practice areas:`);
  for (const pa of practiceAreas) {
    console.log(` - [${pa.code}] ${pa.name} (ID: ${pa.id}): ${pa.workflowStages.length} stages`);
  }

  // 2. Verify Probate has 7 stages
  const probateStages = await prisma.workflowStage.findMany({
    where: { practiceAreaId: 'pa-prob' },
    orderBy: { stageOrder: 'asc' },
  });

  console.log(`\nProbate (pa-prob) stages (${probateStages.length}):`);
  probateStages.forEach((s) => {
    const reqs = Array.isArray(s.requiredFields) ? s.requiredFields.length : 0;
    const tasks = Array.isArray(s.autoTasks) ? (s.autoTasks as any[]).length : 0;
    console.log(`   ${s.stageOrder}. [${s.stageCode}] ${s.stageName} (ID: ${s.id}) - ${reqs} gatekeepers, ${tasks} auto-tasks`);
  });

  if (probateStages.length !== 7) {
    throw new Error(`Expected 7 probate stages, got ${probateStages.length}`);
  }

  console.log('\n[PASS] All 7 Probate procedural stages successfully verified in MySQL.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

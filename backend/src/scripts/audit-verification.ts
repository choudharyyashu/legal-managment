import { prisma, disconnectDatabase } from '../config/database.js';

async function runAudit() {
  console.log('=== SECTION 1: DATABASE USERS AUDIT ===');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      userCode: true,
      name: true,
      email: true,
      role: true,
      title: true,
      status: true,
      billingRate: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Total User Count: ${users.length}`);
  users.forEach((u, i) => {
    console.log(`[${i + 1}] ID: ${u.id} | Code: ${u.userCode} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Status: ${u.status} | Created: ${u.createdAt.toISOString()}`);
  });

  console.log('\n=== SECTION 2: AUDIT LOGS AUDIT ===');
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'asc' },
  });
  console.log(`Total Audit Log Entries: ${auditLogs.length}`);

  const actionCounts: Record<string, number> = {};
  auditLogs.forEach((log) => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    console.log(`- [${log.timestamp.toISOString()}] Action: ${log.action} | Resource: ${log.resourceType}:${log.resourceId} | User: ${log.userName} (${log.userRole})`);
  });
  console.log('\nAudit Action Distribution:');
  console.table(actionCounts);

  console.log('\n=== SECTION 3: ROLES & PERMISSIONS AUDIT ===');
  const roles = await prisma.role.findMany({
    include: {
      _count: { select: { permissions: true, users: true } },
    },
    orderBy: { id: 'asc' },
  });

  let totalPermissions = 0;
  roles.forEach((r) => {
    totalPermissions += r._count.permissions;
    console.log(`Role: ${r.id.padEnd(15)} | Users: ${r._count.users} | Permissions Count: ${r._count.permissions}`);
  });
  console.log(`Total Roles: ${roles.length}`);
  console.log(`Total Permission Mappings: ${totalPermissions}`);

  console.log('\n=== SECTION 4: PRACTICE AREAS & CLIENTS AUDIT ===');
  const practiceAreas = await prisma.practiceArea.findMany({
    orderBy: { code: 'asc' },
  });
  console.log(`Total Practice Areas: ${practiceAreas.length}`);
  practiceAreas.forEach((pa) => {
    console.log(`- [${pa.code.padEnd(5)}] ID: ${pa.id.padEnd(10)} | Name: ${pa.name}`);
  });

  const clients = await prisma.client.findMany({
    select: { id: true, clientNumber: true, name: true, status: true },
  });
  console.log(`Total Existing Clients: ${clients.length}`);
  clients.forEach((c) => {
    console.log(`- [${c.clientNumber}] ID: ${c.id} | Name: ${c.name} | Status: ${c.status}`);
  });

  const matters = await prisma.matter.findMany({
    select: { id: true, matterNumber: true, title: true, status: true },
  });
  console.log(`Total Existing Matters: ${matters.length}`);

  await disconnectDatabase();
}

runAudit().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
});


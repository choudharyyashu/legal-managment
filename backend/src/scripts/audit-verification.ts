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

  await disconnectDatabase();
}

runAudit().catch(async (e) => {
  console.error(e);
  await disconnectDatabase();
});


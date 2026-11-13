const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, status: true, passwordHash: true }
  });
  console.log('COUNT:', users.length);
  for (const u of users) {
    console.log(u.email, '|', u.role, '|', u.status, '| hash length:', u.passwordHash?.length);
  }
}

main().finally(() => prisma.$disconnect());


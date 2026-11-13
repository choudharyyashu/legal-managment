const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const USERS = [
  {
    name: 'Thomas Bludworth, Esq.',
    email: 't.bludworth@utahslawyers.com',
    role: 'attorney',
    title: 'Litigation Partner',
    initials: 'TB',
    department: 'Civil Litigation',
    billingRate: 550,
  },
  {
    name: 'David Sterling, Esq.',
    email: 'd.sterling@utahslawyers.com',
    role: 'supervisor',
    title: 'Review Counsel',
    initials: 'DS',
    department: 'Practice Management',
    billingRate: 400,
  },
  {
    name: 'Marcus Vance',
    email: 'm.vance@utahslawyers.com',
    role: 'paralegal',
    title: 'Litigation Paralegal',
    initials: 'MV',
    department: 'Litigation Support',
    billingRate: 175,
  },
  {
    name: 'Rachel Adams',
    email: 'r.adams@utahslawyers.com',
    role: 'billing',
    title: 'Trust Accountant',
    initials: 'RA',
    department: 'Finance & Escrow',
    billingRate: 150,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('UtahLaw@2026!', 12);
  let count = await prisma.user.count();

  for (const u of USERS) {
    count++;
    const userCode = `USR-${String(count).padStart(3, '0')}`;
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        title: u.title,
        initials: u.initials,
        department: u.department,
        billingRate: u.billingRate,
        passwordHash,
        status: 'Active',
      },
      create: {
        userCode,
        name: u.name,
        email: u.email,
        role: u.role,
        title: u.title,
        initials: u.initials,
        department: u.department,
        billingRate: u.billingRate,
        passwordHash,
        status: 'Active',
      },
    });
    console.log(`Synced user: ${user.email} (${user.role}) - ID: ${user.id}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


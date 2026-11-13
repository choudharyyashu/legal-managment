import readline from 'readline';
import { prisma } from '../config/database.js';
import { PasswordService } from '../modules/auth/password.service.js';
import { createAuditLog } from '../utils/auditLogger.js';

function promptQuestion(query: string, hidden: boolean = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function parseCliArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (key && value !== undefined) {
        args[key] = value;
      }
    }
  }
  return args;
}

async function createSuperAdmin() {
  console.log('================================================================');
  console.log('HEUGLY & BLUDWORTH - First Super Admin Provisioning Utility');
  console.log('================================================================');

  try {
    const cliArgs = parseCliArgs();

    // 1. Gather credentials from Environment or CLI arguments or Interactive Prompt
    let email = cliArgs.email || process.env.ADMIN_EMAIL;
    let name = cliArgs.name || process.env.ADMIN_NAME;
    let password = cliArgs.password || process.env.ADMIN_PASSWORD;

    if (!email) {
      email = await promptQuestion('Enter Super Admin Work Email (e.g., e.heugly@utahslawyers.com): ');
    }
    if (!name) {
      name = await promptQuestion('Enter Super Admin Full Name [Eleanor Heugly, Esq.]: ');
      if (!name) name = 'Eleanor Heugly, Esq.';
    }
    if (!password) {
      password = await promptQuestion('Enter Secure Password (min 8 chars, 1 uppercase, 1 number, 1 special): ');
    }

    if (!email || !email.includes('@')) {
      console.error('\n[ERROR] A valid email address is required.');
      process.exit(1);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Validate Password Strength
    const strength = PasswordService.validateStrength(password);
    if (!strength.valid) {
      console.error(`\n[ERROR] Password policy violation: ${strength.reason}`);
      process.exit(1);
    }

    // 3. Duplicate Super Admin Protection Check
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      console.warn(`\n[WARNING] A user account with email '${normalizedEmail}' already exists (ID: ${existingUser.id}, Role: ${existingUser.role}).`);
      console.warn('Duplicate admin creation aborted to protect existing credentials.');
      process.exit(0);
    }

    // Check if super_admin role exists in seeded database
    const superAdminRole = await prisma.role.findUnique({
      where: { id: 'super_admin' },
    });

    if (!superAdminRole) {
      console.error('\n[ERROR] The role "super_admin" was not found in the database. Please run "npm run prisma:seed" first.');
      process.exit(1);
    }

    // 4. Hash Password
    console.log('\nGenerating secure bcrypt hash with 12 salt rounds...');
    const passwordHash = await PasswordService.hash(password);

    // 5. Generate User Code
    const count = await prisma.user.count();
    const userCode = `USR-${String(count + 1).padStart(3, '0')}`;

    // 6. Create User Record
    const adminUser = await prisma.user.create({
      data: {
        userCode,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'super_admin',
        title: 'Managing Partner',
        initials: 'EH',
        department: 'Executive Management',
        billingRate: 650.00,
        status: 'Active',
      },
    });

    // 7. Write Immutable Audit Log
    await createAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: 'super_admin',
      action: 'FIRST_SUPER_ADMIN_PROVISIONED',
      resourceType: 'SECURITY',
      resourceId: adminUser.id,
      details: {
        userCode: adminUser.userCode,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        provisionedVia: 'CLI_SCRIPT',
      },
    });

    console.log('\n================================================================');
    console.log('SUCCESS: First Super Admin Created Successfully!');
    console.log('================================================================');
    console.log(`User ID:     ${adminUser.id}`);
    console.log(`User Code:   ${adminUser.userCode}`);
    console.log(`Name:        ${adminUser.name}`);
    console.log(`Email:       ${adminUser.email}`);
    console.log(`Role:        ${adminUser.role}`);
    console.log(`Status:      ${adminUser.status}`);
    console.log('Password:    [SECURELY HASHED - NEVER LOGGED]');
    console.log('================================================================');

    await prisma.$disconnect();
    process.exit(0);
  } catch (err: unknown) {
    console.error('\n[FATAL ERROR] Failed to provision Super Admin:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createSuperAdmin();


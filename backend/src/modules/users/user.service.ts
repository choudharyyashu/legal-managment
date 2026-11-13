import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { PasswordService } from '../auth/password.service.js';
import { AuthService } from '../auth/auth.service.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { CreateUserInput, UpdateUserInput, UserQueryInput } from './user.validation.js';
import { SafeUser } from '../auth/auth.types.js';

export class UserService {
  /**
   * Generates a unique, sequential user code like USR-001, USR-002, etc.
   */
  private static async generateUserCode(): Promise<string> {
    const count = await prisma.user.count();
    let nextNum = count + 1;
    let candidate = `USR-${String(nextNum).padStart(3, '0')}`;

    // Collision check
    while (await prisma.user.findUnique({ where: { userCode: candidate } })) {
      nextNum++;
      candidate = `USR-${String(nextNum).padStart(3, '0')}`;
    }

    return candidate;
  }

  /**
   * Derives initials from full name (e.g., "Eleanor Heugly" -> "EH")
   */
  private static deriveInitials(name: string): string {
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .join('')
      .slice(0, 3)
      .toUpperCase() || 'HB';
  }

  /**
   * Retrieves paginated list of users with filtering and search
   */
  static async getUsers(query: UserQueryInput): Promise<{
    users: SafeUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { search, role, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) where.role = role;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { userCode: { contains: search } },
        { department: { contains: search } },
        { title: { contains: search } },
      ];
    }

    const [total, rawUsers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roleRel: {
            include: {
              permissions: { select: { permissionKey: true } },
            },
          },
        },
      }),
    ]);

    const users = rawUsers.map((u) => {
      const perms = u.roleRel?.permissions.map((p) => p.permissionKey) || [];
      return AuthService.toSafeUser(u, perms);
    });

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves single user by UUID
   */
  static async getUserById(id: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        roleRel: {
          include: {
            permissions: { select: { permissionKey: true } },
          },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('User', 'USER_NOT_FOUND');
    }

    const perms = user.roleRel?.permissions.map((p) => p.permissionKey) || [];
    return AuthService.toSafeUser(user, perms);
  }

  /**
   * Creates a new firm user (Administrative Provisioning)
   */
  static async createUser(
    input: CreateUserInput,
    creatorContext: { userId: string; userName: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<SafeUser> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw AppError.conflict(`A user account with email '${normalizedEmail}' already exists.`, 'EMAIL_EXISTS');
    }

    // Verify role exists and prevent unauthorized privilege escalation
    if (input.role === 'super_admin' && creatorContext.userRole !== 'super_admin') {
      throw AppError.forbidden(
        'Privilege Escalation Blocked: Only an active Super Admin can provision another Super Admin account.',
        'PRIVILEGE_ESCALATION_BLOCKED'
      );
    }

    const roleRecord = await prisma.role.findUnique({
      where: { id: input.role },
      include: { permissions: { select: { permissionKey: true } } },
    });

    if (!roleRecord) {
      throw AppError.badRequest(`Role '${input.role}' does not exist in the system.`, 'INVALID_ROLE');
    }

    const passwordHash = await PasswordService.hash(input.password);
    const userCode = await this.generateUserCode();
    const initials = input.initials || this.deriveInitials(input.name);

    const newUser = await prisma.user.create({
      data: {
        userCode,
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: input.phone?.trim() || null,
        role: input.role,
        title: input.title?.trim() || null,
        initials,
        department: input.department?.trim() || null,
        billingRate: input.billingRate,
        status: input.status,
      },
    });

    const perms = roleRecord.permissions.map((p) => p.permissionKey);

    await createAuditLog({
      userId: creatorContext.userId,
      userName: creatorContext.userName,
      userRole: creatorContext.userRole,
      action: 'USER_CREATED',
      resourceType: 'USER',
      resourceId: newUser.id,
      details: {
        userCode: newUser.userCode,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status,
      },
      ipAddress: creatorContext.ipAddress,
      userAgent: creatorContext.userAgent,
    });

    return AuthService.toSafeUser(newUser, perms);
  }

  /**
   * Updates existing user profile
   */
  static async updateUser(
    id: string,
    input: UpdateUserInput,
    updaterContext: { userId: string; userName: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw AppError.notFound('User', 'USER_NOT_FOUND');
    }

    // Role change check and privilege escalation guard
    let perms: string[] = [];
    if (input.role) {
      if (input.role === 'super_admin' && updaterContext.userRole !== 'super_admin') {
        throw AppError.forbidden(
          'Privilege Escalation Blocked: Only an active Super Admin can promote a user to Super Admin.',
          'PRIVILEGE_ESCALATION_BLOCKED'
        );
      }

      const roleRecord = await prisma.role.findUnique({
        where: { id: input.role },
        include: { permissions: { select: { permissionKey: true } } },
      });
      if (!roleRecord) {
        throw AppError.badRequest(`Role '${input.role}' does not exist.`, 'INVALID_ROLE');
      }
      perms = roleRecord.permissions.map((p) => p.permissionKey);
    } else {
      perms = await AuthService.getRolePermissions(user.role);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.initials !== undefined ? { initials: input.initials } : {}),
        ...(input.department !== undefined ? { department: input.department } : {}),
        ...(input.billingRate !== undefined ? { billingRate: input.billingRate } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });

    await createAuditLog({
      userId: updaterContext.userId,
      userName: updaterContext.userName,
      userRole: updaterContext.userRole,
      action: 'USER_UPDATED',
      resourceType: 'USER',
      resourceId: id,
      details: { changes: input },
      ipAddress: updaterContext.ipAddress,
      userAgent: updaterContext.userAgent,
    });

    return AuthService.toSafeUser(updatedUser, perms);
  }

  /**
   * Activates or deactivates a user account
   */
  static async setUserStatus(
    id: string,
    status: 'Active' | 'Inactive',
    updaterContext: { userId: string; userName: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw AppError.notFound('User', 'USER_NOT_FOUND');
    }

    // Prevent self-deactivation
    if (user.id === updaterContext.userId && status === 'Inactive') {
      throw AppError.badRequest('Administrators cannot deactivate their own user account.', 'SELF_DEACTIVATION_BLOCKED');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
    });

    const perms = await AuthService.getRolePermissions(updatedUser.role);

    await createAuditLog({
      userId: updaterContext.userId,
      userName: updaterContext.userName,
      userRole: updaterContext.userRole,
      action: status === 'Active' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      resourceType: 'USER',
      resourceId: id,
      details: {
        targetUserCode: user.userCode,
        targetEmail: user.email,
        previousStatus: user.status,
        newStatus: status,
      },
      ipAddress: updaterContext.ipAddress,
      userAgent: updaterContext.userAgent,
    });

    return AuthService.toSafeUser(updatedUser, perms);
  }
}


import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { PasswordService } from './password.service.js';
import { TokenService } from './token.service.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { LoginInput, ResetPasswordInput } from './auth.validation.js';
import { LoginResult, SafeUser } from './auth.types.js';
import { config } from '../../config/env.js';

export class AuthService {
  /**
   * Strips sensitive properties from user object to create a SafeUser
   */
  public static toSafeUser(user: any, permissions: string[] = []): SafeUser {
    return {
      id: user.id,
      userCode: user.userCode,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      title: user.title || null,
      initials: user.initials,
      department: user.department || null,
      billingRate: typeof user.billingRate === 'object' && user.billingRate !== null
        ? Number(user.billingRate.toString())
        : Number(user.billingRate || 0),
      status: user.status,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      permissions,
    };
  }

  /**
   * Helper to retrieve all permission keys for a given role from the database
   */
  public static async getRolePermissions(roleId: string): Promise<string[]> {
    const roleRecord = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          select: { permissionKey: true },
        },
      },
    });
    return roleRecord?.permissions.map((p) => p.permissionKey) || [];
  }

  /**
   * Authenticates user with email and password
   */
  static async login(
    input: LoginInput,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<LoginResult> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // 1. Fetch user by email including role relations
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        roleRel: {
          include: {
            permissions: {
              select: { permissionKey: true },
            },
          },
        },
      },
    });

    if (!user) {
      await createAuditLog({
        action: 'USER_LOGIN_FAILED',
        resourceType: 'AUTH',
        details: { email: normalizedEmail, reason: 'USER_NOT_FOUND' },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // 2. Check account status
    if (user.status !== 'Active') {
      await createAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'USER_LOGIN_BLOCKED',
        resourceType: 'AUTH',
        resourceId: user.id,
        details: { email: normalizedEmail, status: user.status },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      throw AppError.forbidden(
        `Account for ${user.name} has been deactivated by the firm Super Admin. Workstation login is blocked.`,
        'ACCOUNT_DEACTIVATED'
      );
    }

    // 3. Verify password hash
    const isPasswordValid = await PasswordService.verify(input.password, user.passwordHash);
    if (!isPasswordValid) {
      await createAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'USER_LOGIN_FAILED',
        resourceType: 'AUTH',
        resourceId: user.id,
        details: { email: normalizedEmail, reason: 'INVALID_PASSWORD' },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // 4. Extract permissions
    const permissions = user.roleRel?.permissions.map((p) => p.permissionKey) || [];

    // 5. Update lastLoginAt
    const now = new Date();
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: now },
    });

    // 6. Generate tokens
    const accessToken = TokenService.generateAccessToken({
      userId: user.id,
      userCode: user.userCode,
      email: user.email,
      role: user.role,
      permissions,
    });

    const { token: refreshToken } = TokenService.generateRefreshToken(user.id);

    // 7. Audit Log
    await createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN_SUCCESS',
      resourceType: 'AUTH',
      resourceId: user.id,
      details: {
        email: user.email,
        role: user.role,
        rememberMe: input.rememberMe,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    const safeUser = this.toSafeUser(user, permissions);
    safeUser.lastLoginAt = now;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
      permissions,
    };
  }

  /**
   * Refreshes access token with refresh token rotation
   */
  static async refresh(
    refreshTokenString: string,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
    if (!refreshTokenString) {
      throw AppError.unauthorized('Refresh token is required', 'REFRESH_TOKEN_MISSING');
    }

    const payload = TokenService.verifyRefreshToken(refreshTokenString);

    // Invalidate old refresh token (Token Rotation Safeguard)
    TokenService.revoke(payload.tokenId);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        roleRel: {
          include: {
            permissions: { select: { permissionKey: true } },
          },
        },
      },
    });

    if (!user || user.status !== 'Active') {
      throw AppError.unauthorized('User session is no longer active or user was disabled', 'USER_INACTIVE');
    }

    const permissions = user.roleRel?.permissions.map((p) => p.permissionKey) || [];

    const newAccessToken = TokenService.generateAccessToken({
      userId: user.id,
      userCode: user.userCode,
      email: user.email,
      role: user.role,
      permissions,
    });

    const { token: newRefreshToken } = TokenService.generateRefreshToken(user.id, payload.tokenVersion + 1);

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'TOKEN_REFRESH_SUCCESS',
      resourceType: 'AUTH',
      resourceId: user.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: this.toSafeUser(user, permissions),
    };
  }

  /**
   * Logs out user and invalidates tokens
   */
  static async logout(
    refreshTokenString?: string,
    context?: { userId?: string; ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    if (refreshTokenString) {
      try {
        const payload = TokenService.verifyRefreshToken(refreshTokenString);
        TokenService.revoke(payload.tokenId);
        TokenService.revoke(refreshTokenString);
      } catch {
        // If expired or invalid, still register revocation
        TokenService.revoke(refreshTokenString);
      }
    }

    if (context?.userId) {
      await createAuditLog({
        userId: context.userId,
        action: 'USER_LOGOUT',
        resourceType: 'AUTH',
        resourceId: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    }
  }

  /**
   * Retrieves profile of currently authenticated user with full permissions
   */
  static async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleRel: {
          include: {
            permissions: { select: { permissionKey: true } },
          },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('User account', 'USER_NOT_FOUND');
    }

    const permissions = user.roleRel?.permissions.map((p) => p.permissionKey) || [];
    return this.toSafeUser(user, permissions);
  }

  /**
   * Initiates forgot-password workflow
   */
  static async forgotPassword(
    email: string,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<{ message: string; resetToken?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let resetToken: string | undefined = undefined;

    if (user && user.status === 'Active') {
      resetToken = TokenService.generatePasswordResetToken(user.id, user.email);

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'PASSWORD_RESET_REQUESTED',
        resourceType: 'AUTH',
        resourceId: user.id,
        details: { email: normalizedEmail },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    }

    // Always return benign message to prevent email enumeration attacks
    const response: { message: string; resetToken?: string } = {
      message: 'If an active account exists with that email, a password reset link has been dispatched.',
    };

    // Expose reset token in development environment only for automated integration testing
    if (config.nodeEnv !== 'production' && resetToken) {
      response.resetToken = resetToken;
    }

    return response;
  }

  /**
   * Resets password using valid reset token
   */
  static async resetPassword(
    input: ResetPasswordInput,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<{ message: string }> {
    const payload = TokenService.verifyPasswordResetToken(input.token);

    const strengthCheck = PasswordService.validateStrength(input.newPassword);
    if (!strengthCheck.valid) {
      throw AppError.badRequest(strengthCheck.reason || 'Password does not meet complexity requirements');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.status !== 'Active') {
      throw AppError.badRequest('Unable to reset password for this account', 'USER_INACTIVE');
    }

    const passwordHash = await PasswordService.hash(input.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate reset token
    TokenService.revoke(input.token);

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'PASSWORD_RESET_COMPLETED',
      resourceType: 'AUTH',
      resourceId: user.id,
      details: { email: user.email },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return { message: 'Password has been updated successfully. Please log in with your new credentials.' };
  }
}


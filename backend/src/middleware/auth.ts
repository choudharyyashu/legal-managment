import { Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { TokenService } from '../modules/auth/token.service.js';
import { AuthenticatedRequest } from '../modules/auth/auth.types.js';
import { AppError } from '../errors/AppError.js';

/**
 * Authentication Middleware: Validates Bearer Access Token with Immediate Status Revocation
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw AppError.unauthorized('Authentication token missing. Please sign in.', 'TOKEN_MISSING');
    }

    const payload = TokenService.verifyAccessToken(token);

    // Immediate Revocation & Account Status Check
    // Prevents deactivated employees from using unexpired (up to 15m) access tokens
    const liveUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true, role: true },
    });

    if (!liveUser) {
      throw AppError.unauthorized('User account associated with this token no longer exists.', 'USER_NOT_FOUND');
    }

    if (liveUser.status !== 'Active') {
      throw AppError.forbidden(
        'Account deactivated. Immediate session revocation enforced.',
        'ACCOUNT_DEACTIVATED'
      );
    }

    req.user = {
      id: payload.userId,
      userCode: payload.userCode,
      email: payload.email,
      role: liveUser.role,
      permissions: payload.permissions || [],
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role-Based Access Control Middleware
 * Restricts endpoint to specific system roles (e.g. ['super_admin', 'attorney'])
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
          'INSUFFICIENT_ROLE'
        )
      );
    }

    next();
  };
}

/**
 * Permission-Based Access Control Middleware
 * Verifies that user has the specified permission key from the 193 database permissions
 * Super Admin accounts automatically pass all permission gates
 */
export function requirePermission(permission: string | string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    // Super Admin has universal access across all modules
    if (req.user.role === 'super_admin') {
      return next();
    }

    const requiredKeys = Array.isArray(permission) ? permission : [permission];
    const userPermissions = new Set(req.user.permissions);

    const hasAll = requiredKeys.every((key) => userPermissions.has(key));

    if (!hasAll) {
      return next(
        AppError.forbidden(
          `Access denied: Missing required permission [${requiredKeys.join(', ')}]`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
}


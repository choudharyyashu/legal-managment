import { Router, Response, NextFunction } from 'express';
import { ClientPortalController } from './portal.controller.js';
import { TokenService } from '../auth/token.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';
import { AppError } from '../../errors/AppError.js';

const router = Router();

/**
 * Client Portal Auth Middleware
 * Validates JWT token and enforces role: 'client'.
 */
export function requireClientPortalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.portalAccessToken) {
      token = req.cookies.portalAccessToken;
    }

    if (!token) {
      throw AppError.unauthorized('Client portal session missing or expired. Please sign in.', 'PORTAL_TOKEN_MISSING');
    }

    const payload = TokenService.verifyAccessToken(token);

    if (payload.role !== 'client') {
      throw AppError.forbidden('Access denied. Staff credentials cannot be used on client portal routes.', 'CLIENT_ROLE_REQUIRED');
    }

    req.user = {
      id: payload.userId,
      userCode: payload.userCode,
      email: payload.email,
      role: 'client',
      permissions: payload.permissions || ['portal:read'],
    };

    next();
  } catch (err) {
    next(err);
  }
}

// Public Portal Route
router.post('/auth/login', ClientPortalController.login);

// Protected Client Portal Routes
router.use(requireClientPortalAuth as any);

router.get('/auth/me', ClientPortalController.getMe as any);
router.get('/matters', ClientPortalController.getMatters as any);
router.get('/matters/:matterId', ClientPortalController.getMatterDetail as any);
router.get('/matters/:matterId/documents', ClientPortalController.getMatterDocuments as any);
router.post('/matters/:matterId/documents/upload', ClientPortalController.uploadDocument as any);
router.get('/matters/:matterId/messages', ClientPortalController.getMatterMessages as any);
router.post('/matters/:matterId/messages', ClientPortalController.sendMatterMessage as any);
router.post('/documents/:documentId/sign', ClientPortalController.signDocument as any);
router.get('/invoices', ClientPortalController.getInvoices as any);
router.get('/payments', ClientPortalController.getPayments as any);

export default router;

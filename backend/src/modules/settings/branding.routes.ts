import { Router } from 'express';
import { BrandingController } from './branding.controller.js';
import { requireAuth, requireAnyPermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { updateFirmBrandingSchema } from './branding.validation.js';

export const brandingRouter = Router();

brandingRouter.use(requireAuth);

// All authenticated firm personnel can view active branding (for invoices, pleadings, headers)
brandingRouter.get(
  '/branding',
  BrandingController.getFirmBranding
);

// Only authorized administrators can modify or reset branding settings
brandingRouter.put(
  '/branding',
  requireAnyPermission(['branding:manage', 'settings:manage']),
  validateRequest({ body: updateFirmBrandingSchema }),
  BrandingController.updateFirmBranding
);

brandingRouter.post(
  '/branding/reset',
  requireAnyPermission(['branding:manage', 'settings:manage']),
  BrandingController.resetFirmBranding
);

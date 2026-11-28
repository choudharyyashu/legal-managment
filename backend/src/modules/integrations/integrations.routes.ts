/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * External Integrations Routes (F05)
 */

import { Router } from 'express';
import { IntegrationsController } from './integrations.controller.js';
import { requireAuth, requireAnyPermission } from '../../middleware/auth.js';

export const integrationsRouter = Router();

integrationsRouter.use(requireAuth);

integrationsRouter.get(
  '/status',
  requireAnyPermission(['integrations:view', 'cosmolex:view', 'settings:view', 'system:admin']),
  IntegrationsController.getStatuses
);

integrationsRouter.post(
  '/:id/test',
  requireAnyPermission(['integrations:manage', 'cosmolex:export', 'settings:manage', 'system:admin']),
  IntegrationsController.testConnection
);

integrationsRouter.post(
  '/:id/config',
  requireAnyPermission(['integrations:manage', 'settings:manage', 'system:admin']),
  IntegrationsController.saveConfig
);

integrationsRouter.post(
  '/:id/disconnect',
  requireAnyPermission(['integrations:manage', 'settings:manage', 'system:admin']),
  IntegrationsController.disconnect
);

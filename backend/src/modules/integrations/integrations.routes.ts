/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * External Integrations Routes (F05)
 */

import { Router } from 'express';
import { IntegrationsController } from './integrations.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const integrationsRouter = Router();

integrationsRouter.use(requireAuth);

integrationsRouter.get('/status', IntegrationsController.getStatuses);
integrationsRouter.post('/:id/test', IntegrationsController.testConnection);
integrationsRouter.post('/:id/disconnect', IntegrationsController.disconnect);

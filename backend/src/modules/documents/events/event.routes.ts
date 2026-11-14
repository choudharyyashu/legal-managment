/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Event-Driven Auto Draft Routes (Phase 4)
 */

import { Router } from 'express';
import { DocumentEventController } from './event.controller.js';
import { requireAuth, requirePermission } from '../../../middleware/auth.js';

export const documentEventRouter = Router();

documentEventRouter.use(requireAuth);

documentEventRouter.get(
  '/catalog',
  requirePermission('documents:view'),
  DocumentEventController.getEventCatalog
);

documentEventRouter.post(
  '/trigger',
  requirePermission('documents:upload'),
  DocumentEventController.triggerEvent
);


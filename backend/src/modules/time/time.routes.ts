import { Router } from 'express';
import { TimeController } from './time.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createTimeEntrySchema,
  updateTimeEntrySchema,
  approveTimeEntrySchema,
  timeQuerySchema,
} from './time.validation.js';

export const timeRouter = Router();

timeRouter.use(requireAuth);

timeRouter.get(
  '/entries',
  requirePermission('billing:view'),
  validateRequest({ query: timeQuerySchema }),
  TimeController.getTimeEntries
);

timeRouter.get(
  '/entries/:id',
  requirePermission('billing:view'),
  TimeController.getTimeEntryById
);

timeRouter.post(
  '/entries',
  requirePermission('billing:edit'),
  validateRequest({ body: createTimeEntrySchema }),
  TimeController.createTimeEntry
);

timeRouter.put(
  '/entries/:id',
  requirePermission('billing:edit'),
  validateRequest({ body: updateTimeEntrySchema }),
  TimeController.updateTimeEntry
);

timeRouter.patch(
  '/entries/:id/approve',
  requirePermission('billing:edit'),
  validateRequest({ body: approveTimeEntrySchema }),
  TimeController.approveTimeEntry
);

timeRouter.get(
  '/suggested-billing',
  requirePermission('billing:view'),
  TimeController.getSuggestedBilling
);

timeRouter.post(
  '/suggested-billing/:id/convert',
  requirePermission('billing:edit'),
  TimeController.convertSuggestedBilling
);

timeRouter.delete(
  '/entries/:id',
  requirePermission('billing:edit'),
  TimeController.deleteTimeEntry
);


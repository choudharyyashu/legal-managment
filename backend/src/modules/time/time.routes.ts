import { Router } from 'express';
import { TimeController } from './time.controller.js';
import { requireAuth, requirePermission, requireAnyPermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createTimeEntrySchema,
  updateTimeEntrySchema,
  approveTimeEntrySchema,
  timeQuerySchema,
  reviewSlotQuerySchema,
  markSlotReviewedSchema,
  reviewFlagQuerySchema,
  updateReviewFlagStatusSchema,
} from './time.validation.js';

export const timeRouter = Router();

timeRouter.use(requireAuth);

timeRouter.get(
  '/entries',
  requireAnyPermission(['time:log', 'time:review_own', 'time:review_team', 'billing:hours_view']),
  validateRequest({ query: timeQuerySchema }),
  TimeController.getTimeEntries
);

timeRouter.get(
  '/entries/:id',
  requireAnyPermission(['time:log', 'time:review_own', 'time:review_team', 'billing:hours_view']),
  TimeController.getTimeEntryById
);

timeRouter.post(
  '/entries',
  requirePermission('time:log'),
  validateRequest({ body: createTimeEntrySchema }),
  TimeController.createTimeEntry
);

timeRouter.put(
  '/entries/:id',
  requirePermission('time:log'),
  validateRequest({ body: updateTimeEntrySchema }),
  TimeController.updateTimeEntry
);

timeRouter.patch(
  '/entries/:id/approve',
  requirePermission('time:approve'),
  validateRequest({ body: approveTimeEntrySchema }),
  TimeController.approveTimeEntry
);

timeRouter.get(
  '/suggested-billing',
  requirePermission('time:suggested_view'),
  TimeController.getSuggestedBilling
);

timeRouter.post(
  '/suggested-billing/:id/convert',
  requirePermission('time:log'),
  TimeController.convertSuggestedBilling
);

timeRouter.delete(
  '/entries/:id',
  requirePermission('time:log'),
  TimeController.deleteTimeEntry
);

timeRouter.get(
  '/review-slots',
  requireAnyPermission(['time:log', 'time:review_own', 'time:review_team', 'billing:hours_view']),
  validateRequest({ query: reviewSlotQuerySchema }),
  TimeController.getReviewSlots
);

timeRouter.post(
  '/review-slots/:id/reviewed',
  requireAnyPermission(['time:log', 'time:review_own', 'time:review_team', 'time:approve']),
  validateRequest({ body: markSlotReviewedSchema }),
  TimeController.markReviewSlotCompleted
);

timeRouter.get(
  '/review-flags',
  requireAnyPermission(['time:log', 'time:review_own', 'time:review_team', 'billing:hours_view']),
  validateRequest({ query: reviewFlagQuerySchema }),
  TimeController.getReviewFlags
);

timeRouter.patch(
  '/review-flags/:id/status',
  requireAnyPermission(['time:log', 'time:review_own', 'time:review_team', 'time:approve']),
  validateRequest({ body: updateReviewFlagStatusSchema }),
  TimeController.updateReviewFlagStatus
);


import { Router } from 'express';
import { MatterController } from './matter.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createMatterSchema,
  updateMatterSchema,
  updateMatterStatusSchema,
  assignStaffSchema,
  matterQuerySchema,
} from './matter.validation.js';

export const matterRouter = Router();

// Apply requireAuth globally across all matter endpoints
matterRouter.use(requireAuth);

matterRouter.get(
  '/',
  requirePermission('matters:view'),
  validateRequest({ query: matterQuerySchema }),
  MatterController.getMatters
);

matterRouter.get(
  '/:id',
  requirePermission('matters:view'),
  MatterController.getMatterById
);

matterRouter.post(
  '/',
  requirePermission('matters:create'),
  validateRequest({ body: createMatterSchema }),
  MatterController.createMatter
);

matterRouter.put(
  '/:id',
  requirePermission('matters:edit'),
  validateRequest({ body: updateMatterSchema }),
  MatterController.updateMatter
);

matterRouter.patch(
  '/:id/status',
  requirePermission('matters:edit'),
  validateRequest({ body: updateMatterStatusSchema }),
  MatterController.updateStatus
);

matterRouter.post(
  '/:id/staff',
  requirePermission('matters:edit'),
  validateRequest({ body: assignStaffSchema }),
  MatterController.assignStaff
);

matterRouter.delete(
  '/:id/staff/:userId',
  requirePermission('matters:edit'),
  MatterController.removeStaff
);


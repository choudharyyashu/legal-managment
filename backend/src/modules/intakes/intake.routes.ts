import { Router } from 'express';
import { IntakeController } from './intake.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createIntakeSchema,
  updateIntakeSchema,
  clearConflictSchema,
  convertToIntakeClientSchema,
  convertToIntakeMatterSchema,
  intakeQuerySchema,
} from './intake.validation.js';

export const intakeRouter = Router();

intakeRouter.use(requireAuth);

intakeRouter.get(
  '/',
  requirePermission('intakes:view'),
  validateRequest({ query: intakeQuerySchema }),
  IntakeController.getIntakes
);

intakeRouter.get(
  '/:id',
  requirePermission('intakes:view'),
  IntakeController.getIntakeById
);

intakeRouter.post(
  '/',
  requirePermission('intakes:create'),
  validateRequest({ body: createIntakeSchema }),
  IntakeController.createIntake
);

intakeRouter.put(
  '/:id',
  requirePermission('intakes:edit'),
  validateRequest({ body: updateIntakeSchema }),
  IntakeController.updateIntake
);

intakeRouter.post(
  '/:id/conflict-check',
  requirePermission('intakes:view'),
  IntakeController.runConflictCheck
);

intakeRouter.post(
  '/:id/clear-conflict',
  requirePermission('intakes:edit'),
  validateRequest({ body: clearConflictSchema }),
  IntakeController.clearConflict
);

intakeRouter.post(
  '/:id/convert-client',
  requirePermission('clients:create'),
  validateRequest({ body: convertToIntakeClientSchema }),
  IntakeController.convertToClient
);

intakeRouter.post(
  '/:id/convert-matter',
  requirePermission('matters:create'),
  validateRequest({ body: convertToIntakeMatterSchema }),
  IntakeController.convertToMatter
);

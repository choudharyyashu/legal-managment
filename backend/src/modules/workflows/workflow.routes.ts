import { Router } from 'express';
import { WorkflowController } from './workflow.controller.js';
import { requireAuth, requireAnyPermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  stageQuerySchema,
  createStageSchema,
  updateStageSchema,
  updateStageChecklistSchema,
  addAutomationRuleSchema,
  toggleMatterChecklistSchema,
} from './workflow.validation.js';

export const workflowRouter = Router();

workflowRouter.use(requireAuth);

// 1. Get all workflow stages across practice areas (database-driven)
workflowRouter.get(
  '/stages',
  validateRequest({ query: stageQuerySchema }),
  WorkflowController.getWorkflowStages
);

// 2. Get single stage by ID
workflowRouter.get(
  '/stages/:id',
  WorkflowController.getStageById
);

// 3. Create a new stage (Admin / Template Manager RBAC only)
workflowRouter.post(
  '/stages',
  requireAnyPermission(['templates:manage', 'admin:manage']),
  validateRequest({ body: createStageSchema }),
  WorkflowController.createStage
);

// 4. Update full stage (Admin / Template Manager RBAC only)
workflowRouter.put(
  '/stages/:id',
  requireAnyPermission(['templates:manage', 'admin:manage']),
  validateRequest({ body: updateStageSchema }),
  WorkflowController.updateStage
);

// 5. Update master checklist SOP items for a stage (Admin / Template Manager RBAC only)
workflowRouter.put(
  '/stages/:id/checklist',
  requireAnyPermission(['templates:manage', 'admin:manage']),
  validateRequest({ body: updateStageChecklistSchema }),
  WorkflowController.updateStageChecklist
);

// 6. Add automation rule to stage autoTasks (Admin / Template Manager RBAC only)
workflowRouter.post(
  '/stages/:id/rules',
  requireAnyPermission(['templates:manage', 'admin:manage']),
  validateRequest({ body: addAutomationRuleSchema }),
  WorkflowController.addAutomationRule
);

// 7. Get individual matter checklist progress
workflowRouter.get(
  '/matters/:id/checklist',
  WorkflowController.getMatterChecklistProgress
);

// 8. Record/toggle matter checklist gatekeeper completion
workflowRouter.post(
  '/matters/:id/checklist/toggle',
  validateRequest({ body: toggleMatterChecklistSchema }),
  WorkflowController.toggleMatterChecklist
);

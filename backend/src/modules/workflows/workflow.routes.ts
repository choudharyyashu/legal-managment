import { Router } from 'express';
import { WorkflowController } from './workflow.controller.js';
import { requireAuth, requireAnyPermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  stageQuerySchema,
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

// 3. Update master checklist SOP items for a stage (requires admin or template manager role)
workflowRouter.put(
  '/stages/:id/checklist',
  requireAnyPermission(['templates:manage', 'matters:edit', 'admin:manage']),
  validateRequest({ body: updateStageChecklistSchema }),
  WorkflowController.updateStageChecklist
);

// 4. Add automation rule to stage autoTasks
workflowRouter.post(
  '/stages/:id/rules',
  requireAnyPermission(['templates:manage', 'matters:edit', 'admin:manage']),
  validateRequest({ body: addAutomationRuleSchema }),
  WorkflowController.addAutomationRule
);

// 5. Get individual matter checklist progress
workflowRouter.get(
  '/matters/:id/checklist',
  WorkflowController.getMatterChecklistProgress
);

// 6. Record/toggle matter checklist gatekeeper completion
workflowRouter.post(
  '/matters/:id/checklist/toggle',
  validateRequest({ body: toggleMatterChecklistSchema }),
  WorkflowController.toggleMatterChecklist
);

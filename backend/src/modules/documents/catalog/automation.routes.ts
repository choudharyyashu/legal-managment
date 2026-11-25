import { Router } from 'express';
import { AutomationController } from './automation.controller.js';
import { requireAuth, requirePermission } from '../../../middleware/auth.js';

export const automationRouter = Router();

automationRouter.use(requireAuth);

automationRouter.get(
  '/summary',
  requirePermission('documents:view'),
  AutomationController.getSummary
);

automationRouter.get(
  '/',
  requirePermission('documents:view'),
  AutomationController.listAutomations
);

automationRouter.post(
  '/materialize',
  requirePermission('templates:manage'),
  AutomationController.materializeCatalog
);

automationRouter.get(
  '/:catalogId',
  requirePermission('documents:view'),
  AutomationController.getAutomationById
);

automationRouter.post(
  '/:catalogId/trigger',
  requirePermission('documents:upload'),
  AutomationController.triggerAutomation
);

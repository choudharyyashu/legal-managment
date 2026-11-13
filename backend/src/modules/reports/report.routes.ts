import { Router } from 'express';
import { ReportController } from './report.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';

export const reportRouter = Router();

reportRouter.use(requireAuth);

reportRouter.get(
  '/dashboard',
  requirePermission('users:view'),
  ReportController.getDashboardSummary
);

reportRouter.get(
  '/ar-aging',
  requirePermission('billing:view'),
  ReportController.getArAging
);

import { Router } from 'express';
import { ReportController } from './report.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';

export const reportRouter = Router();

reportRouter.use(requireAuth);

reportRouter.get(
  '/dashboard',
  requirePermission('dashboard:view'),
  ReportController.getDashboardSummary
);

reportRouter.get(
  '/ar-aging',
  requirePermission('reports:financial_view'),
  ReportController.getArAging
);


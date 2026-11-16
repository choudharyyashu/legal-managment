/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Personal Injury Routes
 */

import { Router } from 'express';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { PersonalInjuryController } from './pi.controller.js';
import { signAuthorizationSchema } from './pi.validation.js';

export const piRouter = Router();

piRouter.use(requireAuth);

piRouter.get('/matters/:matterId/incident', PersonalInjuryController.getIncident);
piRouter.post('/matters/:matterId/incident', PersonalInjuryController.saveIncident);

piRouter.get('/matters/:matterId/providers', PersonalInjuryController.getProviders);
piRouter.post('/matters/:matterId/providers', PersonalInjuryController.addProvider);

piRouter.get('/matters/:matterId/insurance', PersonalInjuryController.getInsurance);
piRouter.post('/matters/:matterId/insurance', PersonalInjuryController.createInsurance);

piRouter.get('/matters/:matterId/demands', PersonalInjuryController.getDemands);
piRouter.post('/matters/:matterId/demands', PersonalInjuryController.createDemand);

// Liens & Subrogation
piRouter.get('/matters/:matterId/liens', PersonalInjuryController.getLiens);
piRouter.post('/matters/:matterId/liens', PersonalInjuryController.createLien);
piRouter.patch('/matters/:matterId/liens/:lienId', PersonalInjuryController.updateLien);

// Client Damages, Diagnostics & Wage Loss
piRouter.get('/matters/:matterId/damages', PersonalInjuryController.getDamages);
piRouter.post('/matters/:matterId/damages', PersonalInjuryController.createDamage);

// Settlement Calculations & Disbursements
piRouter.get('/matters/:matterId/settlements', PersonalInjuryController.getSettlements);
piRouter.post('/matters/:matterId/settlements', PersonalInjuryController.createSettlement);

// Vendors & Case Vendor Assignments
piRouter.get('/vendors', PersonalInjuryController.getVendors);
piRouter.post('/vendors', PersonalInjuryController.createVendor);
piRouter.get('/matters/:matterId/vendors', PersonalInjuryController.getVendorAssignments);
piRouter.post('/matters/:matterId/vendors', PersonalInjuryController.createVendorAssignment);

// Aggregated PI Dashboard Metrics
piRouter.get('/dashboard-metrics', PersonalInjuryController.getPIDashboardMetrics);

piRouter.post('/records-requests/:id/incomplete', PersonalInjuryController.markRecordsIncomplete);
piRouter.post('/matters/:matterId/records-requests/:id/incomplete', PersonalInjuryController.markRecordsIncomplete);

// Medical Authorization Signature Evidence Endpoint
piRouter.post(
  '/matters/:matterId/records-requests/:requestId/sign-authorization',
  requirePermission('matters:edit'),
  validateRequest({ body: signAuthorizationSchema }),
  PersonalInjuryController.signAuthorization
);

// Records Request Status Update (Enforces Authorization Readiness Gate)
piRouter.patch(
  '/matters/:matterId/records-requests/:requestId/status',
  requirePermission('matters:edit'),
  PersonalInjuryController.updateRecordRequestStatus
);

// Matter PI Workflow Tasks & Reminders Inspector
piRouter.get(
  '/matters/:matterId/workflow/tasks',
  requirePermission('matters:view'),
  PersonalInjuryController.getMatterWorkflowTasks
);

piRouter.get(
  '/matters/:matterId/pi-tasks',
  requirePermission('matters:view'),
  PersonalInjuryController.getMatterWorkflowTasks
);

// Scheduled Reminders & Overdue Processing Endpoints
piRouter.post(
  '/tasks/process-reminders',
  requirePermission('tasks:edit'),
  PersonalInjuryController.processScheduledReminders
);

piRouter.post(
  '/tasks/process-overdue',
  requirePermission('tasks:edit'),
  PersonalInjuryController.processOverdueTasks
);

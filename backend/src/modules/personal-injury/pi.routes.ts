/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Personal Injury Routes
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { PersonalInjuryController } from './pi.controller.js';

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

piRouter.post('/records-requests/:id/incomplete', PersonalInjuryController.markRecordsIncomplete);

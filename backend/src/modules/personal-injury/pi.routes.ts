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

piRouter.post('/records-requests/:id/incomplete', PersonalInjuryController.markRecordsIncomplete);

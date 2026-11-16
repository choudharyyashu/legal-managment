/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Probate Routes
 */

import { Router } from 'express';
import { ProbateController } from './probate.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const probateRouter = Router();

// Enforce authentication
probateRouter.use(requireAuth);

probateRouter.get('/matter/:matterId', ProbateController.getProbateCase);
probateRouter.post('/matter/:matterId', ProbateController.saveProbateCase);

probateRouter.get('/matter/:matterId/beneficiaries', ProbateController.getBeneficiaries);
probateRouter.post('/matter/:matterId/beneficiaries', ProbateController.createBeneficiary);

probateRouter.get('/matter/:matterId/assets', ProbateController.getAssets);
probateRouter.post('/matter/:matterId/assets', ProbateController.createAsset);

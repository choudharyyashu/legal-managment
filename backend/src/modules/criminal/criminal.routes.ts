/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Criminal Routes
 */

import { Router } from 'express';
import { CriminalController } from './criminal.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const criminalRouter = Router();

// Enforce authentication
criminalRouter.use(requireAuth);

criminalRouter.get('/matter/:matterId', CriminalController.getCriminalCase);
criminalRouter.post('/matter/:matterId', CriminalController.saveCriminalCase);

criminalRouter.get('/matter/:matterId/charges', CriminalController.getCharges);
criminalRouter.post('/matter/:matterId/charges', CriminalController.createCharge);

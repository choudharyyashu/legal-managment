/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Immigration Routes
 */

import { Router } from 'express';
import { ImmigrationController } from './immigration.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const immigrationRouter = Router();

// Enforce authentication
immigrationRouter.use(requireAuth);

immigrationRouter.get('/matter/:matterId', ImmigrationController.getImmigrationCase);
immigrationRouter.post('/matter/:matterId', ImmigrationController.saveImmigrationCase);

immigrationRouter.get('/matter/:matterId/receipts', ImmigrationController.getReceipts);
immigrationRouter.post('/matter/:matterId/receipts', ImmigrationController.createReceipt);

immigrationRouter.get('/matter/:matterId/parties', ImmigrationController.getParties);
immigrationRouter.post('/matter/:matterId/parties', ImmigrationController.createParty);

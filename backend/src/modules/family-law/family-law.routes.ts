/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Family Law Routes
 */

import { Router } from 'express';
import { FamilyLawController } from './family-law.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const familyLawRouter = Router();

// Enforce authentication
familyLawRouter.use(requireAuth);

familyLawRouter.get('/matter/:matterId', FamilyLawController.getFamilyLawCase);
familyLawRouter.post('/matter/:matterId', FamilyLawController.saveFamilyLawCase);

familyLawRouter.get('/matter/:matterId/orders', FamilyLawController.getOrders);
familyLawRouter.post('/matter/:matterId/orders', FamilyLawController.createOrder);

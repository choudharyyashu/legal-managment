/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Bankruptcy Routes
 */

import { Router } from 'express';
import { BankruptcyController } from './bankruptcy.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const bankruptcyRouter = Router();

// Enforce authentication
bankruptcyRouter.use(requireAuth);

bankruptcyRouter.get('/matter/:matterId', BankruptcyController.getBankruptcyCase);
bankruptcyRouter.post('/matter/:matterId', BankruptcyController.saveBankruptcyCase);

bankruptcyRouter.get('/matter/:matterId/creditors', BankruptcyController.getCreditors);
bankruptcyRouter.post('/matter/:matterId/creditors', BankruptcyController.createCreditor);

bankruptcyRouter.get('/matter/:matterId/schedules', BankruptcyController.getSchedules);
bankruptcyRouter.post('/matter/:matterId/schedules', BankruptcyController.createScheduleItem);

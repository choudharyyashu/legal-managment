/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Appeals Routes
 */

import { Router } from 'express';
import { AppealsController } from './appeals.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const appealsRouter = Router();

// Enforce authentication
appealsRouter.use(requireAuth);

appealsRouter.get('/matter/:matterId', AppealsController.getAppealsCase);
appealsRouter.post('/matter/:matterId', AppealsController.saveAppealsCase);

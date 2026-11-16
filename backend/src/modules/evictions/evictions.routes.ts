/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Evictions Routes
 */

import { Router } from 'express';
import { EvictionsController } from './evictions.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const evictionsRouter = Router();

// Enforce authentication
evictionsRouter.use(requireAuth);

evictionsRouter.get('/matter/:matterId', EvictionsController.getEvictionsCase);
evictionsRouter.post('/matter/:matterId', EvictionsController.saveEvictionsCase);

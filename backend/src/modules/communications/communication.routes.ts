/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Communications Routes
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { CommunicationController } from './communication.controller.js';

export const communicationRouter = Router();

communicationRouter.use(requireAuth);

communicationRouter.get('/', CommunicationController.getCommunications);
communicationRouter.post('/', CommunicationController.createCommunication);
communicationRouter.get('/unmatched', CommunicationController.getUnmatchedQueue);
communicationRouter.post('/unmatched/:id/match', CommunicationController.matchCommunication);

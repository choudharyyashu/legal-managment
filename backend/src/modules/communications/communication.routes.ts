/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Communications Routes - Enhanced for Priority 3
 */

import { Router } from 'express';
import { requireAuth, requireAnyPermission } from '../../middleware/auth.js';
import { CommunicationController } from './communication.controller.js';

export const communicationRouter = Router();

communicationRouter.use(requireAuth);

// 1. Core communication retrieval & creation
communicationRouter.get('/', CommunicationController.getCommunications);
communicationRouter.post('/', CommunicationController.createCommunication);

// 2. Unmatched queues & manual matter matching
communicationRouter.get('/unmatched', CommunicationController.getUnmatchedQueue);
communicationRouter.post('/unmatched/:id/match', CommunicationController.matchCommunication);

// 3. Provider-independent communication ingestion (Calls, SMS, Outlook Emails)
communicationRouter.post('/ingest', CommunicationController.ingestCommunication);

// 4. Attorney review & billing time tracking
communicationRouter.post(
  '/:id/review-billing',
  requireAnyPermission(['billing:create', 'matters:edit', 'admin:manage']),
  CommunicationController.reviewAndRecordBilling
);

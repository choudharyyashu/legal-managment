/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Litigation Routes
 */

import { Router } from 'express';
import { LitigationController } from './litigation.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const litigationRouter = Router();

// Enforce authentication on all litigation endpoints
litigationRouter.use(requireAuth);

// Case Overview & Record
litigationRouter.get('/matter/:matterId', LitigationController.getLitigationCase);
litigationRouter.post('/matter/:matterId', LitigationController.saveLitigationCase);

// Hearings
litigationRouter.get('/matter/:matterId/hearings', LitigationController.getHearings);
litigationRouter.post('/matter/:matterId/hearings', LitigationController.createHearing);

// Discovery
litigationRouter.get('/matter/:matterId/discovery', LitigationController.getDiscovery);
litigationRouter.post('/matter/:matterId/discovery', LitigationController.createDiscovery);

// Pleadings
litigationRouter.get('/matter/:matterId/pleadings', LitigationController.getPleadings);
litigationRouter.post('/matter/:matterId/pleadings', LitigationController.createPleading);

// Trial Notebook
litigationRouter.get('/matter/:matterId/trial-notebook', LitigationController.getTrialNotebook);
litigationRouter.post('/matter/:matterId/trial-notebook', LitigationController.createTrialNotebookItem);

import { Router } from 'express';
import { ClientController } from './client.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createClientSchema,
  updateClientSchema,
  updateClientStatusSchema,
  clientQuerySchema,
} from './client.validation.js';

export const clientRouter = Router();

// Apply requireAuth globally across all client endpoints
clientRouter.use(requireAuth);

clientRouter.get(
  '/',
  requirePermission('clients:view'),
  validateRequest({ query: clientQuerySchema }),
  ClientController.getClients
);

clientRouter.get(
  '/:id',
  requirePermission('clients:view'),
  ClientController.getClientById
);

clientRouter.get(
  '/:id/matters',
  requirePermission('clients:view'),
  ClientController.getClientMatters
);

clientRouter.post(
  '/',
  requirePermission('clients:create'),
  validateRequest({ body: createClientSchema }),
  ClientController.createClient
);

clientRouter.put(
  '/:id',
  requirePermission('clients:edit'),
  validateRequest({ body: updateClientSchema }),
  ClientController.updateClient
);

clientRouter.patch(
  '/:id/status',
  requirePermission('clients:edit'),
  validateRequest({ body: updateClientStatusSchema }),
  ClientController.updateStatus
);


import { Router } from 'express';
import { RelatedPartyController } from './related-party.controller.js';
import { requireAuth, requireAnyPermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createRelatedPartySchema,
  updateRelatedPartySchema,
  listRelatedPartiesQuerySchema,
  conflictSearchQuerySchema,
} from './related-party.validation.js';

export const relatedPartyRouter = Router({ mergeParams: true });

relatedPartyRouter.use(requireAuth);

relatedPartyRouter.get(
  '/conflict-search',
  requireAnyPermission(['intake:conflict_review', 'matters:view', 'clients:view']),
  validateRequest({ query: conflictSearchQuerySchema }),
  RelatedPartyController.conflictSearch
);

relatedPartyRouter.get(
  '/',
  requireAnyPermission(['matters:view', 'clients:view', 'intake:view']),
  validateRequest({ query: listRelatedPartiesQuerySchema }),
  RelatedPartyController.listRelatedParties
);

relatedPartyRouter.post(
  '/',
  requireAnyPermission(['matters:edit', 'matters:create', 'clients:edit', 'intake:create']),
  validateRequest({ body: createRelatedPartySchema }),
  RelatedPartyController.createRelatedParty
);

relatedPartyRouter.put(
  '/:id',
  requireAnyPermission(['matters:edit', 'clients:edit']),
  validateRequest({ body: updateRelatedPartySchema }),
  RelatedPartyController.updateRelatedParty
);

relatedPartyRouter.delete(
  '/:id',
  requireAnyPermission(['matters:edit', 'clients:edit']),
  RelatedPartyController.deleteRelatedParty
);

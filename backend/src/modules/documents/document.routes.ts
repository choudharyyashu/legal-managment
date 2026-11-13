import { Router } from 'express';
import { DocumentController } from './document.controller.js';
import { draftRouter } from './drafts/draft.routes.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createDocumentSchema,
  uploadVersionSchema,
  documentQuerySchema,
} from './document.validation.js';

export const documentRouter = Router();

documentRouter.use(requireAuth);

// Sub-router for automated document drafts and generation engine
documentRouter.use('/drafts', draftRouter);

documentRouter.get(
  '/',
  requirePermission('documents:view'),
  validateRequest({ query: documentQuerySchema }),
  DocumentController.getDocuments
);

documentRouter.get(
  '/:id',
  requirePermission('documents:view'),
  DocumentController.getDocumentById
);

documentRouter.post(
  '/',
  requirePermission('documents:upload'),
  validateRequest({ body: createDocumentSchema }),
  DocumentController.createDocument
);

documentRouter.post(
  '/:id/upload',
  requirePermission('documents:upload'),
  validateRequest({ body: uploadVersionSchema }),
  DocumentController.uploadVersion
);

documentRouter.get(
  '/:id/download',
  requirePermission('documents:view'),
  DocumentController.downloadDocument
);

documentRouter.delete(
  '/:id',
  requirePermission('documents:delete'),
  DocumentController.deleteDocument
);


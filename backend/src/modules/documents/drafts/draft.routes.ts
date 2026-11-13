import { Router } from 'express';
import { DraftController } from './draft.controller.js';
import { requireAuth, requirePermission } from '../../../middleware/auth.js';
import { validateRequest } from '../../../middleware/validate.js';
import {
  validateDraftInputSchema,
  generateDraftInputSchema,
  draftQuerySchema,
} from './draft.validation.js';

export const draftRouter = Router();

// Authentication required for all document generation and draft endpoints
draftRouter.use(requireAuth);

// 1. Validation of generation prerequisites
draftRouter.post(
  '/validate',
  requirePermission('documents:view'),
  validateRequest({ body: validateDraftInputSchema }),
  DraftController.validateDraft
);

// 2. Execution of document draft generation (DOCX)
draftRouter.post(
  '/generate',
  requirePermission('documents:upload'),
  validateRequest({ body: generateDraftInputSchema }),
  DraftController.generateDraft
);

// 3. Conversion of existing generated draft to PDF
draftRouter.post(
  '/:id/pdf',
  requirePermission('documents:upload'),
  DraftController.convertDraftToPdf
);

// 4. Listing generated drafts with pagination & filtering
draftRouter.get(
  '/',
  requirePermission('documents:view'),
  validateRequest({ query: draftQuerySchema }),
  DraftController.getDrafts
);

// 5. Retrieve specific draft metadata
draftRouter.get(
  '/:id',
  requirePermission('documents:view'),
  DraftController.getDraftById
);

// 6. Download generated document draft (format=docx or format=pdf)
draftRouter.get(
  '/:id/download',
  requirePermission('documents:view'),
  DraftController.downloadDraft
);

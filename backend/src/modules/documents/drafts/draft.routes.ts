import { Router } from 'express';
import { DraftController } from './draft.controller.js';
import { requireAuth, requirePermission } from '../../../middleware/auth.js';
import { validateRequest } from '../../../middleware/validate.js';
import {
  validateDraftInputSchema,
  generateDraftInputSchema,
  createFollowUpTaskSchema,
  draftQuerySchema,
  approveDraftSchema,
  rejectDraftSchema,
  sendDraftSchema,
} from './draft.validation.js';

export const draftRouter = Router();

// Authentication required for all document generation and draft endpoints
draftRouter.use(requireAuth);

// 1. Validation of generation prerequisites and missing information warnings
draftRouter.post(
  '/validate',
  requirePermission('documents:view'),
  validateRequest({ body: validateDraftInputSchema }),
  DraftController.validateDraft
);

// 2. Creation of follow-up task directly from missing information warning
draftRouter.post(
  '/tasks/followup',
  requirePermission('tasks:create'),
  validateRequest({ body: createFollowUpTaskSchema }),
  DraftController.createFollowUpTask
);

// 3. Execution of document draft generation (DOCX)
draftRouter.post(
  '/generate',
  requirePermission('documents:upload'),
  validateRequest({ body: generateDraftInputSchema }),
  DraftController.generateDraft
);

// 4. Conversion of existing generated draft to PDF
draftRouter.post(
  '/:id/pdf',
  requirePermission('documents:upload'),
  DraftController.convertDraftToPdf
);

// 5. Listing generated drafts with pagination & filtering
draftRouter.get(
  '/',
  requirePermission('documents:view'),
  validateRequest({ query: draftQuerySchema }),
  DraftController.getDrafts
);

// 6. Approval: Finalize draft into legal document and complete review task
draftRouter.post(
  '/:id/approve',
  requirePermission('documents:approve'),
  validateRequest({ body: approveDraftSchema }),
  DraftController.approveDraft
);

// 7. Rejection: Reject draft with required reason and create correction task
draftRouter.post(
  '/:id/reject',
  requirePermission('documents:approve'),
  validateRequest({ body: rejectDraftSchema }),
  DraftController.rejectDraft
);

// 8. Transmission: Send approved document with verifiable transmission evidence
draftRouter.post(
  '/:id/send',
  requirePermission('documents:send'),
  validateRequest({ body: sendDraftSchema }),
  DraftController.sendDraft
);

// 9. Retrieve specific draft metadata
draftRouter.get(
  '/:id',
  requirePermission('documents:view'),
  DraftController.getDraftById
);

// 10. Download generated document draft (format=docx or format=pdf)
draftRouter.get(
  '/:id/download',
  requirePermission('documents:view'),
  DraftController.downloadDraft
);



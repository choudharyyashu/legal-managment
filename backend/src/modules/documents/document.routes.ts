import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { DocumentController } from './document.controller.js';
import { draftRouter } from './drafts/draft.routes.js';
import { documentEventRouter } from './events/event.routes.js';
import { automationRouter } from './catalog/automation.routes.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createDocumentSchema,
  updateDocumentSchema,
  uploadVersionSchema,
  documentQuerySchema,
} from './document.validation.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max per uploaded document
});

const optionalMultipartOrJson = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.single('file')(req, res, next);
  } else {
    next();
  }
};

export const documentRouter = Router();

documentRouter.use(requireAuth);

// Sub-router for automated document drafts, PDF conversion & regeneration
documentRouter.use('/drafts', draftRouter);

// Sub-router for event-driven automatic document draft triggers
documentRouter.use('/events', documentEventRouter);

// Sub-router for the 300-Document Automation Catalog
documentRouter.use('/automations', automationRouter);

// Storage health & vault statistics
documentRouter.get(
  '/storage/stats',
  requirePermission('documents:view'),
  DocumentController.getStorageStats
);

// Single-step multipart or base64 document upload + OCR extraction
documentRouter.post(
  '/upload',
  requirePermission('documents:upload'),
  optionalMultipartOrJson,
  DocumentController.uploadNewDocument
);

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
  optionalMultipartOrJson,
  (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).file) return next();
    return validateRequest({ body: uploadVersionSchema })(req, res, next);
  },
  DocumentController.uploadVersion
);

documentRouter.get(
  '/:id/versions',
  requirePermission('documents:view'),
  DocumentController.getVersions
);

documentRouter.get(
  '/:id/versions/:versionId/download',
  requirePermission('documents:view'),
  DocumentController.downloadDocument
);

documentRouter.post(
  '/:id/versions/:versionId/restore',
  requirePermission('documents:upload'),
  DocumentController.restoreVersion
);

documentRouter.get(
  '/:id/ocr',
  requirePermission('documents:view'),
  DocumentController.getOcrDetails
);

documentRouter.post(
  '/:id/ocr',
  requirePermission('documents:upload'),
  DocumentController.runOcrExtraction
);

documentRouter.get(
  '/:id/verify-integrity',
  requirePermission('documents:view'),
  DocumentController.verifyIntegrity
);

documentRouter.get(
  '/:id/download',
  requirePermission('documents:view'),
  DocumentController.downloadDocument
);

documentRouter.patch(
  '/:id',
  requirePermission('documents:upload'),
  validateRequest({ body: updateDocumentSchema }),
  DocumentController.updateDocument
);

documentRouter.delete(
  '/:id',
  requirePermission('documents:delete'),
  DocumentController.deleteDocument
);

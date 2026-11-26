import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { TemplateController } from './template.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createTemplateSchema,
  updateTemplateSchema,
  templateStatusSchema,
  uploadTemplateVersionSchema,
  templateQuerySchema,
  batchFieldMappingsSchema,
  updateFieldMappingSchema,
} from './template.validation.js';

const templateUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const optionalMultipartTemplate = (req: Request, res: Response, next: NextFunction) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    templateUpload.single('file')(req, res, next);
  } else {
    next();
  }
};

export const templateRouter = Router();

// Enforce authentication across all template registry endpoints
templateRouter.use(requireAuth);

// -----------------------------------------------------------------------------
// 0. Field Dictionary for Document Field Mapping UI
// -----------------------------------------------------------------------------

templateRouter.get(
  '/field-dictionary',
  requirePermission('templates:view'),
  TemplateController.getFieldDictionary
);

// -----------------------------------------------------------------------------
// 1. Template Metadata & Listing
// -----------------------------------------------------------------------------

templateRouter.get(
  '/',
  requirePermission('templates:view'),
  validateRequest({ query: templateQuerySchema }),
  TemplateController.getTemplates
);

templateRouter.get(
  '/:id',
  requirePermission('templates:view'),
  TemplateController.getTemplateById
);

templateRouter.post(
  '/',
  requirePermission('templates:manage'),
  validateRequest({ body: createTemplateSchema }),
  TemplateController.createTemplate
);

templateRouter.put(
  '/:id',
  requirePermission('templates:manage'),
  validateRequest({ body: updateTemplateSchema }),
  TemplateController.updateTemplate
);

templateRouter.patch(
  '/:id/status',
  requirePermission('templates:manage'),
  validateRequest({ body: templateStatusSchema }),
  TemplateController.setTemplateStatus
);

// -----------------------------------------------------------------------------
// 2. Template Versioning & DOCX Upload/Download + Placeholder Detection
// -----------------------------------------------------------------------------

templateRouter.get(
  '/:id/versions',
  requirePermission('templates:view'),
  TemplateController.getTemplateVersions
);

templateRouter.get(
  '/:id/versions/:versionId',
  requirePermission('templates:view'),
  TemplateController.getTemplateVersionById
);

templateRouter.get(
  '/:id/versions/:versionId/placeholders',
  requirePermission('templates:view'),
  TemplateController.detectVersionPlaceholders
);

templateRouter.get(
  '/:id/versions/:versionId/download',
  requirePermission('templates:view'),
  TemplateController.downloadTemplateVersion
);

templateRouter.post(
  '/:id/versions',
  requirePermission('templates:manage'),
  optionalMultipartTemplate,
  (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).file) return next();
    return validateRequest({ body: uploadTemplateVersionSchema })(req, res, next);
  },
  TemplateController.uploadVersion
);

// -----------------------------------------------------------------------------
// 3. Document Field Mappings
// -----------------------------------------------------------------------------

templateRouter.get(
  '/:id/versions/:versionId/mappings',
  requirePermission('templates:view'),
  TemplateController.getFieldMappings
);

templateRouter.post(
  '/:id/versions/:versionId/mappings',
  requirePermission('templates:manage'),
  validateRequest({ body: batchFieldMappingsSchema }),
  TemplateController.batchSaveFieldMappings
);

templateRouter.put(
  '/:id/versions/:versionId/mappings/:mappingId',
  requirePermission('templates:manage'),
  validateRequest({ body: updateFieldMappingSchema }),
  TemplateController.updateFieldMapping
);

templateRouter.delete(
  '/:id/versions/:versionId/mappings/:mappingId',
  requirePermission('templates:manage'),
  TemplateController.deleteFieldMapping
);

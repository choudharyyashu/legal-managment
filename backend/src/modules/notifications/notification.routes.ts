import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { updateNotificationPreferencesSchema } from './notification.validation.js';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get(
  '/preferences',
  NotificationController.getPreferences
);

notificationRouter.put(
  '/preferences',
  validateRequest({ body: updateNotificationPreferencesSchema }),
  NotificationController.updatePreferences
);

notificationRouter.post(
  '/preferences/reset',
  NotificationController.resetPreferences
);

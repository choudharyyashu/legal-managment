import { Router } from 'express';
import { CalendarController } from './calendar.controller.js';
import { requireAuth, requirePermission, requireAnyPermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
  calendarQuerySchema,
} from './calendar.validation.js';

export const calendarRouter = Router();

calendarRouter.use(requireAuth);

calendarRouter.get(
  '/events',
  requirePermission('calendar:view'),
  validateRequest({ query: calendarQuerySchema }),
  CalendarController.getEvents
);

calendarRouter.get(
  '/events/:id',
  requirePermission('calendar:view'),
  CalendarController.getEventById
);

calendarRouter.post(
  '/events',
  requireAnyPermission(['calendar:view', 'matters:edit', 'tasks:create']),
  validateRequest({ body: createCalendarEventSchema }),
  CalendarController.createEvent
);

calendarRouter.put(
  '/events/:id',
  requireAnyPermission(['calendar:view', 'matters:edit', 'tasks:edit']),
  validateRequest({ body: updateCalendarEventSchema }),
  CalendarController.updateEvent
);

calendarRouter.delete(
  '/events/:id',
  requireAnyPermission(['matters:edit', 'tasks:delete']),
  CalendarController.deleteEvent
);


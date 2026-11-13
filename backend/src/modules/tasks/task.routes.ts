import { Router } from 'express';
import { TaskController } from './task.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
} from './task.validation.js';

export const taskRouter = Router();

taskRouter.use(requireAuth);

taskRouter.get(
  '/',
  requirePermission('tasks:view'),
  validateRequest({ query: taskQuerySchema }),
  TaskController.getTasks
);

taskRouter.get(
  '/:id',
  requirePermission('tasks:view'),
  TaskController.getTaskById
);

taskRouter.post(
  '/',
  requirePermission('tasks:create'),
  validateRequest({ body: createTaskSchema }),
  TaskController.createTask
);

taskRouter.put(
  '/:id',
  requirePermission('tasks:edit'),
  validateRequest({ body: updateTaskSchema }),
  TaskController.updateTask
);

taskRouter.patch(
  '/:id/status',
  requirePermission('tasks:edit'),
  validateRequest({ body: updateTaskStatusSchema }),
  TaskController.updateStatus
);

taskRouter.delete(
  '/:id',
  requirePermission('tasks:delete'),
  TaskController.deleteTask
);


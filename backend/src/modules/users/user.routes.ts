import { Router } from 'express';
import { UserController } from './user.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  userQuerySchema,
} from './user.validation.js';

export const userRouter = Router();

// Apply requireAuth globally across all user management endpoints
userRouter.use(requireAuth);

userRouter.get(
  '/',
  requirePermission('users:view'),
  validateRequest({ query: userQuerySchema }),
  UserController.getUsers
);

userRouter.get(
  '/:id',
  requirePermission('users:view'),
  UserController.getUserById
);

userRouter.post(
  '/',
  requirePermission('users:manage'),
  validateRequest({ body: createUserSchema }),
  UserController.createUser
);

userRouter.put(
  '/:id',
  requirePermission('users:manage'),
  validateRequest({ body: updateUserSchema }),
  UserController.updateUser
);

userRouter.patch(
  '/:id/status',
  requirePermission('users:manage'),
  validateRequest({ body: updateStatusSchema }),
  UserController.updateStatus
);


import { Router } from 'express';
import { ExpenseController } from './expense.controller.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
} from './expense.validation.js';

export const expenseRouter = Router();

expenseRouter.use(requireAuth);

expenseRouter.get(
  '/',
  requirePermission('expenses:view'),
  validateRequest({ query: expenseQuerySchema }),
  ExpenseController.getExpenses
);

expenseRouter.get(
  '/:id',
  requirePermission('expenses:view'),
  ExpenseController.getExpenseById
);

expenseRouter.post(
  '/',
  requirePermission('expenses:create'),
  validateRequest({ body: createExpenseSchema }),
  ExpenseController.createExpense
);

expenseRouter.put(
  '/:id',
  requirePermission('expenses:edit'),
  validateRequest({ body: updateExpenseSchema }),
  ExpenseController.updateExpense
);

expenseRouter.delete(
  '/:id',
  requirePermission('expenses:edit'),
  ExpenseController.deleteExpense
);


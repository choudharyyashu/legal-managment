import { z } from 'zod';

export const createTaskSchema = z.object({
  matterId: z.string().uuid(),
  title: z.string().min(2).max(255),
  description: z.string().max(2000).optional(),
  assignedToUserId: z.string().uuid(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be in YYYY-MM-DD format'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  reminderSetting: z.string().max(50).optional().default('1 day prior'),
  urcpRuleReference: z.string().max(50).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().max(2000).optional(),
  assignedToUserId: z.string().uuid().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be in YYYY-MM-DD format').optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  status: z.enum(['Not Started', 'In Progress', 'Waiting on Client', 'Completed', 'Deferred']).optional(),
  reminderSetting: z.string().max(50).optional(),
  urcpRuleReference: z.string().max(50).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['Not Started', 'In Progress', 'Waiting on Client', 'Completed', 'Deferred']),
});

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  matterId: z.string().optional(),
  assignedToUserId: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['dueDate', 'createdAt', 'priority', 'status']).optional().default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;


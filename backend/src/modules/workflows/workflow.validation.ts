import { z } from 'zod';

export const stageQuerySchema = z.object({
  practiceAreaId: z.string().optional(),
});

export const autoTaskSchema = z.object({
  title: z.string().trim().min(2, 'Task title must be at least 2 characters').max(200),
  role: z.string().trim().min(2, 'Role must be at least 2 characters').max(100),
  dueDays: z.number().int().min(1).max(365).default(7),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('High'),
});

export const updateStageSchema = z.object({
  stageName: z.string().trim().min(2, 'Stage name must be at least 2 characters').max(100).optional(),
  stageCode: z.string().trim().min(1).max(20).optional(),
  stageOrder: z.number().int().min(1).optional(),
  requiredFields: z.array(z.string().trim().min(1, 'Item text cannot be empty')).optional(),
  autoTasks: z.array(autoTaskSchema).optional(),
  isActive: z.boolean().optional(),
});

export const createStageSchema = z.object({
  practiceAreaId: z.string().min(1, 'practiceAreaId is required'),
  stageName: z.string().trim().min(2, 'Stage name must be at least 2 characters').max(100),
  stageCode: z.string().trim().min(1).max(20),
  stageOrder: z.number().int().min(1),
  requiredFields: z.array(z.string().trim().min(1)).default([]),
  autoTasks: z.array(autoTaskSchema).default([]),
});

export const updateStageChecklistSchema = z.object({
  requiredFields: z.array(z.string().trim().min(1, 'Item text cannot be empty')),
});

export const addChecklistItemSchema = z.object({
  itemText: z.string().trim().min(2, 'Item text must be at least 2 characters').max(255),
});

export const addAutomationRuleSchema = autoTaskSchema;

export const toggleMatterChecklistSchema = z.object({
  stageId: z.string().min(1, 'stageId is required'),
  itemText: z.string().min(1, 'itemText is required'),
  completed: z.boolean(),
});

export type StageQueryInput = z.infer<typeof stageQuerySchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;
export type CreateStageInput = z.infer<typeof createStageSchema>;
export type UpdateStageChecklistInput = z.infer<typeof updateStageChecklistSchema>;
export type AddChecklistItemInput = z.infer<typeof addChecklistItemSchema>;
export type AddAutomationRuleInput = z.infer<typeof addAutomationRuleSchema>;
export type ToggleMatterChecklistInput = z.infer<typeof toggleMatterChecklistSchema>;

import { z } from 'zod';

export const createCalendarEventSchema = z.object({
  matterId: z.string().uuid().optional(),
  title: z.string().min(2).max(255),
  eventType: z.enum(['Hearing', 'Trial', 'Deposition', 'Mediation', 'Client Conference', 'Filing Deadline', 'Internal Meeting']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().max(255).optional(),
  judge: z.string().max(150).optional(),
  isCourtAppearance: z.boolean().default(false),
}).refine(data => new Date(data.endTime) >= new Date(data.startTime), {
  message: 'endTime must be equal to or after startTime',
  path: ['endTime'],
});

export const updateCalendarEventSchema = z.object({
  matterId: z.string().uuid().optional(),
  title: z.string().min(2).max(255).optional(),
  eventType: z.enum(['Hearing', 'Trial', 'Deposition', 'Mediation', 'Client Conference', 'Filing Deadline', 'Internal Meeting']).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  location: z.string().max(255).optional(),
  judge: z.string().max(150).optional(),
  isCourtAppearance: z.boolean().optional(),
});

export const calendarQuerySchema = z.object({
  matterId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  eventType: z.string().optional(),
  isCourtAppearance: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;


import { z } from 'zod';

export const updateNotificationPreferencesSchema = z.object({
  courtDeadlineEmail: z.boolean({ required_error: 'courtDeadlineEmail is required' }),
  courtDeadlineSms: z.boolean({ required_error: 'courtDeadlineSms is required' }),
  courtDeadlineLeadTime: z.enum(['24', '48', '72', '168'], {
    errorMap: () => ({ message: 'Lead time must be 24, 48, 72, or 168 hours' }),
  }),
  timeApprovalAlerts: z.boolean({ required_error: 'timeApprovalAlerts is required' }),
  conflictCheckNotices: z.boolean({ required_error: 'conflictCheckNotices is required' }),
  dailyDigestEmail: z.boolean({ required_error: 'dailyDigestEmail is required' }),
  clientMessageNotification: z.boolean({ required_error: 'clientMessageNotification is required' }),
});

export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;

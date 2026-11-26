import { prisma } from '../../config/database.js';
import {
  UserNotificationPreferences,
  GatewayStatus,
  NotificationPreferencesResponse,
} from './notification.types.js';
import { UpdateNotificationPreferencesInput } from './notification.validation.js';

export const DEFAULT_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  courtDeadlineEmail: true,
  courtDeadlineSms: true,
  courtDeadlineLeadTime: '48',
  timeApprovalAlerts: true,
  conflictCheckNotices: true,
  dailyDigestEmail: false,
  clientMessageNotification: true,
};

export class NotificationService {
  // In-memory cache keyed by userId ensuring strict user-level preference isolation
  private static userPreferencesStore = new Map<string, { preferences: UserNotificationPreferences; updatedAt: string }>();

  /**
   * Authoritative check of external messaging gateways (Twilio, SMTP/Exchange).
   * Ensures the system NEVER simulates or fakes delivery when external services are unconfigured.
   */
  static getGatewayStatus(): GatewayStatus {
    const env = process.env;
    const hasEmail = Boolean(env.SMTP_HOST || env.SENDGRID_API_KEY || (env.AZURE_CLIENT_ID && env.AZURE_TENANT_ID));
    const hasSms = Boolean(env.TWILIO_AUTH_TOKEN && env.TWILIO_ACCOUNT_SID);

    return {
      emailConfigured: hasEmail,
      smsConfigured: hasSms,
      emailProvider: hasEmail ? (env.SENDGRID_API_KEY ? 'SendGrid Cloud' : 'Exchange / SMTP') : 'Unconfigured (In-App Only)',
      smsProvider: hasSms ? 'Twilio Cloud SMS' : 'Unconfigured (In-App Only)',
    };
  }

  /**
   * Retrieves active notification preferences for the authenticated user.
   * Reads from user_notification_preferences table with fallback to Utah Law defaults.
   */
  static async getPreferences(userId: string): Promise<NotificationPreferencesResponse> {
    const gatewayStatus = this.getGatewayStatus();

    try {
      const pref = await prisma.userNotificationPreference.findUnique({
        where: { userId },
      });

      if (pref) {
        const preferences: UserNotificationPreferences = {
          courtDeadlineEmail: pref.courtDeadlineEmail,
          courtDeadlineSms: pref.courtDeadlineSms,
          courtDeadlineLeadTime: pref.courtDeadlineLeadTime,
          timeApprovalAlerts: pref.timeApprovalAlerts,
          conflictCheckNotices: pref.conflictCheckNotices,
          dailyDigestEmail: pref.dailyDigestEmail,
          clientMessageNotification: pref.clientMessageNotification,
        };

        // Sync local cache
        this.userPreferencesStore.set(userId, {
          preferences,
          updatedAt: pref.updatedAt.toISOString(),
        });

        return {
          preferences,
          gatewayStatus,
          userId,
          updatedAt: pref.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.warn('Failed to query user_notification_preferences table, checking cache/defaults:', err);
    }

    const existing = this.userPreferencesStore.get(userId);
    if (existing) {
      return {
        preferences: existing.preferences,
        gatewayStatus,
        userId,
        updatedAt: existing.updatedAt,
      };
    }

    return {
      preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
      gatewayStatus,
      userId,
      updatedAt: null,
    };
  }

  /**
   * Persists user notification preferences with strict user-level isolation in MySQL.
   */
  static async updatePreferences(
    userId: string,
    input: UpdateNotificationPreferencesInput,
    context: { userName?: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<NotificationPreferencesResponse> {
    const prefs: UserNotificationPreferences = {
      courtDeadlineEmail: Boolean(input.courtDeadlineEmail),
      courtDeadlineSms: Boolean(input.courtDeadlineSms),
      courtDeadlineLeadTime: input.courtDeadlineLeadTime,
      timeApprovalAlerts: Boolean(input.timeApprovalAlerts),
      conflictCheckNotices: Boolean(input.conflictCheckNotices),
      dailyDigestEmail: Boolean(input.dailyDigestEmail),
      clientMessageNotification: Boolean(input.clientMessageNotification),
    };

    const saved = await prisma.userNotificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        courtDeadlineEmail: prefs.courtDeadlineEmail,
        courtDeadlineSms: prefs.courtDeadlineSms,
        courtDeadlineLeadTime: prefs.courtDeadlineLeadTime,
        timeApprovalAlerts: prefs.timeApprovalAlerts,
        conflictCheckNotices: prefs.conflictCheckNotices,
        dailyDigestEmail: prefs.dailyDigestEmail,
        clientMessageNotification: prefs.clientMessageNotification,
      },
      update: {
        courtDeadlineEmail: prefs.courtDeadlineEmail,
        courtDeadlineSms: prefs.courtDeadlineSms,
        courtDeadlineLeadTime: prefs.courtDeadlineLeadTime,
        timeApprovalAlerts: prefs.timeApprovalAlerts,
        conflictCheckNotices: prefs.conflictCheckNotices,
        dailyDigestEmail: prefs.dailyDigestEmail,
        clientMessageNotification: prefs.clientMessageNotification,
      },
    });

    const updatedAt = saved.updatedAt.toISOString();

    // Update user-isolated memory store
    this.userPreferencesStore.set(userId, { preferences: prefs, updatedAt });

    // Record audit trail entry
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
      });

      await prisma.auditLog.create({
        data: {
          userId: dbUser ? dbUser.id : null,
          userName: dbUser?.name || context.userName || 'User',
          userRole: context.userRole,
          action: 'NOTIFICATION_PREFERENCES_UPDATED',
          resourceType: 'NOTIFICATION_PREFERENCES',
          resourceId: userId,
          details: {
            preferences: prefs,
            updatedAt,
          } as any,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });
    } catch (err) {
      console.warn('Failed to record notification preferences audit log:', err);
    }

    return {
      preferences: prefs,
      gatewayStatus: this.getGatewayStatus(),
      userId,
      updatedAt,
    };
  }

  /**
   * Resets notification preferences back to Utah Law defaults for the specific user in MySQL.
   */
  static async resetPreferences(
    userId: string,
    context: { userName?: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<NotificationPreferencesResponse> {
    const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES };

    const saved = await prisma.userNotificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        courtDeadlineEmail: prefs.courtDeadlineEmail,
        courtDeadlineSms: prefs.courtDeadlineSms,
        courtDeadlineLeadTime: prefs.courtDeadlineLeadTime,
        timeApprovalAlerts: prefs.timeApprovalAlerts,
        conflictCheckNotices: prefs.conflictCheckNotices,
        dailyDigestEmail: prefs.dailyDigestEmail,
        clientMessageNotification: prefs.clientMessageNotification,
      },
      update: {
        courtDeadlineEmail: prefs.courtDeadlineEmail,
        courtDeadlineSms: prefs.courtDeadlineSms,
        courtDeadlineLeadTime: prefs.courtDeadlineLeadTime,
        timeApprovalAlerts: prefs.timeApprovalAlerts,
        conflictCheckNotices: prefs.conflictCheckNotices,
        dailyDigestEmail: prefs.dailyDigestEmail,
        clientMessageNotification: prefs.clientMessageNotification,
      },
    });

    const updatedAt = saved.updatedAt.toISOString();
    this.userPreferencesStore.set(userId, { preferences: prefs, updatedAt });

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
      });

      await prisma.auditLog.create({
        data: {
          userId: dbUser ? dbUser.id : null,
          userName: dbUser?.name || context.userName || 'User',
          userRole: context.userRole,
          action: 'NOTIFICATION_PREFERENCES_RESET',
          resourceType: 'NOTIFICATION_PREFERENCES',
          resourceId: userId,
          details: {
            preferences: prefs,
            resetAt: updatedAt,
          } as any,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });
    } catch (err) {
      console.warn('Failed to record notification preferences reset audit log:', err);
    }

    return {
      preferences: prefs,
      gatewayStatus: this.getGatewayStatus(),
      userId,
      updatedAt,
    };
  }
}

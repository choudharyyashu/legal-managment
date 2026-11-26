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
   */
  static async getPreferences(userId: string): Promise<NotificationPreferencesResponse> {
    const existing = this.userPreferencesStore.get(userId);
    const gatewayStatus = this.getGatewayStatus();

    if (existing) {
      return {
        preferences: existing.preferences,
        gatewayStatus,
        userId,
        updatedAt: existing.updatedAt,
      };
    }

    // Fallback: check audit log history for previously persisted user preferences
    try {
      const latestLog = await prisma.auditLog.findFirst({
        where: {
          resourceType: 'NOTIFICATION_PREFERENCES',
          action: 'NOTIFICATION_PREFERENCES_UPDATED',
          resourceId: userId,
        },
        orderBy: { timestamp: 'desc' },
      });

      if (latestLog?.details && (latestLog.details as any).preferences) {
        const prefs: UserNotificationPreferences = {
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...(latestLog.details as any).preferences,
        };
        this.userPreferencesStore.set(userId, {
          preferences: prefs,
          updatedAt: latestLog.timestamp.toISOString(),
        });

        return {
          preferences: prefs,
          gatewayStatus,
          userId,
          updatedAt: latestLog.timestamp.toISOString(),
        };
      }
    } catch (err) {
      console.warn('Failed to query user notification preferences from audit log:', err);
    }

    return {
      preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
      gatewayStatus,
      userId,
      updatedAt: null,
    };
  }

  /**
   * Persists user notification preferences with strict user-level isolation.
   */
  static async updatePreferences(
    userId: string,
    input: UpdateNotificationPreferencesInput,
    context: { userName?: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<NotificationPreferencesResponse> {
    const updatedAt = new Date().toISOString();
    const prefs: UserNotificationPreferences = {
      courtDeadlineEmail: Boolean(input.courtDeadlineEmail),
      courtDeadlineSms: Boolean(input.courtDeadlineSms),
      courtDeadlineLeadTime: input.courtDeadlineLeadTime,
      timeApprovalAlerts: Boolean(input.timeApprovalAlerts),
      conflictCheckNotices: Boolean(input.conflictCheckNotices),
      dailyDigestEmail: Boolean(input.dailyDigestEmail),
      clientMessageNotification: Boolean(input.clientMessageNotification),
    };

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
   * Resets notification preferences back to Utah Law defaults for the specific user.
   */
  static async resetPreferences(
    userId: string,
    context: { userName?: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<NotificationPreferencesResponse> {
    const updatedAt = new Date().toISOString();
    const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES };

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

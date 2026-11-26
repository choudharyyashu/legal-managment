export interface UserNotificationPreferences {
  courtDeadlineEmail: boolean;
  courtDeadlineSms: boolean;
  courtDeadlineLeadTime: string; // '24' | '48' | '72' | '168'
  timeApprovalAlerts: boolean;
  conflictCheckNotices: boolean;
  dailyDigestEmail: boolean;
  clientMessageNotification: boolean;
}

export interface GatewayStatus {
  emailConfigured: boolean;
  smsConfigured: boolean;
  emailProvider: string;
  smsProvider: string;
}

export interface NotificationPreferencesResponse {
  preferences: UserNotificationPreferences;
  gatewayStatus: GatewayStatus;
  userId: string;
  updatedAt: string | null;
}

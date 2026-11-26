export interface TimeEntryResponse {
  id: string;
  entryCode: string;
  matterId: string;
  matterNumber?: string | null;
  matterTitle?: string | null;
  userId: string;
  userName?: string | null;
  date: string;
  hours: number;
  rate: number;
  amount: number;
  activityType: string;
  activityCode?: string | null;
  description: string;
  isBillable: boolean;
  status: string;
  approvedByUserId?: string | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  rejectionComment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SuggestedBillingResponse {
  id: string;
  sourceType: string;
  sourceIdentifier: string;
  matterId?: string | null;
  matterNumber?: string | null;
  date: string;
  actualDurationSeconds: number;
  suggestedHours: number;
  matchConfidence: number;
  activityDescription: string;
  detectedRate?: number | null;
  isConverted: boolean;
  convertedTimeEntryId?: string | null;
  isDismissed: boolean;
  createdAt: string;
}

export interface TimeEntryListQuery {
  page?: number;
  limit?: number;
  matterId?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReviewSlotResponse {
  id: string;
  label: string;
  scheduledTime: string;
  timezone: string;
  reviewStatus: 'Pending' | 'Completed';
  pendingSuggestions: number;
  lastReviewedTime: string;
  windowDescription: string;
  reviewedByUserName?: string | null;
  reviewedAt?: string | null;
}

export interface IdleFlagResponse {
  id: string;
  slotId: string;
  userId: string;
  userName: string;
  clientName: string;
  matterNumber: string;
  matterTitle: string;
  date: string;
  loggedDuration: string;
  idleDuration: string;
  reason: string;
  reviewNote?: string | null;
  status: 'Pending' | 'Reviewed' | 'Approved' | 'Rejected';
}

export interface OverlapFlagEntry {
  id: string;
  matterNumber: string;
  matterTitle: string;
  timeRange: string;
  hours: number;
}

export interface OverlapFlagResponse {
  id: string;
  slotId: string;
  userId: string;
  userName: string;
  date: string;
  overlapDuration: string;
  reason: string;
  reviewNote?: string | null;
  status: 'Pending' | 'Reviewed' | 'Approved' | 'Rejected';
  entries: OverlapFlagEntry[];
}

export interface ReviewFlagsResponse {
  idleFlags: IdleFlagResponse[];
  overlapFlags: OverlapFlagResponse[];
  metadata: {
    targetDate: string;
    timezone: string;
    intervalDataAvailable: boolean;
    inactivityTelemetryAvailable: boolean;
  };
}


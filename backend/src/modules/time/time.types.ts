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

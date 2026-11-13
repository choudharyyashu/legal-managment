export interface CalendarEventResponse {
  id: string;
  matterId?: string | null;
  matterNumber?: string | null;
  matterTitle?: string | null;
  title: string;
  eventType: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  judge?: string | null;
  isCourtAppearance: boolean;
  createdByUserId: string;
  createdByName?: string | null;
  createdAt: string;
}

export interface CalendarEventListQuery {
  matterId?: string;
  startDate?: string;
  endDate?: string;
  eventType?: string;
  isCourtAppearance?: boolean;
}


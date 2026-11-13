export type ConflictStatus = 'Not Started' | 'In Review' | 'Cleared' | 'Conflict Identified' | 'Waiver Obtained';

export interface IntakeResponse {
  id: string;
  intakeNumber: string;
  prospectiveClient: string;
  contactPerson?: string | null;
  email: string;
  phone: string;
  practiceAreaId?: string | null;
  practiceAreaName?: string | null;
  adverseParties: string;
  matterSummary: string;
  disputeAmount: number;
  jurisdictionVenue?: string | null;
  conflictStatus: string;
  reviewedByUserId?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  conflictNotes?: string | null;
  convertedToClient: boolean;
  convertedClientId?: string | null;
  convertedMatterId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeListQuery {
  page?: number;
  limit?: number;
  search?: string;
  conflictStatus?: ConflictStatus;
  practiceAreaId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}


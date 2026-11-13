export type MatterBillingType = 'Hourly' | 'Flat Fee' | 'Contingency';
export type MatterStatus = 'Active' | 'In Discovery' | 'Trial Prep' | 'On Hold' | 'Concluded';

export interface MatterStaffResponse {
  userId: string;
  userCode: string;
  name: string;
  role: string;
  title: string | null;
  assignmentRole: string;
  assignedAt: Date;
}

export interface MatterResponse {
  id: string;
  matterNumber: string;
  clientId: string;
  clientName: string;
  clientNumber?: string;
  title: string;
  practiceAreaId: string;
  practiceAreaName: string;
  practiceAreaCode: string;
  practiceAreaColor?: string;
  currentStageId: string | null;
  status: string;
  responsibleAttorneyId: string;
  responsibleAttorneyName: string;
  billingType: string;
  hourlyRate: number | null;
  flatFeeAmount: number | null;
  contingencyPercentage: number | null;
  budget: number;
  openDate: string | Date;
  closeDate: string | Date | null;
  statuteOfLimitations: string | Date | null;
  nextCourtDate: string | Date | null;
  courtName: string | null;
  judge: string | null;
  caseDocketNumber: string | null;
  description: string | null;
  isEthicalWallEnabled: boolean;
  ethicalWallExcludedRole: string | null;
  assignedStaff: MatterStaffResponse[];
  taskCount?: number;
  documentCount?: number;
  timeEntryCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatterListQuery {
  search?: string;
  clientId?: string;
  practiceAreaId?: string;
  responsibleAttorneyId?: string;
  status?: MatterStatus;
  billingType?: MatterBillingType;
  sortBy?: 'openDate' | 'title' | 'matterNumber' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}


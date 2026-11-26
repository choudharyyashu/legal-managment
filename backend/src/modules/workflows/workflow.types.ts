export interface WorkflowAutoTask {
  title: string;
  role: string;
  dueDays: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export interface WorkflowStageResponse {
  id: string;
  practiceAreaId: string;
  practiceAreaName: string;
  practiceAreaCode: string;
  brandColor: string;
  stageName: string;
  stageCode: string;
  stageOrder: number;
  requiredFields: string[];
  autoTasks: WorkflowAutoTask[];
  isActive: boolean;
  matterCount?: number;
}

export interface MatterChecklistProgress {
  matterId: string;
  matterNumber: string;
  matterTitle: string;
  practiceAreaId: string;
  practiceAreaName: string;
  currentStageId: string | null;
  currentStageName: string | null;
  stages: {
    stageId: string;
    stageName: string;
    stageCode: string;
    stageOrder: number;
    isCurrent: boolean;
    requiredFields: string[];
    verifiedGatekeepers: string[];
    completedCount: number;
    totalCount: number;
    isStageComplete: boolean;
  }[];
  overallProgressPercent: number;
}

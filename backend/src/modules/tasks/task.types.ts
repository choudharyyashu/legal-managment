export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Waiting on Client' | 'Completed' | 'Deferred';

export interface TaskResponse {
  id: string;
  taskCode: string;
  matterId: string;
  matterNumber?: string | null;
  matterTitle?: string | null;
  title: string;
  description?: string | null;
  assignedToUserId: string;
  assignedToName?: string | null;
  createdByUserId: string;
  createdByName?: string | null;
  dueDate: string;
  priority: string;
  status: string;
  completedAt?: string | null;
  reminderSetting?: string | null;
  urcpRuleReference?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListQuery {
  page?: number;
  limit?: number;
  matterId?: string;
  assignedToUserId?: string;
  status?: string;
  priority?: string;
  dueBefore?: string;
  dueAfter?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

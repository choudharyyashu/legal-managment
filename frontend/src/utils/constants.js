export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ATTORNEY: 'attorney',
  PARALEGAL: 'paralegal',
  BILLING: 'billing',
  SUPERVISOR: 'supervisor',
};

export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.ATTORNEY]: 'Attorney',
  [USER_ROLES.PARALEGAL]: 'Paralegal / Staff',
  [USER_ROLES.BILLING]: 'Billing / Accounting',
  [USER_ROLES.SUPERVISOR]: 'Supervisor',
};

export const TASK_STATUSES = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  WAITING: 'Waiting',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const TASK_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const TIME_STATUSES = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPORTED: 'Exported',
};

export const INVOICE_STATUSES = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
};

export const CONFLICT_STATUSES = {
  NOT_STARTED: 'Not Started',
  IN_REVIEW: 'In Review',
  CLEARED: 'Cleared',
  CONFLICT_IDENTIFIED: 'Conflict Identified',
};

export const BILLING_TYPES = {
  HOURLY: 'Hourly',
  FLAT_FEE: 'Flat Fee',
  CONTINGENCY: 'Contingency',
};


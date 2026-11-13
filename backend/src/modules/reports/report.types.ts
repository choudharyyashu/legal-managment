export interface DashboardSummaryResponse {
  clients: {
    total: number;
    active: number;
    prospective: number;
  };
  matters: {
    total: number;
    active: number;
    inDiscovery: number;
    trialPrep: number;
    concluded: number;
  };
  tasks: {
    total: number;
    pending: number;
    completed: number;
  };
  calendar: {
    upcomingCourtAppearancesCount: number;
  };
  financials: {
    totalInvoiced: number;
    totalCollected: number;
    totalOutstandingAr: number;
    totalTrustBalance: number;
  };
  practiceAreas: Array<{
    name: string;
    code: string;
    mattersCount: number;
  }>;
}

export interface ArAgingResponse {
  current: number; // 0-30 days
  days31to60: number;
  days61to90: number;
  daysOver90: number;
  totalOutstanding: number;
}


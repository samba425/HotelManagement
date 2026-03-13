export interface FinancialOperation {
  branchId: string;
  date: string;
  roomsOccupied: number;
  dailyRevenue: number;
  operationalCosts: number;
  grossOperatingProfit: number;
  averageDailyRate: number;
  revPAR: number;
}

export interface KpiData {
  label: string;
  value: number;
  previousValue: number;
  format: 'currency' | 'percentage' | 'number';
  trend: 'up' | 'down' | 'flat';
  trendPercentage: number;
  icon: string;
  accent: string;
  sparklineData?: number[];
}

import { BaseResponse } from './base.api.type';

export type DashboardStatSummary = {
  total: number;
  percentageChange: number;
  isPositive: boolean;
  currentMonth: number;
  previousMonth: number;
};

export type DashboardStatsData = {
  orders: DashboardStatSummary;
  buyers: DashboardStatSummary;
  products: DashboardStatSummary;
};

export type DashboardStatsResponse = BaseResponse<DashboardStatsData>;

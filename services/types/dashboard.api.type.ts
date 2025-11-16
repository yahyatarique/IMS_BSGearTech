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

export type DashboardRecentOrderBuyer = {
  id: string;
  name: string;
  company: string | null;
};

export type DashboardRecentOrder = {
  id: string;
  orderNumber: string;
  buyer: DashboardRecentOrderBuyer | null;
  amount: number;
  status: string;
  date: string;
  statusLabel: string;
};

export type DashboardRecentOrdersData = DashboardRecentOrder[];

export type DashboardStatsResponse = BaseResponse<DashboardStatsData>;
export type DashboardRecentOrdersResponse = BaseResponse<DashboardRecentOrdersData>;

export type DashboardRecentOrdersQuery = {
  limit?: number;
};

export type DashboardRecentBuyer = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  status: string;
  addedDate: string;
};

export type DashboardRecentBuyersData = DashboardRecentBuyer[];

export type DashboardRecentBuyersResponse = BaseResponse<DashboardRecentBuyersData>;

export type DashboardRecentBuyersQuery = {
  limit?: number;
};

export type DashboardMaterialStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export type DashboardMaterial = {
  id: string;
  name: string;
  material: string;
  type: string;
  dimensions: string;
  rate: number;
  weight: number;
  unit: string;
  status: DashboardMaterialStatus;
  profileCount: number;
};

export type DashboardMaterialsData = DashboardMaterial[];

export type DashboardMaterialsResponse = BaseResponse<DashboardMaterialsData>;

export type DashboardMaterialsQuery = {
  limit?: number;
};

export type DashboardProfileType = {
  id: string;
  name: string;
  specification: string;
  material: string;
  type: string;
  materialType: string;
  materialDimensions: string;
  total: number;
};

export type DashboardProfileTypesData = DashboardProfileType[];

export type DashboardProfileTypesResponse = BaseResponse<DashboardProfileTypesData>;

export type DashboardProfileTypesQuery = {
  limit?: number;
};

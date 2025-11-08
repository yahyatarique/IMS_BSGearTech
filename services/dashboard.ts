

import apiClient, { ApiResponse } from '@/lib/api-client';
import {
  DashboardStatsResponse,
  DashboardRecentOrdersResponse,
  DashboardRecentOrdersQuery,
  DashboardRecentBuyersResponse,
  DashboardRecentBuyersQuery,
  DashboardMaterialsResponse,
  DashboardMaterialsQuery,
  DashboardProfileTypesResponse,
  DashboardProfileTypesQuery,
} from './types/dashboard.api.type';

const BASE_URL = '/dashboard';

export const endpoints = {
  stats: `${BASE_URL}/stats`,
  recentOrders: `${BASE_URL}/recent-orders`,
  recentBuyers: `${BASE_URL}/recent-buyers`,
  materials: `${BASE_URL}/materials`,
  profileTypes: `${BASE_URL}/profile-types`,
};

export const fetchDashboardStats = async (): Promise<ApiResponse<DashboardStatsResponse>> => {
  try {
    const res = await apiClient.get<DashboardStatsResponse>(endpoints.stats);
    return res;
  } catch (error) {
    throw error;
  }
};

export const fetchRecentOrders = async (
  params?: DashboardRecentOrdersQuery,
): Promise<ApiResponse<DashboardRecentOrdersResponse>> => {
 try {
   return apiClient.get<DashboardRecentOrdersResponse>(endpoints.recentOrders, {
    params,
  });
 } catch (error) {
   console.error('Error fetching recent orders:', error);
   throw error;
 }
};

export const fetchRecentBuyers = async (
  params?: DashboardRecentBuyersQuery,
): Promise<ApiResponse<DashboardRecentBuyersResponse>> => {
  try {
    return apiClient.get<DashboardRecentBuyersResponse>(endpoints.recentBuyers, {
    params,
  }); 
  } catch (error) {
    console.error('Error fetching recent buyers:', error);
    throw error;
  }
};

export const fetchDashboardMaterials = async (
  params?: DashboardMaterialsQuery,
): Promise<ApiResponse<DashboardMaterialsResponse>> => {
  return apiClient.get<DashboardMaterialsResponse>(endpoints.materials, {
    params,
  });
};

export const fetchDashboardProfileTypes = async (
  params?: DashboardProfileTypesQuery,
): Promise<ApiResponse<DashboardProfileTypesResponse>> => {
  return apiClient.get<DashboardProfileTypesResponse>(endpoints.profileTypes, {
    params,
  });
};

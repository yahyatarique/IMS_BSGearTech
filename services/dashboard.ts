import { AxiosResponse } from 'axios';
import axiosInstance from '@/axios';
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

export const fetchDashboardStats = async (): Promise<AxiosResponse<DashboardStatsResponse>> => {
  return axiosInstance.get<DashboardStatsResponse>(endpoints.stats);
};

export const fetchRecentOrders = async (
  params?: DashboardRecentOrdersQuery,
): Promise<AxiosResponse<DashboardRecentOrdersResponse>> => {
 try {
   return axiosInstance.get<DashboardRecentOrdersResponse>(endpoints.recentOrders, {
    params,
  });
 } catch (error) {
   console.error('Error fetching recent orders:', error);
   throw error;
 }
};

export const fetchRecentBuyers = async (
  params?: DashboardRecentBuyersQuery,
): Promise<AxiosResponse<DashboardRecentBuyersResponse>> => {
  try {
    return axiosInstance.get<DashboardRecentBuyersResponse>(endpoints.recentBuyers, {
    params,
  }); 
  } catch (error) {
    console.error('Error fetching recent buyers:', error);
    throw error;
  }
};

export const fetchDashboardMaterials = async (
  params?: DashboardMaterialsQuery,
): Promise<AxiosResponse<DashboardMaterialsResponse>> => {
  return axiosInstance.get<DashboardMaterialsResponse>(endpoints.materials, {
    params,
  });
};

export const fetchDashboardProfileTypes = async (
  params?: DashboardProfileTypesQuery,
): Promise<AxiosResponse<DashboardProfileTypesResponse>> => {
  return axiosInstance.get<DashboardProfileTypesResponse>(endpoints.profileTypes, {
    params,
  });
};

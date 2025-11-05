import axiosInstance from '@/axios';
import { DashboardStatsResponse } from './types/dashboard.api.type';
import { Axios, AxiosResponse } from 'axios';

const BASE_URL = '/dashboard';

export const endpoints = {
  stats: `${BASE_URL}/stats`
};

export async function fetchDashboardStats(): Promise<AxiosResponse<DashboardStatsResponse>> {
  try {
    const res: AxiosResponse<DashboardStatsResponse> = await axiosInstance.get(endpoints.stats);

    return res;
  } catch (error) {
    throw error;
  }
}

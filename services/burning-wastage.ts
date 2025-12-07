import axiosInstance from '@/axios';
import type {
  BurningWastageListResponse,
  BurningWastageResponse,
  CreateBurningWastageRequest,
} from './types/burning-wastage.api.type';

export async function fetchBurningWastage(
  page: number = 1,
  limit: number = 10
): Promise<BurningWastageListResponse> {
  const response = await axiosInstance.get('/burning-wastage', {
    params: { page, limit },
  });
  return response.data;
}

export async function createBurningWastage(
  data: CreateBurningWastageRequest
): Promise<BurningWastageResponse> {
  const response = await axiosInstance.post('/burning-wastage', data);
  return response.data;
}

export async function deleteBurningWastage(id: string): Promise<BurningWastageResponse> {
  const response = await axiosInstance.delete('/burning-wastage', {
    params: { id },
  });
  return response.data;
}

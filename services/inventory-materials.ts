import apiClient from '@/lib/api-client';
import { BaseResponse } from './types/base.api.type';

export interface InventoryMaterial {
  material: string;
  name: string;
  stock: number;
  pendingDelivery: number;
  profileCount: number;
  status: string;
}

export interface FetchInventoryMaterialsParams {
  limit?: number;
  search?: string;
}

export interface FetchInventoryMaterialsResponse extends BaseResponse<InventoryMaterial[]> {}

export const fetchInventoryMaterials = async (
  params: FetchInventoryMaterialsParams = {}
): Promise<FetchInventoryMaterialsResponse> => {
  const response = await apiClient.get<FetchInventoryMaterialsResponse>('/inventory/materials', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  return response.data;
};
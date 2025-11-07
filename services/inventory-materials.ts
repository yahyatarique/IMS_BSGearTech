import apiClient from '@/axios';
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
  const queryParams = new URLSearchParams();
  
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  if (params.search) {
    queryParams.append('search', params.search);
  }

  const queryString = queryParams.toString();
  const url = `/api/inventory/materials${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<FetchInventoryMaterialsResponse>(url);
  return response.data;
};
import apiClient, { ApiResponse } from '@/lib/api-client';
import {
  GetInventoryResponse,
  GetInventoryItemResponse,
  CreateInventoryResponse,
  UpdateInventoryResponse,
  DeleteInventoryResponse,
  GetInventoryMaterialsResponse,
  MaterialDimensionsResponse,
} from './types/inventory.api.type';
import { CreateInventoryInput, UpdateInventoryInput, InventoryListQuery } from '@/schemas/inventory.schema';

const INVENTORY_URL = '/inventory';

/**
 * Fetch materials summary from inventory
 */
export const fetchInventoryMaterials = async (params?: { limit?: number }): Promise<GetInventoryMaterialsResponse> => {
  const response = await apiClient.get<GetInventoryMaterialsResponse>(INVENTORY_URL, {
    params: { view: 'materials', ...params },
  });
  return response.data;
};

/**
 * Fetch list of inventory items with meta (pagination) and filters
 */
export const fetchInventory = async (params?: InventoryListQuery): Promise<GetInventoryResponse> => {
  const response = await apiClient.get<GetInventoryResponse>(INVENTORY_URL, { params });
  return response.data;
};

/**
 * Fetch a single inventory item by ID
 */
export const fetchInventoryItem = async (id: string): Promise<GetInventoryItemResponse> => {
  const response = await apiClient.get<GetInventoryItemResponse>(`${INVENTORY_URL}/${id}`);
  return response.data;
};

/**
 * Create a new inventory item
 */
export const createInventoryItem = async (data: CreateInventoryInput): Promise<CreateInventoryResponse> => {
  const response = await apiClient.post<CreateInventoryResponse>(INVENTORY_URL, data);
  return response.data;
};

/**
 * Update an existing inventory item
 */
export const updateInventoryItem = async (
  id: string,
  data: UpdateInventoryInput
): Promise<UpdateInventoryResponse> => {
  const response = await apiClient.put<UpdateInventoryResponse>(`${INVENTORY_URL}/${id}`, data);
  return response.data;
};

/**
 * Delete an inventory item
 */
export const deleteInventoryItem = async (id: string): Promise<DeleteInventoryResponse> => {
  const response = await apiClient.delete<DeleteInventoryResponse>(`${INVENTORY_URL}/${id}`);
  return response.data;
};

/**
 * Fetch available material dimensions for a specific material type
 */
export const fetchMaterialDimensions = async (materialType: 'CR-5' | 'EN-9'): Promise<ApiResponse<MaterialDimensionsResponse>> => {
  const response = await apiClient.get<MaterialDimensionsResponse>(`${INVENTORY_URL}/material-dimensions`, {
    params: { material_type: materialType },
  });
  return response;
};

import axiosInstance from '@/axios';
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
import { AxiosResponse } from 'axios';

const INVENTORY_URL = '/inventory';

/**
 * Fetch materials summary from inventory
 */
export const fetchInventoryMaterials = async (params?: { limit?: number }): Promise<GetInventoryMaterialsResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('view', 'materials');
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = `${INVENTORY_URL}?${queryParams}`;
  const response = await axiosInstance.get<GetInventoryMaterialsResponse>(url);
  return response.data;
};

/**
 * Fetch list of inventory items with meta (pagination) and filters
 */
export const fetchInventory = async (params?: InventoryListQuery): Promise<GetInventoryResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.material_type) queryParams.append('material_type', params.material_type);
  if (params?.search) queryParams.append('search', params.search);

  const url = queryParams.toString() ? `${INVENTORY_URL}?${queryParams}` : INVENTORY_URL;
  const response = await axiosInstance.get<GetInventoryResponse>(url);
  return response.data;
};

/**
 * Fetch a single inventory item by ID
 */
export const fetchInventoryItem = async (id: string): Promise<GetInventoryItemResponse> => {
  const response = await axiosInstance.get<GetInventoryItemResponse>(`${INVENTORY_URL}/${id}`);
  return response.data;
};

/**
 * Create a new inventory item
 */
export const createInventoryItem = async (data: CreateInventoryInput): Promise<CreateInventoryResponse> => {
  const response = await axiosInstance.post<CreateInventoryResponse>(INVENTORY_URL, data);
  return response.data;
};

/**
 * Update an existing inventory item
 */
export const updateInventoryItem = async (
  id: string,
  data: UpdateInventoryInput
): Promise<UpdateInventoryResponse> => {
  const response = await axiosInstance.put<UpdateInventoryResponse>(`${INVENTORY_URL}/${id}`, data);
  return response.data;
};

/**
 * Delete an inventory item
 */
export const deleteInventoryItem = async (id: string): Promise<DeleteInventoryResponse> => {
  const response = await axiosInstance.delete<DeleteInventoryResponse>(`${INVENTORY_URL}/${id}`);
  return response.data;
};

/**
 * Fetch available material dimensions for a specific material type
 */
export const fetchMaterialDimensions = async (materialType: 'CR-5' | 'EN-9'): Promise<AxiosResponse<MaterialDimensionsResponse>> => {
  const response = await axiosInstance.get(`${INVENTORY_URL}/material-dimensions`, {
    params: { material_type: materialType },
  });
  return response;
};

import axiosInstance from '@/axios';
import {
  GetInventoryResponse,
  GetInventoryItemResponse,
  CreateInventoryResponse,
  UpdateInventoryResponse,
  DeleteInventoryResponse,
} from './types/inventory.api.type';
import { CreateInventoryInput, UpdateInventoryInput, InventoryListQuery } from '@/schemas/inventory.schema';

const INVENTORY_URL = '/inventory';

/**
 * Fetch list of inventory items with meta (pagination) and filters
 */
export const fetchInventory = async (params?: InventoryListQuery): Promise<GetInventoryResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.material_type) queryParams.append('material_type', params.material_type);
  if (params?.status) queryParams.append('status', params.status);
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
 * Update inventory item status
 */
export const updateInventoryStatus = async (
  id: string,
  status: 'available' | 'reserved' | 'used' | 'damaged'
): Promise<UpdateInventoryResponse> => {
  return updateInventoryItem(id, { status });
};

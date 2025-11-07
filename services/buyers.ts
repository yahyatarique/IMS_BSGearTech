import apiClient from '@/lib/api-client';
import {
  GetBuyersResponse,
  GetBuyerResponse,
  CreateBuyerResponse,
  UpdateBuyerResponse,
  DeleteBuyerResponse,
} from './types/buyer.api.type';
import { CreateBuyerInput, UpdateBuyerInput, BuyerListQuery } from '@/schemas/buyer.schema';

const BUYERS_URL = '/buyers';

/**
 * Fetch list of buyers with meta (pagination) and filters
 */
export const fetchBuyers = async (params?: BuyerListQuery): Promise<GetBuyersResponse> => {
  const response = await apiClient.get<GetBuyersResponse>(BUYERS_URL, { params });
  return response.data;
};

/**
 * Fetch a single buyer by ID
 */
export const fetchBuyer = async (id: string): Promise<GetBuyerResponse> => {
  const response = await apiClient.get<GetBuyerResponse>(`${BUYERS_URL}/${id}`);
  return response.data;
};

/**
 * Create a new buyer
 */
export const createBuyer = async (data: CreateBuyerInput): Promise<CreateBuyerResponse> => {
  const response = await apiClient.post<CreateBuyerResponse>(BUYERS_URL, data);
  return response.data;
};

/**
 * Update an existing buyer
 */
export const updateBuyer = async (
  id: string,
  data: UpdateBuyerInput
): Promise<UpdateBuyerResponse> => {
  const response = await apiClient.put<UpdateBuyerResponse>(`${BUYERS_URL}/${id}`, data);
  return response.data;
};

/**
 * Delete a buyer (soft delete by setting status to inactive)
 */
export const deleteBuyer = async (id: string): Promise<DeleteBuyerResponse> => {
  const response = await apiClient.delete<DeleteBuyerResponse>(`${BUYERS_URL}/${id}`);
  return response.data;
};

/**
 * Toggle buyer status between active/inactive
 */
export const toggleBuyerStatus = async (
  id: string,
  currentStatus: 'active' | 'inactive' | 'blocked'
): Promise<UpdateBuyerResponse> => {
  return updateBuyer(id, { status: currentStatus });
};

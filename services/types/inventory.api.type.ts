import { BaseResponse } from './base.api.type';
import { InventoryAttributes } from '@/db/models/Inventory';
import { CreateInventoryInput, UpdateInventoryInput } from '@/schemas/inventory.schema';

// Inventory record type
export type InventoryRecord = InventoryAttributes;

// API Response Types
export type GetInventoryResponse = BaseResponse<InventoryRecord>;

export type GetInventoriesResponse = BaseResponse<{
  items: InventoryRecord[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}>;

export type CreateInventoryResponse = BaseResponse<InventoryRecord>;

export type UpdateInventoryResponse = BaseResponse<InventoryRecord>;

export type DeleteInventoryResponse = BaseResponse<{ message: string }>;

// API Request Types
export type CreateInventoryRequest = CreateInventoryInput;

export type UpdateInventoryRequest = UpdateInventoryInput;

// Filter and query types
export type InventoryFilters = {
  material_type?: 'CR-5' | 'EN-9';
  status?: 'available' | 'reserved' | 'used' | 'damaged';
  po_number?: string;
  search?: string;
  page?: number;
  limit?: number;
};

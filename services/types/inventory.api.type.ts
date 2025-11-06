import { BaseResponse } from './base.api.type';

// Inventory record structure matching DB model
export interface InventoryRecord {
  id: string;
  material_type: 'CR-5' | 'EN-9';
  material_weight: number;
  cut_size_width: number;
  cut_size_height: number;
  po_number?: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// Inventory list metadata structure
export type InventoryListMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// API Response Types
export type GetInventoryResponse = BaseResponse<{
  inventory: InventoryRecord[];
  meta: InventoryListMeta;
}>;

export type GetInventoryItemResponse = BaseResponse<InventoryRecord>;

export type CreateInventoryResponse = BaseResponse<InventoryRecord>;

export type UpdateInventoryResponse = BaseResponse<InventoryRecord>;

export type DeleteInventoryResponse = BaseResponse<{ message: string }>;

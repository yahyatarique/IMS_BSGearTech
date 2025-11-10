import { BaseResponse } from './base.api.type';
import { MaterialType } from '../../schemas/inventory.schema';

// Material info structure
export interface MaterialInfo {
  name: string;
  material: string;
  type: string;
  stock: number;
  pendingDelivery: number;
  unit: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  profileCount: number;
}

// Inventory record structure matching DB model with material info
export interface InventoryRecord {
  id: string;
  material_type: 'CR-5' | 'EN-9';
  material_weight: number;
  width: number;
  height: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  materialInfo?: MaterialInfo; // Added material summary info
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

export type MaterialStats = Record<string, InventoryStats[]>;

export type InventoryStatsResponse = BaseResponse<{
  stats: MaterialStats;
}>;

export interface InventoryStats {
  dimensions: {
    outer_diameter: number;
    length: number;
  };
  total: {
    weight: number;
    quantity: number;
  };
  pending: {
    weight: number;
    quantity: number;
  };
  available: {
    weight: number;
    quantity: number;
  };
  unit: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

// Material summary structure (same as dashboard but from inventory endpoint)
export interface InventoryMaterial {
  id: string;
  name: string;
  material: string;
  type: string;
  stock: number;
  pendingDelivery: number;
  unit: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  profileCount: number;
}

export type GetInventoryMaterialsResponse = BaseResponse<InventoryMaterial[]>;

export type MaterialDimensionsResponse = BaseResponse<{
  dimensions: MaterialDimension[];
  material_type: MaterialType;
  total_options: number;
}>;

export type MaterialDimension = {
  width: number;
  height: number;
  available_count: number;
};

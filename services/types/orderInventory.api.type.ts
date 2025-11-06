import { BaseResponse } from './base.api.type';

/**
 * Order-Inventory record structure
 * Represents a link between an order and inventory item with usage tracking
 */
export interface OrderInventoryRecord {
  id: string;
  order_id: string;
  inventory_id: string;
  quantity_used: number;
  weight_used?: number | null;
  notes?: string | null;
  reserved_at?: string | null;
  used_at?: string | null;
  created_at: string;
  updated_at: string;
  // Optional populated relations
  order?: {
    id: string;
    order_number: string;
    status: string;
  };
  inventory?: {
    id: string;
    material_type: 'CR-5' | 'EN-9';
    material_weight: number;
    po_number?: string;
    status: string;
  };
}

/**
 * Request body for creating a new order-inventory record
 */
export interface CreateOrderInventoryRequest {
  order_id: string;
  inventory_id: string;
  quantity_used: number;
  weight_used?: number | null;
  notes?: string | null;
  reserved_at?: string | null;
  used_at?: string | null;
}

/**
 * Request body for updating an order-inventory record
 */
export interface UpdateOrderInventoryRequest {
  quantity_used?: number;
  weight_used?: number | null;
  notes?: string | null;
  reserved_at?: string | null;
  used_at?: string | null;
}

/**
 * Response for creating a new order-inventory record
 */
export interface CreateOrderInventoryResponse extends BaseResponse<OrderInventoryRecord> {}

/**
 * Response for getting a single order-inventory record
 */
export interface GetOrderInventoryResponse extends BaseResponse<OrderInventoryRecord> {}

/**
 * Response for getting multiple order-inventory records with pagination
 */
export interface GetOrderInventoriesResponse extends BaseResponse<OrderInventoryRecord[]> {
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Response for updating an order-inventory record
 */
export interface UpdateOrderInventoryResponse extends BaseResponse<OrderInventoryRecord> {}

/**
 * Response for deleting an order-inventory record
 */
export interface DeleteOrderInventoryResponse extends BaseResponse<{ id: string }> {}

/**
 * Query filters for listing order-inventory records
 */
export interface OrderInventoryFilters {
  order_id?: string;
  inventory_id?: string;
  reserved_after?: string;
  used_after?: string;
  page?: number;
  limit?: number;
}

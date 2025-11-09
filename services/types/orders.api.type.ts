import { BasePaginatedResponse, BaseResponse } from './base.api.type';
import { ORDER_STATUS } from '@/enums/orders.enum';

export type OrderRecord = {
  id: string;
  order_number: string;
  created_at: string;
  buyer_id?: string;
  status: ORDER_STATUS;
  grand_total: number;
  material_cost: number;
  process_costs: number;
  turning_rate: number;
  teeth_count?: number;
  module?: number;
  face?: number;
  weight?: number;
  ht_cost: number;
  total_order_value: number;
  profit_margin: number;
  user_id?: string;
  buyer?: {
    id: string;
    name: string;
    org_name?: string;
  };
  user?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
};

export type OrdersListResponse = BasePaginatedResponse<{ orders: OrderRecord[] }>;

export type OrderResponse = BaseResponse<OrderRecord>;

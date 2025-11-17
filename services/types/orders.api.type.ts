import { BasePaginatedResponse, BaseResponse } from './base.api.type';
import { ORDER_STATUS } from '@/enums/orders.enum';

export type OrderRecord = {
  id: string;
  order_number: string;
  order_name?: string;
  quantity: number;
  created_at: string;
  buyer_id?: string;
  status: ORDER_STATUS;
  grand_total: string;
  total_order_value: string;
  profit_margin: string;
  burning_wastage_percent: string;
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
  orderProfiles?: Array<{
    id: string;
    profile_id: string;
    name: string;
    type: '0' | '1';
    material: 'CR-5' | 'EN-9';
    no_of_teeth: number;
    rate: number;
    face: number;
    module: number;
    finish_size?: string;
    burning_weight: number;
    total_weight: number;
    ht_cost: number;
    ht_rate: number;
    processes?: any;
    cyn_grinding: number;
    total: number;
    profit: number;
  }>;
};

export type OrdersListResponse = BasePaginatedResponse<{ orders: OrderRecord[] }>;

export type OrderStatusUpdateRequest = {
  status: '0' | '1' | '2';
};

export type OrderStatusUpdateResponse = BaseResponse<OrderRecord>;

export type OrderResponse = BaseResponse<OrderRecord>;

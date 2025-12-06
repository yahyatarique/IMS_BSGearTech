import { OrderProfilesRecord } from '@/schemas/create-order.schema';
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
  burning_wastage_kg?: number;
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
  orderProfiles?: OrderProfilesRecord[];
};

export type OrdersListResponse = BasePaginatedResponse<{ orders: OrderRecord[] }>;

export type OrderStatusUpdateRequest = {
  status: '0' | '1' | '2';
};

export type OrderStatusUpdateResponse = BaseResponse<OrderRecord>;

export type OrderResponse = BaseResponse<OrderRecord>;

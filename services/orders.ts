import axiosInstance from '@/axios';
import { CreateOrderInput, UpdateOrderInput } from '@/schemas/order.schema';
import { OrdersListResponse, OrderResponse, OrderStatusUpdateRequest, OrderStatusUpdateResponse } from './types/orders.api.type';

import { ORDER_STATUS } from '@/enums/orders.enum';

export async function fetchOrders(params?: {
  page?: number;
  limit?: number;
  status?: ORDER_STATUS;
  buyer_id?: string;
  search?: string;
}): Promise<OrdersListResponse> {
  const response = await axiosInstance.get('/orders', { params });
  return response.data;
}

export async function fetchOrderById(id: string): Promise<OrderResponse> {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data;
}

export async function createOrder(data: CreateOrderInput): Promise<OrderResponse> {
  const response = await axiosInstance.post('/orders', data);
  return response.data;
}

export async function updateOrder(id: string, data: UpdateOrderInput): Promise<OrderResponse> {
  const response = await axiosInstance.put(`/orders/${id}`, data);
  return response.data;
}

export async function deleteOrder(id: string): Promise<{ success: boolean }> {
  const response = await axiosInstance.delete(`/orders/${id}`);
  return response.data;
}

export async function updateOrderStatus(id: string, data: OrderStatusUpdateRequest): Promise<OrderStatusUpdateResponse> {
  const response = await axiosInstance.patch(`/orders/${id}`, data);
  return response.data;
}

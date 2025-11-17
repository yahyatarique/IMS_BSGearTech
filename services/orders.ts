import axiosInstance from '@/axios';
import { CreateOrderInput, UpdateOrderInput } from '@/schemas/order.schema';
import {
  OrdersListResponse,
  OrderResponse,
  OrderStatusUpdateRequest,
  OrderStatusUpdateResponse
} from './types/orders.api.type';

import { ORDER_STATUS } from '@/enums/orders.enum';
import { AxiosResponse } from 'axios';


const BASE_URL = '/orders';

const endpoints = {
  orders: `${BASE_URL}`,
  orderById: (id: string) => `${BASE_URL}/${id}`,
}

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

export async function fetchOrderById(id: string): Promise<AxiosResponse<OrderResponse>> {
  const response: AxiosResponse<OrderResponse> = await axiosInstance.get(endpoints.orderById(id));
  return response;
}

export async function createOrder(data: CreateOrderInput): Promise<AxiosResponse<OrderResponse>> {
  const response: AxiosResponse<OrderResponse> = await axiosInstance.post(endpoints.orders, data);
  return response;
}

export async function updateOrder(
  id: string,
  data: UpdateOrderInput
): Promise<AxiosResponse<OrderResponse>> {
  const response: AxiosResponse<OrderResponse> = await axiosInstance.put(endpoints.orderById(id), data);
  return response;
}

export async function deleteOrder(id: string): Promise<{ success: boolean }> {
  const response = await axiosInstance.delete(endpoints.orderById(id));
  return response.data;
}

export async function updateOrderStatus(
  id: string,
  data: OrderStatusUpdateRequest
): Promise<OrderStatusUpdateResponse> {
  const response = await axiosInstance.patch(endpoints.orderById(id), data);
  return response.data;
}

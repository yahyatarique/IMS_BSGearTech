import apiClient, { ApiResponse } from '@/lib/api-client';
import {
  UsersListResponse,
  UserResponse,
  CreateUserPayload,
  UpdateUserPayload,
  DeleteUserResponse,
} from './types/users.api.type';

const BASE_URL = '/users';

type FetchUsersParams = {
  page?: number;
  pageSize?: number;
};

export const fetchUsers = async (params?: FetchUsersParams): Promise<ApiResponse<UsersListResponse>> => {
  return apiClient.get<UsersListResponse>(BASE_URL, { params });
};

export const fetchUserById = async (id: string): Promise<ApiResponse<UserResponse>> => {
  return apiClient.get<UserResponse>(`${BASE_URL}/${id}`);
};

export const createUser = async (
  payload: CreateUserPayload,
): Promise<ApiResponse<UserResponse>> => {
  return apiClient.post<UserResponse>(BASE_URL, payload);
};

export const updateUser = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<ApiResponse<UserResponse>> => {
  return apiClient.patch<UserResponse>(`${BASE_URL}/${id}`, payload);
};

export const deleteUser = async (id: string): Promise<ApiResponse<DeleteUserResponse>> => {
  return apiClient.delete<DeleteUserResponse>(`${BASE_URL}/${id}`);
};

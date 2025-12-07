import { AxiosResponse } from 'axios';
import axiosInstance from '@/axios';
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

export const fetchUsers = async (params?: FetchUsersParams): Promise<AxiosResponse<UsersListResponse>> => {
  return axiosInstance.get<UsersListResponse>(BASE_URL, { params });
};

export const fetchUserById = async (id: string): Promise<AxiosResponse<UserResponse>> => {
  return axiosInstance.get<UserResponse>(`${BASE_URL}/${id}`);
};

export const createUser = async (
  payload: CreateUserPayload,
): Promise<AxiosResponse<UserResponse>> => {
  return axiosInstance.post<UserResponse>(BASE_URL, payload);
};

export const updateUser = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<AxiosResponse<UserResponse>> => {
  return axiosInstance.patch<UserResponse>(`${BASE_URL}/${id}`, payload);
};

export const deleteUser = async (id: string): Promise<AxiosResponse<DeleteUserResponse>> => {
  return axiosInstance.delete<DeleteUserResponse>(`${BASE_URL}/${id}`);
};

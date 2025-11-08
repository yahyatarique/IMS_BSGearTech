import { CreateUserInput, GetCurrentUserRes, LoginInput, LoginRes, RegisterRes, UpdateUserInput, UpdateUserRes } from "./types/auth.api.type";
import apiClient, { ApiResponse } from "../lib/api-client";


const BASE_URL = '/auth';

export const endpoints = {
  login: `${BASE_URL}/login`,
  logout: `${BASE_URL}/logout`,
  register: `${BASE_URL}/register`,
  refreshToken: `${BASE_URL}/refresh-token`,
  me: `${BASE_URL}/me`,
}

export const login = async (payload: LoginInput): Promise<ApiResponse<LoginRes>> => {
  try {
    const res = await apiClient.post<LoginRes>(endpoints.login, payload);
    return res;
  } catch (error) {
    throw error;
  }
}

export const register = async (payload: CreateUserInput): Promise<ApiResponse<RegisterRes>> => {
  try {
    const res = await apiClient.post<RegisterRes>(endpoints.register, payload);
    return res;
  } catch (error) {
    throw error;
  }
}


export const updateUser = async (payload: UpdateUserInput): Promise<ApiResponse<UpdateUserRes>> => {
  try {
    const res = await apiClient.put<UpdateUserRes>(endpoints.register, payload);
    return res;
  } catch (error) {
    throw error;
  }
}

export const logout = async (): Promise<ApiResponse> => {
  try {
    const res = await apiClient.post(endpoints.logout);
    return res;
  } catch (error) {
    throw error;
  }
}


export const refreshToken = async (): Promise<ApiResponse> => {
  return apiClient.post(endpoints.refreshToken);
}

export const getCurrentUser = async (): Promise<GetCurrentUserRes> => {
  try {
    const res = await apiClient.get<GetCurrentUserRes>(endpoints.me);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export const updateProfile = async (payload: Pick<UpdateUserInput, 'firstName' | 'lastName'>): Promise<UpdateUserRes> => {
  try {
    const res = await apiClient.put<UpdateUserRes>(endpoints.me, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}
import { AxiosResponse } from "axios";
import axiosInstance from "../axios";
import { CreateUserInput, GetCurrentUserRes, LoginInput, LoginRes, RegisterRes, UpdateUserInput, UpdateUserRes } from "./types/auth.api.type";


const BASE_URL = 'auth';

export const endpoints = {
  login: `${BASE_URL}/login`,
  logout: `${BASE_URL}/logout`,
  register: `${BASE_URL}/register`,
  refreshToken: `${BASE_URL}/refresh-token`,
  me: `${BASE_URL}/me`,
}

export const login = async (payload: LoginInput): Promise<AxiosResponse<LoginRes>> => {
  try {
    const res: AxiosResponse<LoginRes> = await axiosInstance.post(endpoints.login, payload, {
      withCredentials: false
    });
    return res;
  } catch (error) {
    throw error;
  }
}

export const register = async (payload: CreateUserInput): Promise<AxiosResponse<RegisterRes>> => {
  try {
    const res = await axiosInstance.post(endpoints.register, payload, {
      withCredentials: false
    });
    return res;
  } catch (error) {
    throw error;
  }
}


export const updateUser = async (payload: UpdateUserInput): Promise<AxiosResponse<UpdateUserRes>> => {
  try {
    const res = await axiosInstance.put(endpoints.register, payload);
    return res;
  } catch (error) {
    throw error;
  }
}

export const logout = async (): Promise<AxiosResponse> => {
  try {
    const res = await axiosInstance.post(endpoints.logout);
    return res;
  } catch (error) {
    throw error;
  }
}


export const refreshToken = async (): Promise<AxiosResponse> => {
  return axiosInstance.post(endpoints.refreshToken, undefined, {
    withCredentials: false,
  });
}

export const getCurrentUser = async (): Promise<GetCurrentUserRes> => {
  try {
    const res = await axiosInstance.get<GetCurrentUserRes>(endpoints.me);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export const updateProfile = async (payload: Pick<UpdateUserInput, 'firstName' | 'lastName'>): Promise<UpdateUserRes> => {
  try {
    const res = await axiosInstance.put<UpdateUserRes>(endpoints.me, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}
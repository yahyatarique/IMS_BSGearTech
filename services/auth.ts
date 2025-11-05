import { AxiosResponse } from "axios";
import axiosInstance from "../axios";
import { CreateUserInput, LoginInput, LoginRes, UpdateUserInput } from "./types/auth.api.type";


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

export const register = async (payload: CreateUserInput) => {
  try {
    const res = await axiosInstance.post(endpoints.register, payload, {
      withCredentials: false
    });
    return res;
  } catch (error) {
    throw error;
  }
}


export const updateUser = async (payload: UpdateUserInput) => {
  try {
    const res = await axiosInstance.put(endpoints.register, payload);
    return res;
  } catch (error) {
    throw error;
  }
}

export const logout = async () => {
  try {
    const res = await axiosInstance.post(endpoints.logout);
    return res;
  } catch (error) {
    throw error;
  }
}


export const refreshToken = async () => {
  return axiosInstance.post(endpoints.refreshToken, undefined, {
    withCredentials: false,
  });
}

export const getCurrentUser = async () => {
  try {
    const res = await axiosInstance.get(endpoints.me);
    return res.data;
  } catch (error) {
    throw error;
  }
}
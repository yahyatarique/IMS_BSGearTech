import axiosInstance from "../axios";
import { CreateUserInput, LoginInput, LoginRes, RefreshTokenInput, UpdateUserInput } from "./types/auth.api.type";


const BASE_URL = 'auth';

export const endpoints = {
  login: `${BASE_URL}/login`,
  logout: `${BASE_URL}/logout`,
  register: `${BASE_URL}/register`,
  refreshToken: `${BASE_URL}/refresh-token`,
}

export const login = async (payload: LoginInput): LoginRes => {
  try {
    const res = await axiosInstance.post(endpoints.login, payload, {
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


export const refreshToken = async (refreshToken: RefreshTokenInput) => {
  try {
    const res = await axiosInstance.post(endpoints.refreshToken, refreshToken);
    return res;
  } catch (error) {
    throw error;
  }
}
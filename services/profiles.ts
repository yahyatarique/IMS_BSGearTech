import axiosInstance from '@/axios';
import {
  GetProfilesResponse,
  GetProfileResponse,
  CreateProfileResponse,
  UpdateProfileResponse,
  DeleteProfileResponse,
} from './types/profile.api.type';
import { CreateProfileInput, UpdateProfileInput, ProfileListQuery } from '@/schemas/profile.schema';

const PROFILES_URL = '/profiles';

/**
 * Fetch list of profiles with meta (pagination) and filters
 */
export const fetchProfiles = async (params?: ProfileListQuery): Promise<GetProfilesResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.type) queryParams.append('type', params.type);
  if (params?.material) queryParams.append('material', params.material);
  if (params?.search) queryParams.append('search', params.search);

  const url = queryParams.toString() ? `${PROFILES_URL}?${queryParams}` : PROFILES_URL;
  const response = await axiosInstance.get<GetProfilesResponse>(url);
  return response.data;
};

/**
 * Fetch a single profile by ID
 */
export const fetchProfile = async (id: string): Promise<GetProfileResponse> => {
  const response = await axiosInstance.get<GetProfileResponse>(`${PROFILES_URL}/${id}`);
  return response.data;
};

/**
 * Create a new profile
 */
export const createProfile = async (data: CreateProfileInput): Promise<CreateProfileResponse> => {
  const response = await axiosInstance.post<CreateProfileResponse>(PROFILES_URL, data);
  return response.data;
};

/**
 * Update an existing profile
 */
export const updateProfile = async (
  id: string,
  data: UpdateProfileInput
): Promise<UpdateProfileResponse> => {
  const response = await axiosInstance.put<UpdateProfileResponse>(`${PROFILES_URL}/${id}`, data);
  return response.data;
};

/**
 * Delete a profile
 */
export const deleteProfile = async (id: string): Promise<DeleteProfileResponse> => {
  const response = await axiosInstance.delete<DeleteProfileResponse>(`${PROFILES_URL}/${id}`);
  return response.data;
};

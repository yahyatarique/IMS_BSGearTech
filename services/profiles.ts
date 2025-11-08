import apiClient from '@/lib/api-client';
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
  const response = await apiClient.get<GetProfilesResponse>(PROFILES_URL, { params });
  return response.data;
};

/**
 * Fetch a single profile by ID
 */
export const fetchProfile = async (id: string): Promise<GetProfileResponse> => {
  const response = await apiClient.get<GetProfileResponse>(`${PROFILES_URL}/${id}`);
  return response.data;
};

/**
 * Create a new profile
 */
export const createProfile = async (data: CreateProfileInput): Promise<CreateProfileResponse> => {
  const response = await apiClient.post<CreateProfileResponse>(PROFILES_URL, data);
  return response.data;
};

/**
 * Update an existing profile
 */
export const updateProfile = async (
  id: string,
  data: UpdateProfileInput
): Promise<UpdateProfileResponse> => {
  const response = await apiClient.put<UpdateProfileResponse>(`${PROFILES_URL}/${id}`, data);
  return response.data;
};

/**
 * Delete a profile
 */
export const deleteProfile = async (id: string): Promise<DeleteProfileResponse> => {
  const response = await apiClient.delete<DeleteProfileResponse>(`${PROFILES_URL}/${id}`);
  return response.data;
};

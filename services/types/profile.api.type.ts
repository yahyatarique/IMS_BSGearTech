import { MATERIALS, PROFILE_TYPES } from '../../enums/material.enum';
import { BaseResponse } from './base.api.type';

// Profile record structure matching DB model
export interface ProfileRecord {
  id: string;
  name: string;
  type: PROFILE_TYPES;
  material: MATERIALS;
  material_rate: number;
  cut_size_width_mm: number;
  cut_size_height_mm: number;
  burning_wastage_percent: number;
  heat_treatment_rate: number;
  heat_treatment_inefficacy_percent: number;
}

// Profile list metadata structure
export type ProfilesListMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// API Response Types
export type GetProfilesResponse = BaseResponse<{
  profiles: ProfileRecord[];
  meta: ProfilesListMeta;
}>;

export type GetProfileResponse = BaseResponse<ProfileRecord>;

export type CreateProfileResponse = BaseResponse<ProfileRecord>;

export type UpdateProfileResponse = BaseResponse<ProfileRecord>;

export type DeleteProfileResponse = BaseResponse<{ message: string }>;

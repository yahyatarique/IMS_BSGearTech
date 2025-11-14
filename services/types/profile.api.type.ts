import { MATERIALS, PROFILE_TYPES } from '../../enums/material.enum';
import { BaseResponse } from './base.api.type';

// Profile record structure matching DB model
export interface ProfileRecord {
  id: string;
  name: string;
  type: PROFILE_TYPES;
  material: MATERIALS;
  material_rate: string;
  outer_diameter_mm: string;
  thickness_mm: string;
  heat_treatment_rate: string;
  heat_treatment_inefficacy_percent: string;
  inventory_id: string;
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

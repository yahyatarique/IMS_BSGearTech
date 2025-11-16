import { MATERIALS, PROFILE_TYPES } from '../../enums/material.enum';
import { Process } from '../../schemas/profile.schema';
import { BaseResponse } from './base.api.type';
import { InventoryRecord } from './inventory.api.type';

// Profile record structure matching DB model
export interface ProfileRecord {
  id: string;
  name: string;
  type: PROFILE_TYPES;
  material: MATERIALS;
  no_of_teeth: number;
  rate: string;
  face: string;
  module: string;
  finish_size?: string;
  burning_weight: string;
  total_weight: string;
  heat_treatment_cost?: number;
  teeth_cutting_grinding_cost?: number;
  ht_cost: string;
  ht_rate: string;
  processes?: Process[];
  cyn_grinding: string;
  total: string;
  inventory_id: string;
  inventory: InventoryRecord
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

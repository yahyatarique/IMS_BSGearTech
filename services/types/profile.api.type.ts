import { OrderProfilesRecord } from '@/schemas/create-order.schema';
import { BaseResponse } from './base.api.type';

// Profile record structure matching DB model
export type ProfileRecord = OrderProfilesRecord & {inventory_id?: string, updated_at: string; created_at: string;};


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

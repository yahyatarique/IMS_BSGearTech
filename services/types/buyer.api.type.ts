import { BaseResponse } from './base.api.type';
import { ContactDetails } from '@/schemas/buyer.schema';

// Buyer record structure matching DB model
export interface BuyerRecord {
  id: string;
  name: string;
  contact_details?: ContactDetails;
  gst_number?: string | null;
  pan_number?: string | null;
  tin_number?: string | null;
  org_name?: string | null;
  org_address?: string | null;
  status: 'active' | 'inactive' | 'blocked';
  created_at: string;
  updated_at: string;
}

// Buyer list metadata structure (consistent with users API)
export type BuyersListMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// API Response Types
export type GetBuyersResponse = BaseResponse<{
  buyers: BuyerRecord[];
  meta: BuyersListMeta;
}>;

export type GetBuyerResponse = BaseResponse<BuyerRecord>;

export type CreateBuyerResponse = BaseResponse<BuyerRecord>;

export type UpdateBuyerResponse = BaseResponse<BuyerRecord>;

export type DeleteBuyerResponse = BaseResponse<{ message: string }>;

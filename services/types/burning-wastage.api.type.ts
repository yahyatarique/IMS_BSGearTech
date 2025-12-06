import { BaseResponse } from './base.api.type';

export interface BurningWastageRecord {
  id: string;
  wastage_kg: number;
  date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type BurningWastageListResponse = BaseResponse<{
  wastageEntries: BurningWastageRecord[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    totalWastage: number;
    orderBurningWastage: number;
    manualAdjustments: number;
  };
}>;

export type BurningWastageResponse = BaseResponse<BurningWastageRecord>;

export interface CreateBurningWastageRequest {
  wastage_kg: number;
  date?: string | Date;
  notes?: string;
}

export interface UpdateBurningWastageRequest {
  wastage_kg?: number;
  date?: string | Date;
  notes?: string;
}

export type BaseResponse<T> = {
  data: T;
  error?: string;
  message: string;
  status: number;
  success: boolean;
};

export type BasePaginatedResponse<T> = BaseResponse<T & { meta: meta }>;

export type meta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

import { AxiosResponse } from 'axios';

export type BaseResponse<T> = Promise<
  AxiosResponse<{
    data: T;
    error?: string;
    message: string;
    status: number;
    success: boolean;
  }>
>;

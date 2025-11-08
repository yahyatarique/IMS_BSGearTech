import { CreateUserSchema, UpdateUserSchema } from '../../schemas/user.schema';
import { User } from './auth.api.type';
import { BaseResponse } from './base.api.type';
import { z } from 'zod';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type UserRecord = User;

export type UsersListCounts = {
	total: number;
	active: number;
	admins: number;
};

export type UsersListMeta = {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
	counts: UsersListCounts;
};

export type UsersListData = {
	items: UserRecord[];
	meta: UsersListMeta;
};

export type UsersListResponse = BaseResponse<UsersListData>;
export type UserResponse = BaseResponse<UserRecord>;

export type CreateUserPayload = z.infer<typeof CreateUserSchema>;

export type UpdateUserPayload = z.infer<typeof UpdateUserSchema>;

export type DeleteUserResponse = BaseResponse<{ id: string }>;

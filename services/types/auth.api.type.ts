import { z } from 'zod';
import { CreateUserSchema, LoginSchema, RefreshTokenSchema, UpdateUserSchema } from '../../schemas/user.schema';
import { BaseResponse } from './base.api.type';
import { USER_ROLES } from '../../enums/users.enum';

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

export type LoginRes = BaseResponse<{ user: User }>;

export type User = {
  id: string;
  username: string;
  role: USER_ROLES;
  first_name: string;
  last_name: string;
  created_at: string;
};

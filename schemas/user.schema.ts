import { z } from 'zod';

// User creation schema
export const CreateUserSchema = z.object({
  username: z.string().min(3).max(255),
  password: z.string().min(6).regex(/^[A-Za-z0-9]+$/, 'Password must contain only alphanumeric characters'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(['0', '1', '2']), // 0=admin, 1=manager, 2=user
});

// User login schema
export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

// User update schema
export const UpdateUserSchema = z.object({
  username: z.string().min(3).max(255).optional(),
  password: z.string().min(6).regex(/^[A-Za-z0-9]+$/).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: z.enum(['0', '1', '2']).optional(),
});

// Refresh token schema
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

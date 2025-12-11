import { z } from 'zod';

// User creation schema
export const CreateUserSchema = z.object({
  username: z.string().min(3).max(255),
  password: z.string().min(6).regex(/^[A-Za-z0-9]+$/, 'Password must contain only alphanumeric characters'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(['0', '1', '2', '3']).optional(), // 0=admin, 1=manager, 2=user, 3=supe_ops
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
  role: z.enum(['0', '1', '2', '3']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export const UserIdParamSchema = z.object({
  id: z.string(),
});

// Refresh token schema
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const UsersListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});



//FORM SCHEMA
export const userFormSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    confirmPassword: z.string().optional(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    role: z.enum(['0', '1', '2', '3']).optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword']
    }
  );
  
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ZodError } from 'zod';
import { USER_ROLES } from '@/enums/users.enum';
import { errorResponse } from '@/utils/api-response';
import { User } from '@/db/models';

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export type AdminContext = {
  role: string;
  userId?: string;
};

export async function authorizeAdmin(request: NextRequest): Promise<AdminContext> {
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    throw new HttpError(401, 'Unauthorized');
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set.');
    throw new HttpError(500, 'Server configuration error');
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(accessToken, secret);
    const role = typeof payload.role === 'string' ? payload.role : '';

    if (role !== USER_ROLES.SUPER_ADMIN && role !== USER_ROLES.ADMIN) {
      throw new HttpError(403, 'Forbidden: Admin access required');
    }

    return {
      role,
      userId: typeof payload.sub === 'string' ? payload.sub : undefined,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    console.error('Users authorization error:', error);
    throw new HttpError(401, 'Unauthorized');
  }
}

export function assertRoleAssignmentPermission(actorRole: string, desiredRole?: string) {
  if (!desiredRole) {
    return;
  }

  if (
    desiredRole === USER_ROLES.SUPER_ADMIN &&
    actorRole !== USER_ROLES.SUPER_ADMIN
  ) {
    throw new HttpError(403, 'Only super admins can assign the super admin role');
  }

    if (
    desiredRole === USER_ROLES.ADMIN &&
    actorRole !== USER_ROLES.SUPER_ADMIN
  ) {
    throw new HttpError(403, 'Only super admins can assign the admin role');
  }

  if (
    desiredRole === USER_ROLES.SUPE_OPS &&
    (actorRole !== USER_ROLES.SUPER_ADMIN && actorRole !== USER_ROLES.ADMIN)
  ) {
    throw new HttpError(403, 'Only admins can assign the SupeOps role');
  }
}

export function ensureCanManageTarget(actorRole: string, targetRole: string) {
  if (
    targetRole === USER_ROLES.SUPER_ADMIN &&
    actorRole !== USER_ROLES.SUPER_ADMIN
  ) {
    throw new HttpError(403, 'Forbidden: Cannot manage super admin accounts');
  }

  if (
    targetRole === USER_ROLES.ADMIN &&
    actorRole !== USER_ROLES.SUPER_ADMIN
  ) {
    throw new HttpError(403, 'Forbidden: Cannot manage admin accounts');
  }
}

export function serializeUser(user: User | Record<string, any>) {
  const plainUser = typeof (user as User).get === 'function'
    ? (user as User).get({ plain: true })
    : user;

  const createdAt = plainUser.created_at instanceof Date
    ? plainUser.created_at.toISOString()
    : plainUser.created_at;

  return {
    id: plainUser.id,
    username: plainUser.username,
    role: plainUser.role,
    first_name: plainUser.first_name,
    last_name: plainUser.last_name,
    status: plainUser.status,
    created_at: createdAt,
  };
}

export function handleRouteError(error: unknown) {
  if (error instanceof HttpError) {
  return errorResponse(error.message, error.status, error.details as string | object | undefined);
  }

  if (error instanceof ZodError) {
    return errorResponse('Invalid request data', 400, error.flatten());
  }

  console.error('Users route error:', error);
  return errorResponse('Internal server error', 500);
}

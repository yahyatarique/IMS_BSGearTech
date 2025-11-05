import { NextRequest } from 'next/server';
import { User } from '@/db/models';
import { CreateUserSchema } from '@/schemas/user.schema';
import { testConnection } from '@/db/connection';
import sequelize from '@/db/connection';
import { USER_ROLES } from '@/enums/users.enum';
import { sendResponse } from '@/utils/api-response';
import {
  authorizeAdmin,
  assertRoleAssignmentPermission,
  serializeUser,
  handleRouteError,
  HttpError,
} from './_utils';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await testConnection();
    await authorizeAdmin(request);

    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'first_name', 'last_name', 'status', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    const payload = users.map(serializeUser);
    return sendResponse(payload, 'Users retrieved successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    await testConnection();
    const adminContext = await authorizeAdmin(request);

    const body = await request.json();
    const parsedBody = CreateUserSchema.safeParse(body);

    if (!parsedBody.success) {
      throw new HttpError(400, 'Invalid request data', parsedBody.error.flatten());
    }

    const data = parsedBody.data;
    const desiredRole = data.role ?? USER_ROLES.USER;

    assertRoleAssignmentPermission(adminContext.role, desiredRole);

    const existingUser = await User.findOne({
      where: { username: data.username },
    });

    if (existingUser) {
      throw new HttpError(409, 'Username already exists');
    }

    const transaction = await sequelize.transaction();

    try {
      const newUser = await User.create(
        {
          username: data.username,
          password: data.password,
          role: desiredRole,
          first_name: data.firstName,
          last_name: data.lastName,
          status: 'active',
        },
        { transaction },
      );

      await transaction.commit();

      return sendResponse(serializeUser(newUser), 'User created successfully', 201);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
import { NextRequest } from 'next/server';
import { User } from '@/db/models';
import { CreateUserSchema, UsersListQuerySchema } from '@/schemas/user.schema';
import { testConnection } from '@/db/connection';
import sequelize from '@/db/connection';
import { USER_ROLES } from '@/enums/users.enum';
import { sendResponse } from '@/utils/api-response';
import {
  authorizeAdmin,
  assertRoleAssignmentPermission,
  serializeUser,
  handleRouteError,
  HttpError
} from './_utils';
import { Op } from 'sequelize';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await testConnection();
    await authorizeAdmin(request);

    const { searchParams } = new URL(request.url);
    const query = UsersListQuerySchema.parse({
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined
    });

    const offset = (query.page - 1) * query.pageSize;

    const { rows, count } = await User.findAndCountAll({
      where: {
        role: {
          [Op.ne]: USER_ROLES.SUPER_ADMIN
        }
      },
      attributes: ['id', 'username', 'role', 'first_name', 'last_name', 'status', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: query.pageSize,
      offset
    });

    const [activeCount, adminCount] = await Promise.all([
      User.count({
        where: {
          role: {
            [Op.ne]: USER_ROLES.SUPER_ADMIN
          },
          status: 'active'
        }
      }),
      User.count({
        where: {
          role: {
            [Op.in]: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
          }
        }
      })
    ]);

    const totalPages = count === 0 ? 0 : Math.ceil(count / query.pageSize);

    const payload = {
      items: rows.map(serializeUser),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems: count,
        totalPages,
        hasNext: totalPages > 0 && query.page < totalPages,
        hasPrev: totalPages > 0 && query.page > 1,
        counts: {
          total: count,
          active: activeCount,
          admins: adminCount
        }
      }
    };

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
      where: { username: data.username }
    });

    if (existingUser) {
      throw new HttpError(409, 'Username already exists');
    }

    const transaction = await sequelize.transaction();

    const hashedPassword = await User.hashPassword(data.password);

    try {
      const newUser = await User.create(
        {
          username: data.username,
          password: hashedPassword,
          role: desiredRole,
          first_name: data.firstName,
          last_name: data.lastName,
          status: 'active'
        },
        { transaction }
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

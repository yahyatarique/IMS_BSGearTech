import { NextRequest } from 'next/server';
import { Op } from 'sequelize';
import { User } from '@/db/models';
import { testConnection } from '@/db/connection';
import sequelize from '@/db/connection';
import { sendResponse } from '@/utils/api-response';
import { UpdateUserSchema, UserIdParamSchema } from '@/schemas/user.schema';
import {
  authorizeAdmin,
  assertRoleAssignmentPermission,
  ensureCanManageTarget,
  serializeUser,
  handleRouteError,
  HttpError,
} from '../_utils';

function parseUserId(params: { id: string }) {
  const result = UserIdParamSchema.safeParse(params);
  if (!result.success) {
    throw new HttpError(400, 'Invalid user id', result.error.flatten());
  }

  return result.data.id;
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    await testConnection();
    await authorizeAdmin(request);

    const userId = parseUserId(context.params);

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'role', 'first_name', 'last_name', 'status', 'created_at'],
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return sendResponse(serializeUser(user), 'User retrieved successfully');
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    await testConnection();
    const adminContext = await authorizeAdmin(request);
    const userId = parseUserId(context.params);

    const body = await request.json();
    const parsedBody = UpdateUserSchema.safeParse(body);

    if (!parsedBody.success) {
      throw new HttpError(400, 'Invalid request data', parsedBody.error.flatten());
    }

    const updates = parsedBody.data;

    if (Object.keys(updates).length === 0) {
      throw new HttpError(400, 'No fields provided for update');
    }

    const transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction });

      if (!user) {
        throw new HttpError(404, 'User not found');
      }

      ensureCanManageTarget(adminContext.role, user.role);

      if (updates.role) {
        assertRoleAssignmentPermission(adminContext.role, updates.role);
      }

      let hasChanges = false;
      const payload: Record<string, unknown> = {};

      if (updates.username && updates.username !== user.username) {
        const existingUser = await User.findOne({
          where: {
            username: updates.username,
            id: { [Op.ne]: userId },
          },
          transaction,
        });

        if (existingUser) {
          throw new HttpError(409, 'Username already exists');
        }

        payload.username = updates.username;
        hasChanges = true;
      }

      if (updates.password) {
        payload.password = updates.password;
        hasChanges = true;
      }

      if (updates.firstName && updates.firstName !== user.first_name) {
        payload.first_name = updates.firstName;
        hasChanges = true;
      }

      if (updates.lastName && updates.lastName !== user.last_name) {
        payload.last_name = updates.lastName;
        hasChanges = true;
      }

      if (updates.role && updates.role !== user.role) {
        payload.role = updates.role;
        hasChanges = true;
      }

      if (updates.status && updates.status !== user.status) {
        payload.status = updates.status;
        hasChanges = true;
      }

      if (!hasChanges) {
        throw new HttpError(400, 'No changes detected');
      }

      await user.update(payload, { transaction });
      await transaction.commit();

      await user.reload({
        attributes: ['id', 'username', 'role', 'first_name', 'last_name', 'status', 'created_at'],
      });

      return sendResponse(serializeUser(user), 'User updated successfully');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    await testConnection();
    const adminContext = await authorizeAdmin(request);
    const userId = parseUserId(context.params);

    const transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction });

      if (!user) {
        throw new HttpError(404, 'User not found');
      }

      ensureCanManageTarget(adminContext.role, user.role);

      await user.destroy({ transaction });
      await transaction.commit();

      return sendResponse({ id: userId }, 'User deleted successfully');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    return handleRouteError(error);
  }
}

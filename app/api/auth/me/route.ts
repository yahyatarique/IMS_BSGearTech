import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { testConnection } from '@/db/connection';
import { User } from '@/db/models';
import { errorResponse, sendResponse } from '../../../../utils/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookies
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return errorResponse('Not authenticated', 401);
    }

    // Verify and decode token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(accessToken, secret);

    const userId = (payload.userId ?? payload.sub) as string | undefined;

    if (!userId) {
      return errorResponse('Invalid token payload', 401);
    }

    // Ensure database connection
    await testConnection();

    // Fetch the latest user details from the database
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'role', 'first_name', 'last_name', 'status', 'created_at'],
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Return user info from database
    return sendResponse({
      user: {
        id: user.dataValues.id,
        username: user.dataValues.username,
        role: user.dataValues.role,
        first_name: user.dataValues.first_name,
        last_name: user.dataValues.last_name,
        status: user.dataValues.status,
        created_at: user.dataValues.created_at instanceof Date ? user.dataValues.created_at.toISOString() : user.dataValues.created_at,
      }
    }, 'User info retrieved successfully');
  } catch (error) {
    console.error('Get user info error:', error);
    return errorResponse('Failed to get user info', 401);
  }
}

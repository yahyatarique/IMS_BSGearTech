import { NextRequest } from 'next/server';
import { UpdatePasswordSchema } from '@/schemas/password.schema';
import { errorResponse, sendResponse } from '@/utils/api-response';
import { compare } from 'bcryptjs';
import User from '@/db/models/User';
import { testConnection } from '@/db/connection';
import { jwtVerify } from 'jose';

export async function PUT(request: NextRequest) {
  try {
    await testConnection();

    // Get authorization token
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    try {
      const { payload } = await jwtVerify(token, secret);
      if (!payload.sub) {
        return errorResponse('Invalid token', 401);
      }

      // Parse and validate request body
      const body = await request.json();
      const validatedData = UpdatePasswordSchema.parse(body);

      // Find user
      const user = await User.findByPk(payload.sub);
      if (!user) {
        return errorResponse('User not found', 404);
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(validatedData.currentPassword, user.password);
      if (!isValidPassword) {
        return errorResponse('Current password is incorrect', 400);
      }

      // Hash new password

      // Update password - skip model hooks to avoid double-hashing
      await user.update({ password: validatedData.newPassword }, { hooks: true });

      return sendResponse(null, 'Password updated successfully');
    } catch (error: any) {
      console.error('Token verification error:', error);
      return errorResponse('Invalid token', 401);
    }
  } catch (error: any) {
    console.error('Password update error:', error);
    if (error.name === 'ZodError') {
      return errorResponse('Invalid input data', 400);
    }
    return errorResponse(error.message || 'Failed to update password', 500);
  }
}

import { NextRequest } from 'next/server';
import { User } from '@/db/models';
import { SignJWT, jwtVerify } from 'jose';
import { errorResponse, sendResponse } from '../../../../utils/api-response';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return errorResponse('Refresh token not found', 401);
    }

    // Verify refresh token
    const refreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
    const { payload } = await jwtVerify(refreshToken, refreshSecret);

    if (payload.type !== 'refresh') {
      return errorResponse('Invalid token type', 401);
    }

    if (!payload.userId || payload.userId === 'undefined') {
      return errorResponse('Invalid token payload', 401);
    }

    // Find user
    const _user = await User.findByPk(payload.userId as string);

    if (!_user) {
      return errorResponse('User not found', 401);
    }

    const user = _user.get({ plain: true });

    // Generate new access token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const userId = String(user.id);
    const accessToken = await new SignJWT({
      userId,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setSubject(userId)
      .setExpirationTime('10m')
      .sign(secret);

    // Generate new refresh token (optional - for token rotation)
    const newRefreshToken = await new SignJWT({
      userId,
      role: user.role,
      type: 'refresh'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setSubject(userId)
      .setExpirationTime('20d')
      .sign(refreshSecret);

    // Return success response without tokens in body
    const response = sendResponse(undefined, 'Token refreshed successfully');

    // Set new tokens in HTTP-only cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      // maxAge: 15 * 60, // 15 minutes in seconds
      path: '/'
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:  2 * 60 * 60, // 20 days in seconds
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);

    return errorResponse('Invalid or expired refresh token', 401);
  }
}

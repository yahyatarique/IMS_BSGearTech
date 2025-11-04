import { NextRequest, NextResponse } from 'next/server';
import { User } from '../../../../db/models';
import { SignJWT, jwtVerify } from 'jose';
import { RefreshTokenSchema } from '../../../../schemas/user.schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = RefreshTokenSchema.parse(body);
    const { refreshToken } = validatedData;

    // Verify refresh token
    const refreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
    const { payload } = await jwtVerify(refreshToken, refreshSecret);

    if (payload.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      );
    }

    // Find user
    const user = await User.findByPk(payload.sub as string);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Generate new access token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const accessToken = await new SignJWT({
      sub: user.id,
      username: user.username,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secret);

    // Generate new refresh token (optional - for token rotation)
    const newRefreshToken = await new SignJWT({
      sub: user.id,
      type: 'refresh',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(refreshSecret);

    const response = NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
    });

    // Set new cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { User } from '../../../../db/models';
import { LoginSchema } from '../../../../schemas/user.schema';
import { testConnection } from '../../../../db/connection';

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    const body = await request.json();
    
    // Validate request body
    const validatedData = LoginSchema.parse(body);
    const { username, password } = validatedData;

    // Find user by username
    // Note: rolePermissions table has been removed
    // User roles are managed using enums from src/enums/userRoles.ts
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const refreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);

    // Access token (15 minutes)
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

    // Refresh token (7 days)
    const refreshToken = await new SignJWT({
      sub: user.id,
      type: 'refresh',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(refreshSecret);

    // Prepare user data (exclude sensitive information)
    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: user.created_at,
    };

    // Set cookies
    const response = NextResponse.json({
      message: 'Login successful',
      user: userData,
      accessToken,
      refreshToken,
    });

    // Set HTTP-only cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { LoginSchema } from '@/schemas/user.schema';
import { testConnection } from '@/db/connection';
import { User } from '@/db/models';
import type { User as UserType } from '@/services/types/auth.api.type';
import { errorResponse, sendResponse } from '../../../../utils/api-response';

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set in environment');
      return errorResponse('Database configuration error', 500);
    }

    if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      console.error('JWT secrets are not set in environment');
      return errorResponse('Authentication configuration error', 500);
    }

    // Ensure database connection
    const connectionTest = await testConnection();
    if (!connectionTest) {
      console.error('Database connection test failed');
      return errorResponse('Database connection failed', 500);
    }

    const body = await request.json();

    // Validate request body
    const validatedData = LoginSchema.parse(body);
    const { username, password, rememberMe = false } = validatedData;

    // Find user by username
    // Note: rolePermissions table has been removed
    // User roles are managed using enums from src/enums/userRoles.ts
    const _user = await User.findOne({
      where: { username }
    });

    const user = _user?.get({plain: true});

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await _user?.comparePassword(password, user?.password);

    
    if (!isPasswordValid) {
      return errorResponse('Invalid Password', 401);
    }

    // Generate tokens
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const refreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
    const userId = String(user.id);
    const role = user.role as UserType['role'];

    // Access token (15 minutes)
    const accessToken = await new SignJWT({
      userId,
      role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setSubject(userId)
      .setExpirationTime('2m')
      .sign(secret);

    // Refresh token (20 days or 30 days if "remember me")
    const refreshTokenExpiry = rememberMe ? '30d' : '20d';
    const refreshToken = await new SignJWT({
      userId,
      role,
      type: 'refresh'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setSubject(userId)
      .setExpirationTime(refreshTokenExpiry)
      .sign(refreshSecret);

    // Prepare user data (exclude sensitive information)
    const userData: UserType = {
      id: user.id,
      username: user.username,
      role: user.role as UserType['role'],
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: user.created_at.toISOString(),
      status: user.status
    };

    // Create response with user data only (tokens will be in cookies)
    const response = sendResponse({ user: userData }, 'Login successful');

    // Set HTTP-only cookies for tokens
    // Access token - short lived (15 minutes)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      // maxAge: 15 * 60, // 15 minutes in seconds
      path: '/'
    });

    // Refresh token - long lived (20 days or 30 days if "remember me")
    const refreshTokenMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 20 * 24 * 60 * 60;
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge, // 20 or 30 days in seconds
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('Invalid request data', 400, error.message);
    }

    // Check for Sequelize/database errors
    if (error instanceof Error) {
      if (error.message.includes('DATABASE_URL') || error.message.includes('database')) {
        return errorResponse('Database configuration error', 500);
      }
      if (error.message.includes('Cannot find module') || error.message.includes('pg')) {
        return errorResponse('Database driver error', 500);
      }
    }

    return errorResponse('Internal server error', 500);
  }
}

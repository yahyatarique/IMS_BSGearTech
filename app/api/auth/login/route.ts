import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { LoginSchema } from '@/schemas/user.schema';
import { testConnection } from '@/db/connection';
import type { User as UserType } from '@/services/types/auth.api.type';
import { errorResponse, sendResponse } from '../../../../utils/api-response';

// Helper function to add CORS headers
const addCorsHeaders = <T = any>(response: NextResponse<T>, origin: string | null): NextResponse<T> => {
  const allowedOrigins = [
    'https://bsgeartech.yahyatarique.dev',
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_BASE_URL
  ].filter(Boolean) as string[];

  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // For development, allow the origin if it's localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Role, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
};

// Handle OPTIONS preflight request
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, origin);
}

// Lazy load User model to prevent module initialization errors
const getUserModel = async () => {
  const { User } = await import('@/db/models');
  return User;
};

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  
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

    // Test database connection with aggressive retries for nano tier
    // Nano tier has connection limits and may need multiple attempts
    const connectionTest = await testConnection(5); // 5 retries for nano tier
    if (!connectionTest) {
      console.error('Database connection test failed after all retries');
      // Return error with CORS headers
      return addCorsHeaders(
        errorResponse('Database connection failed. Please try again in a moment.', 503),
        origin
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = LoginSchema.parse(body);
    const { username, password, rememberMe = false } = validatedData;

    // Find user by username
    // Note: rolePermissions table has been removed
    // User roles are managed using enums from src/enums/userRoles.ts
    const User = await getUserModel();
    
    // Wrap query in try-catch to handle connection errors gracefully
    let _user;
    try {
      _user = await User.findOne({
        where: { username }
      });
    } catch (dbError: any) {
      console.error('Database query error:', {
        message: dbError?.message,
        name: dbError?.name,
        code: dbError?.code
      });
      
      // If it's a connection error and we didn't test connection successfully, retry once
      if (!connectionTest && (
        dbError?.name?.includes('Connection') ||
        dbError?.message?.includes('connection') ||
        dbError?.code === 'ETIMEDOUT' ||
        dbError?.code === 'ECONNREFUSED'
      )) {
        console.log('Retrying database query after connection error...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        try {
          _user = await User.findOne({
            where: { username }
          });
        } catch (retryError: any) {
          console.error('Retry also failed:', {
            message: retryError?.message,
            name: retryError?.name,
            code: retryError?.code,
            stack: retryError?.stack
          });
          throw retryError;
        }
      } else {
        // Log the full error for debugging
        console.error('Database query failed:', {
          message: dbError?.message,
          name: dbError?.name,
          code: dbError?.code,
          stack: dbError?.stack,
          originalError: dbError
        });
        throw dbError;
      }
    }

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
    let response = sendResponse({ user: userData }, 'Login successful');
    
    // Add CORS headers
    response = addCorsHeaders(response, origin);

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

    let errorResp: NextResponse;
    
    if (error instanceof Error && error.name === 'ZodError') {
      errorResp = errorResponse('Invalid request data', 400, error.message);
    } else if (error instanceof Error) {
      // Check for Sequelize/database errors
      if (error.message.includes('DATABASE_URL') || error.message.includes('database')) {
        errorResp = errorResponse('Database configuration error', 500);
      } else if (error.message.includes('Cannot find module') || error.message.includes('pg')) {
        errorResp = errorResponse('Database driver error', 500);
      } else {
        errorResp = errorResponse('Internal server error', 500);
      }
    } else {
      errorResp = errorResponse('Internal server error', 500);
    }
    
    // Add CORS headers to error response
    return addCorsHeaders(errorResp, origin);
  }
}

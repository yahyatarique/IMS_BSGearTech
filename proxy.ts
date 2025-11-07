import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define allowed origins for CORS
const allowedOrigins = [
  'https://bsgeartech.yahyatarique.dev',
  'http://localhost:3000',
  process.env.NEXT_PUBLIC_BASE_URL
].filter(Boolean) as string[];

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

// Define public API routes
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh-token'
];

// Next.js 16: Export as 'proxy'
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin') || '';
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle CORS preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });

    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-User-Role, X-Requested-With'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  }

  // Helper function to add CORS headers to response
  const addCorsHeaders = (response: NextResponse) => {
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-User-Role, X-Requested-With'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  };

  // Allow static files, Next.js internals, and files with extensions
  if (
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/static/') || 
    pathname.includes('.')
  ) {
    return addCorsHeaders(NextResponse.next());
  }

  // Allow public page routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return addCorsHeaders(NextResponse.next());
  }

  // Allow public API routes
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return addCorsHeaders(NextResponse.next());
  }

  // CRITICAL FIX: Let all API routes pass through
  // API routes will handle their own authentication
  if (pathname.startsWith('/api/')) {
    return addCorsHeaders(NextResponse.next());
  }

  // For page routes, enforce authentication
  const token =
    request.cookies.get('accessToken')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return addCorsHeaders(NextResponse.redirect(loginUrl));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub as string);
    response.headers.set('x-user-role', payload.role as string);
    response.headers.set('x-user-username', payload.username as string);

    return addCorsHeaders(response);
  } catch (error) {
    console.error('JWT verification failed:', error);

    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(
          new URL('/api/auth/refresh-token', request.url).toString(),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: `refreshToken=${refreshToken}`
            }
          }
        );

        if (refreshResponse.ok) {
          const setCookieHeaders = refreshResponse.headers.get('set-cookie');
          const response = NextResponse.next();

          if (setCookieHeaders) {
            const cookies = setCookieHeaders.split(',');
            cookies.forEach((cookie) => {
              const [cookiePart] = cookie.trim().split(';');
              const [name, value] = cookiePart.split('=');

              if (name === 'accessToken' || name === 'refreshToken') {
                response.cookies.set(name, value, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'strict',
                  maxAge: name === 'accessToken' ? 15 * 60 : 7 * 24 * 60 * 60,
                  path: '/'
                });
              }
            });
          }

          return addCorsHeaders(response);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }

    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return addCorsHeaders(response);
  }
}

// CRITICAL: Exclude /api/* from matcher - this prevents 405 errors
export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT API routes and static files
     * This is crucial for avoiding 405 errors on Vercel
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ]
};
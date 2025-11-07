import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define allowed origins for CORS
const allowedOrigins = [
  'https://bsgeartech.yahyatarique.dev/',
  'http://localhost:3000',
  process.env.NEXT_PUBLIC_BASE_URL,
].filter(Boolean) as string[];

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh-token'
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin') || '';
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle CORS preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Role, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }

  // Helper function to add CORS headers to response
  const addCorsHeaders = (response: NextResponse) => {
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Role, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  };

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return addCorsHeaders(NextResponse.next());
  }

  // Allow static files and API routes (except auth-related ones)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return addCorsHeaders(NextResponse.next());
  }

  // Get token from cookies or Authorization header
  const token = request.cookies.get('accessToken')?.value || 
    request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // Redirect to login if no token is found
    const loginUrl = new URL('/login', request.url);
    return addCorsHeaders(NextResponse.redirect(loginUrl));
  }

  try {
    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Check if user has permission for the route
    const userRole = payload.role as '0' | '1' | '2';


    // Add user info to headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub as string);
    response.headers.set('x-user-role', userRole);
    response.headers.set('x-user-username', payload.username as string);

    return addCorsHeaders(response);
  } catch (error) {
    console.error('JWT verification failed:', error);
    
    // If token is expired or invalid, try to refresh
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (refreshToken) {
      try {
        // Call refresh token API with cookies
        const refreshResponse = await fetch(new URL('/api/auth/refresh-token', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `refreshToken=${refreshToken}`,
          },
        });

        if (refreshResponse.ok) {
          // Extract new tokens from Set-Cookie headers
          const setCookieHeaders = refreshResponse.headers.getSetCookie();
          
          // Set new token and continue
          const response = NextResponse.next();
          
          // Forward the Set-Cookie headers from refresh endpoint
          setCookieHeaders.forEach(cookie => {
            const [cookiePart] = cookie.split(';');
            const [name, value] = cookiePart.split('=');
            
            if (name === 'accessToken' || name === 'refreshToken') {
              response.cookies.set(name, value, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: name === 'accessToken' ? 15 * 60 : 7 * 24 * 60 * 60,
                path: '/',
              });
            }
          });
          
          return addCorsHeaders(response);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }

    // Clear invalid tokens and redirect to login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    
    return addCorsHeaders(response);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

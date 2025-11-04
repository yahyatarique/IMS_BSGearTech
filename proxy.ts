import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/api/login', '/api/refresh-token'];

// Define role-based access control
const roleRoutes = {
  '0': ['/admin'], // Admin routes
  '1': ['/manager'], // Manager routes  
  '2': ['/dashboard', '/quotation'], // User routes
};

export async function proxy(request: NextRequest) {
  // const { pathname } = request.nextUrl;

  // // Allow public routes
  // if (publicRoutes.some(route => pathname.startsWith(route))) {
  //   return NextResponse.next();
  // }

  // // Allow static files and API routes (except auth-related ones)
  // if (
  //   pathname.startsWith('/_next/') ||
  //   pathname.startsWith('/api/') ||
  //   pathname.startsWith('/static/') ||
  //   pathname.includes('.')
  // ) {
  //   return NextResponse.next();
  // }

  // // Get token from cookies or Authorization header
  // const token = request.cookies.get('accessToken')?.value || 
  //   request.headers.get('Authorization')?.replace('Bearer ', '');

  // if (!token) {
  //   // Redirect to login if no token is found
  //   const loginUrl = new URL('/login', request.url);
  //   return NextResponse.redirect(loginUrl);
  // }

  // try {
  //   // Verify JWT token
  //   const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  //   const { payload } = await jwtVerify(token, secret);

  //   // Check if user has permission for the route
  //   const userRole = payload.role as '0' | '1' | '2';
  //   const allowedRoutes = roleRoutes[userRole] || [];

  //   // Check if current path is allowed for user's role
  //   const hasAccess = allowedRoutes.some(route => pathname.startsWith(route)) ||
  //     pathname === '/' || // Allow root path
  //     pathname === '/dashboard'; // Default allowed path

  //   if (!hasAccess) {
  //     // Redirect to unauthorized page or dashboard
  //     const dashboardUrl = new URL('/dashboard', request.url);
  //     return NextResponse.redirect(dashboardUrl);
  //   }

  //   // Add user info to headers for API routes
  //   const response = NextResponse.next();
  //   response.headers.set('x-user-id', payload.sub as string);
  //   response.headers.set('x-user-role', userRole);
  //   response.headers.set('x-user-username', payload.username as string);

  //   return response;
  // } catch (error) {
    // console.error('JWT verification failed:', error);
    
    // // If token is expired or invalid, try to refresh
    // const refreshToken = request.cookies.get('refreshToken')?.value;
    
    // if (refreshToken) {
    //   try {
    //     // Call refresh token API
    //     const refreshResponse = await fetch(new URL('/api/refresh-token', request.url), {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({ refreshToken }),
    //     });

    //     if (refreshResponse.ok) {
    //       const { accessToken } = await refreshResponse.json();
          
    //       // Set new token and continue
    //       const response = NextResponse.next();
    //       response.cookies.set('accessToken', accessToken, {
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === 'production',
    //         sameSite: 'strict',
    //         maxAge: 15 * 60, // 15 minutes
    //       });
          
    //       return response;
    //     }
    //   } catch (refreshError) {
    //     console.error('Token refresh failed:', refreshError);
    //   }
  //   }

  //   // Clear invalid tokens and redirect to login
  //   const loginUrl = new URL('/login', request.url);
  //   const response = NextResponse.redirect(loginUrl);
  //   response.cookies.delete('accessToken');
  //   response.cookies.delete('refreshToken');
    
  //   return response;
  // }
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
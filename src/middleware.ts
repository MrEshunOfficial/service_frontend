// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ============================================
// ROUTE CONFIGURATION
// ============================================
const publicRoutes = ['/', '/about', '/how-it-works', '/pricing', '/terms', '/privacy', '/services'];
const authRoutes = ['/login', '/register', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
const protectedRoutes = ['/profile', '/settings', '/services-offered'];
const adminRoutes = ['/admin'];
const superAdminRoutes = ['/admin/super'];

interface JWTPayload {
  userId: string;
  isEmailVerified: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;
  
  console.log('🔒 Middleware Check:', { path, hasToken: !!token });

  // ============================================
  // ROUTE TYPE CHECKS
  // ============================================
  const isPublicRoute = publicRoutes.some(route => 
    path === route || (route !== '/' && path.startsWith(route))
  );
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isSuperAdminRoute = superAdminRoutes.some(route => path.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route)) && !isSuperAdminRoute;

  // ============================================
  // PROTECTED ROUTES - Require authentication
  // ============================================
  if (isProtectedRoute || isAdminRoute || isSuperAdminRoute) {
    console.log('🔐 Protected route detected:', path);
    
    // No token - redirect to login
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = await verifyToken(token);
      
      // Invalid token - clear and redirect to login
      if (!payload) {
        console.log('❌ Invalid token, clearing and redirecting');
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }

      // CRITICAL FIX: Verify user still exists in database
      const userExists = await verifyUserExists(payload.userId, token);
      
      if (!userExists) {
        console.log('❌ User not found in database, clearing token and redirecting');
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'account_not_found');
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('token');
        return response;
      }

      console.log('✅ Token valid:', { 
        userId: payload.userId, 
        verified: payload.isEmailVerified,
        admin: payload.isAdmin,
        superAdmin: payload.isSuperAdmin
      });

      // Check super admin access
      if (isSuperAdminRoute && !payload.isSuperAdmin) {
        console.log('❌ Super admin access denied');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Check admin access
      if (isAdminRoute && !payload.isAdmin && !payload.isSuperAdmin) {
        console.log('❌ Admin access denied');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // All checks passed
      console.log('✅ Access granted to:', path);
      const response = NextResponse.next();
      response.headers.set('x-user-authenticated', 'true');
      response.headers.set('x-user-id', payload.userId);
      response.headers.set('x-user-admin', payload.isAdmin.toString());
      response.headers.set('x-user-super-admin', payload.isSuperAdmin.toString());
      
      return response;
    } catch (error) {
      console.error('❌ Authentication error:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // ============================================
  // AUTH ROUTES - Redirect if already logged in
  // ============================================
  if (isAuthRoute) {
    if (!token) {
      return NextResponse.next();
    }

    try {
      const payload = await verifyToken(token);
      
      if (payload) {
        // Verify user still exists before redirecting
        const userExists = await verifyUserExists(payload.userId, token);
        
        if (!userExists) {
          console.log('User deleted, clearing token on auth page');
          const response = NextResponse.next();
          response.cookies.delete('token');
          return response;
        }

        console.log('✅ User already authenticated, redirecting from auth page');
        if (payload.isSuperAdmin) {
          return NextResponse.redirect(new URL('/admin/super/dashboard', request.url));
        }
        if (payload.isAdmin) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/profile', request.url));
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
    
    return NextResponse.next();
  }

  // ============================================
  // PUBLIC ROUTES
  // ============================================
  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// ============================================
// HELPER: Verify JWT token
// ============================================
async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    return {
      userId: payload.userId as string,
      isEmailVerified: payload.isEmailVerified as boolean || false,
      isAdmin: payload.isAdmin as boolean || false,
      isSuperAdmin: payload.isSuperAdmin as boolean || false,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// ============================================
// HELPER: Verify user exists in database
// ============================================
async function verifyUserExists(userId: string, token: string): Promise<boolean> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    // Call backend API to verify user exists
    const response = await fetch(`${backendUrl}/api/auth/verify-user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache this check
    });

    if (!response.ok) {
      console.log('User verification failed:', response.status);
      return false;
    }

    const data = await response.json();
    return data.success === true && data.exists === true;
  } catch (error) {
    console.error('Error verifying user existence:', error);
    // On error, assume user doesn't exist for security
    return false;
  }
}

// ============================================
// MATCHER CONFIGURATION
// ============================================
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.gif$|.*\\.webp$).*)',
  ],
};
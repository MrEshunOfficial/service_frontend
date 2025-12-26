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

// Admin routes: anything under /admin (including /admin itself)
// Super admin routes: anything under /admin/super (including /admin/super itself)

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
  // ROUTE TYPE CHECKS (SIMPLIFIED & FIXED)
  // ============================================
  const isPublicRoute = publicRoutes.some(route =>
    path === route || (route !== '/' && path.startsWith(route + '/'))
  );

  const isAuthRoute = authRoutes.some(route => path.startsWith(route + '/'));

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route + '/'));

  // Admin area: /admin or /admin/*
  const isInAdminArea = path === '/admin' || path.startsWith('/admin/');

  // Super admin area: /admin/super or /admin/super/*
  const isInSuperAdminArea = path === '/admin/super' || path.startsWith('/admin/super/');

  // ============================================
  // PROTECTED & ADMIN ROUTES - Require authentication
  // ============================================
  if (isProtectedRoute || isInAdminArea) {
    console.log('🔐 Protected or admin route detected:', path);

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

      console.log('✅ Token valid:', {
        userId: payload.userId,
        verified: payload.isEmailVerified,
        admin: payload.isAdmin,
        superAdmin: payload.isSuperAdmin
      });

      // Super admin only area - deny if not super admin
      if (isInSuperAdminArea && !payload.isSuperAdmin) {
        console.log('❌ Super admin access denied');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Regular admin area (not super admin subpath) - allow admins OR super admins
      if (!isInSuperAdminArea && isInAdminArea && !payload.isAdmin && !payload.isSuperAdmin) {
        console.log('❌ Admin access denied');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // All checks passed - add user headers and proceed
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
        console.log('✅ User already authenticated, redirecting from auth page');

        // Redirect based on role
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
      // Invalid token - clear it and continue to auth page
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }

    return NextResponse.next();
  }

  // ============================================
  // PUBLIC ROUTES - Allow without checks
  // ============================================
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ============================================
  // DEFAULT - Allow through (assets, API, etc.)
  // ============================================
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
// MATCHER CONFIGURATION
// ============================================
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon and other static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.gif$|.*\\.webp$).*)',
  ],
};
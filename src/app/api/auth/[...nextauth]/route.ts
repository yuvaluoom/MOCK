/**
 * NextAuth.js API Route
 *
 * Handles all authentication endpoints:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/callback/[provider]
 * - /api/auth/providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { MOCK_USERS } from '@/lib/auth/config';

// Mock authentication for development
// In production, this would use NextAuth.js with proper OAuth providers

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const action = pathParts[pathParts.length - 1];

  // Handle session request
  if (action === 'session') {
    const role = url.searchParams.get('role') ?? 'patient';
    const user = MOCK_USERS[role] ?? MOCK_USERS.patient;

    return NextResponse.json({
      user,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  // Handle providers request
  if (action === 'providers') {
    return NextResponse.json({
      google: {
        id: 'google',
        name: 'Google',
        type: 'oauth',
        signinUrl: '/api/auth/signin/google',
        callbackUrl: '/api/auth/callback/google',
      },
      apple: {
        id: 'apple',
        name: 'Apple',
        type: 'oauth',
        signinUrl: '/api/auth/signin/apple',
        callbackUrl: '/api/auth/callback/apple',
      },
      facebook: {
        id: 'facebook',
        name: 'Facebook',
        type: 'oauth',
        signinUrl: '/api/auth/signin/facebook',
        callbackUrl: '/api/auth/callback/facebook',
      },
      credentials: {
        id: 'credentials',
        name: 'Credentials',
        type: 'credentials',
        signinUrl: '/api/auth/signin/credentials',
        callbackUrl: '/api/auth/callback/credentials',
      },
    });
  }

  // Handle CSRF token request
  if (action === 'csrf') {
    return NextResponse.json({
      csrfToken: 'mock-csrf-token-' + Date.now(),
    });
  }

  // Default response
  return NextResponse.json({ status: 'ok' });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const action = pathParts[pathParts.length - 1];

  // Handle sign-in
  if (action === 'callback' || pathParts.includes('callback')) {
    const body = await req.json().catch(() => ({}));
    const role = body.role ?? 'patient';
    const user = MOCK_USERS[role] ?? MOCK_USERS.patient;

    // Set cookie for mock session
    const response = NextResponse.json({
      user,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    response.cookies.set('next-auth.session-token', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  }

  // Handle sign-out
  if (action === 'signout') {
    const response = NextResponse.json({ status: 'ok' });
    response.cookies.delete('next-auth.session-token');
    return response;
  }

  // Default sign-in handler
  const body = await req.json().catch(() => ({}));
  const role = body.role ?? 'patient';
  const user = MOCK_USERS[role] ?? MOCK_USERS.patient;

  return NextResponse.json({
    user,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
}

/**
 * NextAuth.js v5 Configuration
 *
 * Implements OAuth 2.0 / OpenID Connect for:
 * - Google
 * - Apple
 * - Facebook
 * - Credentials (email/password)
 */

import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import Facebook from 'next-auth/providers/facebook';
import Credentials from 'next-auth/providers/credentials';
import { MOCK_USERS, type UserRole, type MockUser } from './config';

// Extend the session user type
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      approvalStatus?: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    approvalStatus?: string;
  }
}

// Note: In next-auth v5, JWT types are extended via the 'next-auth' module
// The JWT type is now part of the main next-auth module augmentation

// In-memory user store for mock/demo purposes
// In production, this would use Prisma/database
const mockUsersByEmail: Record<string, MockUser & { provider?: string }> = {
  'patient@example.com': { ...MOCK_USERS.patient, provider: 'credentials' },
  'therapist@example.com': { ...MOCK_USERS.therapist, provider: 'credentials' },
  'admin@example.com': { ...MOCK_USERS.admin, provider: 'credentials' },
};

/**
 * Find or create user from OAuth provider
 */
function findOrCreateOAuthUser(
  email: string,
  name: string,
  provider: string,
  image?: string
): MockUser {
  // Check if user exists
  if (mockUsersByEmail[email]) {
    return mockUsersByEmail[email];
  }

  // Create new user (default to patient role)
  const newUser: MockUser & { provider: string } = {
    id: `user-${Date.now()}`,
    email,
    name,
    role: 'PATIENT',
    provider,
  };

  mockUsersByEmail[email] = newUser;
  return newUser;
}

export const authConfig: NextAuthConfig = {
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Apple OAuth
    Apple({
      clientId: process.env.APPLE_ID ?? '',
      clientSecret: process.env.APPLE_SECRET ?? '',
    }),

    // Facebook OAuth
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
    }),

    // Credentials (email/password)
    Credentials({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email as string;
        const role = (credentials.role as string) || 'patient';

        // In development, allow mock login
        if (process.env.NODE_ENV === 'development') {
          // Check for mock users
          if (email === 'patient@example.com' || role === 'patient') {
            return MOCK_USERS.patient;
          }
          if (email === 'therapist@example.com' || role === 'therapist') {
            return MOCK_USERS.therapist;
          }
          if (email === 'admin@example.com' || role === 'admin') {
            return MOCK_USERS.admin;
          }

          // For any other email in dev mode, create a patient
          return {
            id: `user-${Date.now()}`,
            email,
            name: email.split('@')[0],
            role: 'PATIENT' as UserRole,
          };
        }

        // In production, validate against database
        // TODO: Implement proper password validation with bcrypt
        return null;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth sign-in
      if (account?.provider && account.provider !== 'credentials') {
        // Find or create user from OAuth
        const oauthUser = findOrCreateOAuthUser(
          user.email ?? '',
          user.name ?? '',
          account.provider,
          user.image ?? undefined
        );

        // Merge OAuth user data
        user.id = oauthUser.id;
        user.role = oauthUser.role;
        user.approvalStatus = oauthUser.approvalStatus;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // Initial sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.approvalStatus = user.approvalStatus;
      }

      // OAuth account linking
      if (account?.provider && account.provider !== 'credentials') {
        const oauthUser = findOrCreateOAuthUser(
          token.email ?? '',
          token.name ?? '',
          account.provider
        );
        token.id = oauthUser.id;
        token.role = oauthUser.role;
        token.approvalStatus = oauthUser.approvalStatus;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.approvalStatus = token.approvalStatus as string | undefined;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Handle callback redirects
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: '/login/patient',
    error: '/login/patient',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Trust OAuth providers
  trustHost: true,

  // Debug in development
  debug: process.env.NODE_ENV === 'development',
};

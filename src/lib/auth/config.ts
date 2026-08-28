/**
 * Authentication configuration
 *
 * Currently uses a mock auth layer for development/preview without a database.
 * When PostgreSQL is connected, switch to the full NextAuth.js v5 config
 * with Prisma adapter, Google OAuth, and credential-based login.
 */

// Role hierarchy: OWNER > ADMIN > THERAPIST > PATIENT
export type UserRole = 'PATIENT' | 'THERAPIST' | 'ADMIN' | 'OWNER';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  approvalStatus?: string;
  permissions?: string[];
}

export interface MockSession {
  user: MockUser;
}

// Mock users for development
export const MOCK_USERS: Record<string, MockUser> = {
  patient: {
    id: 'patient-1',
    email: 'patient@example.com',
    name: 'Israel Israeli',
    role: 'PATIENT',
  },
  therapist: {
    id: 'therapist-1',
    email: 'therapist@example.com',
    name: 'Dr. Rachel Cohen',
    role: 'THERAPIST',
    approvalStatus: 'APPROVED',
  },
  admin: {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'System Administrator',
    role: 'ADMIN',
  },
  owner: {
    id: 'owner-1',
    email: 'owner@matchmind.co.il',
    name: 'Primary Owner',
    role: 'OWNER',
    permissions: ['*'], // All permissions
  },
};

/**
 * Check if a role can perform actions on another role
 * Owner > Admin > Others
 */
export function canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = {
    PATIENT: 0,
    THERAPIST: 1,
    ADMIN: 2,
    OWNER: 3,
  };
  return hierarchy[actorRole] > hierarchy[targetRole];
}

/**
 * Check if user is Owner
 */
export function isOwner(role: UserRole): boolean {
  return role === 'OWNER';
}

/**
 * Check if user is Admin or Owner
 */
export function isAdminOrOwner(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'OWNER';
}

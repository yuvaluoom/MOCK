/**
 * Auth re-exports.
 *
 * Mock layer for development. In production, this file will
 * re-export NextAuth handlers (GET, POST, auth, signIn, signOut).
 */

export { MOCK_USERS } from './config';
export type { MockUser, MockSession, UserRole } from './config';

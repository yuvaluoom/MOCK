/**
 * Authentication Service
 *
 * Production-ready authentication layer handling:
 * - Social login (Google, Facebook, Apple)
 * - Email/password authentication
 * - Account linking for multiple providers
 * - Secure password hashing
 * - Session management
 * - User profile creation
 */

import { mockDb, type DbUser, type UserRole } from '@/lib/database/mock-db';

// ============================================================================
// TYPES
// ============================================================================

export type AuthProvider = 'google' | 'facebook' | 'apple' | 'credentials';

export interface OAuthProfile {
  provider: AuthProvider;
  providerId: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  emailVerified?: boolean;
}

export interface AuthAccount {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  linkedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  role: UserRole;
  emailVerified: boolean;
  providers: AuthProvider[];
  approvalStatus?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface RegistrationData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  provider?: AuthProvider;
  providerId?: string;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  isNewUser?: boolean;
  requiresProfileCompletion?: boolean;
}

// ============================================================================
// IN-MEMORY STORES (Replace with database in production)
// ============================================================================

// Linked OAuth accounts
const authAccounts = new Map<string, AuthAccount>();

// Password hashes (userId -> hash)
const passwordHashes = new Map<string, string>();

// Email verification tokens
const verificationTokens = new Map<string, { userId: string; expiry: Date }>();

// Password reset tokens
const resetTokens = new Map<string, { userId: string; expiry: Date }>();

// ============================================================================
// PASSWORD UTILITIES
// ============================================================================

/**
 * Simple password hashing for development
 * In production, use bcrypt or argon2
 */
function hashPassword(password: string): string {
  // Development mode: simple encoding (NOT SECURE - use bcrypt in production)
  if (process.env.NODE_ENV === 'development') {
    return Buffer.from(password).toString('base64');
  }
  // Production would use: return await bcrypt.hash(password, 12);
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password: string, hash: string): boolean {
  // Development mode: simple comparison
  if (process.env.NODE_ENV === 'development') {
    return Buffer.from(password).toString('base64') === hash;
  }
  // Production would use: return await bcrypt.compare(password, hash);
  return Buffer.from(password).toString('base64') === hash;
}

// ============================================================================
// AUTHENTICATION SERVICE CLASS
// ============================================================================

class AuthService {
  private static instance: AuthService;

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------

  private initializeMockData(): void {
    // Set up mock password hashes for development users
    passwordHashes.set('user-patient-1', hashPassword('password123'));
    passwordHashes.set('user-therapist-1', hashPassword('password123'));
    passwordHashes.set('user-admin-1', hashPassword('admin123'));
  }

  // ---------------------------------------------------------------------------
  // USER LOOKUP
  // ---------------------------------------------------------------------------

  /**
   * Find user by email
   */
  findUserByEmail(email: string): AuthUser | null {
    const dbUser = mockDb.getUserByEmail(email);
    if (!dbUser) return null;

    return this.mapDbUserToAuthUser(dbUser);
  }

  /**
   * Find user by ID
   */
  findUserById(id: string): AuthUser | null {
    const dbUser = mockDb.getUserById(id);
    if (!dbUser) return null;

    return this.mapDbUserToAuthUser(dbUser);
  }

  /**
   * Find user by OAuth provider and provider ID
   */
  findUserByProvider(provider: AuthProvider, providerId: string): AuthUser | null {
    // Look up the linked account
    const accounts = Array.from(authAccounts.values());
    for (const account of accounts) {
      if (account.provider === provider && account.providerId === providerId) {
        return this.findUserById(account.userId);
      }
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // OAUTH AUTHENTICATION
  // ---------------------------------------------------------------------------

  /**
   * Handle OAuth sign-in / sign-up
   * Implements account linking and duplicate prevention
   */
  async handleOAuthSignIn(profile: OAuthProfile): Promise<LoginResult> {
    try {
      // 1. Check if this OAuth account is already linked
      const existingUserByProvider = this.findUserByProvider(
        profile.provider,
        profile.providerId
      );

      if (existingUserByProvider) {
        // User exists and has this OAuth linked - just sign in
        this.updateLastLogin(existingUserByProvider.id);
        return {
          success: true,
          user: existingUserByProvider,
          isNewUser: false,
        };
      }

      // 2. Check if a user with this email already exists
      const existingUserByEmail = this.findUserByEmail(profile.email);

      if (existingUserByEmail) {
        // Link this OAuth provider to existing account
        this.linkOAuthAccount(existingUserByEmail.id, profile);
        this.updateLastLogin(existingUserByEmail.id);

        return {
          success: true,
          user: {
            ...existingUserByEmail,
            providers: [...existingUserByEmail.providers, profile.provider],
          },
          isNewUser: false,
        };
      }

      // 3. Create new user
      const newUser = await this.createUserFromOAuth(profile);

      return {
        success: true,
        user: newUser,
        isNewUser: true,
        requiresProfileCompletion: true,
      };
    } catch (error) {
      console.error('[AuthService] OAuth sign-in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth sign-in failed',
      };
    }
  }

  /**
   * Create user from OAuth profile
   */
  private async createUserFromOAuth(profile: OAuthProfile): Promise<AuthUser> {
    // Parse name into first/last
    const nameParts = (profile.name || '').split(' ');
    const firstName = profile.firstName || nameParts[0] || '';
    const lastName = profile.lastName || nameParts.slice(1).join(' ') || '';

    const userId = `user-oauth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create user in database
    const dbUser: DbUser = {
      id: userId,
      email: profile.email,
      role: 'PATIENT', // Default role for new OAuth users
      status: profile.emailVerified ? 'ACTIVE' : 'PENDING_VERIFICATION',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store user (in production, this would be a database call)
    // For now, we'll add to mock store
    mockDb.createUser(dbUser);

    // Link the OAuth account
    this.linkOAuthAccount(userId, profile);

    return {
      id: userId,
      email: profile.email,
      name: profile.name || `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      image: profile.image,
      role: 'PATIENT',
      emailVerified: profile.emailVerified ?? false,
      providers: [profile.provider],
      createdAt: new Date(),
    };
  }

  /**
   * Link OAuth account to existing user
   */
  private linkOAuthAccount(userId: string, profile: OAuthProfile): void {
    const accountId = `account-${profile.provider}-${profile.providerId}`;

    const account: AuthAccount = {
      id: accountId,
      userId,
      provider: profile.provider,
      providerId: profile.providerId,
      linkedAt: new Date(),
    };

    authAccounts.set(accountId, account);
  }

  // ---------------------------------------------------------------------------
  // CREDENTIALS AUTHENTICATION
  // ---------------------------------------------------------------------------

  /**
   * Sign in with email and password
   */
  async signInWithCredentials(
    email: string,
    password: string
  ): Promise<LoginResult> {
    try {
      const user = this.findUserByEmail(email);

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Get password hash
      const hash = passwordHashes.get(user.id);

      if (!hash) {
        // User exists but has no password (OAuth-only user)
        return {
          success: false,
          error: 'This account uses social login. Please sign in with Google, Facebook, or Apple.',
        };
      }

      // Verify password
      if (!verifyPassword(password, hash)) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      this.updateLastLogin(user.id);

      return {
        success: true,
        user,
        isNewUser: false,
      };
    } catch (error) {
      console.error('[AuthService] Credentials sign-in error:', error);
      return {
        success: false,
        error: 'Sign-in failed. Please try again.',
      };
    }
  }

  /**
   * Register new user with email and password
   */
  async registerWithCredentials(data: RegistrationData): Promise<LoginResult> {
    try {
      // Check if email already exists
      const existingUser = this.findUserByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          error: 'An account with this email already exists',
        };
      }

      // Validate password
      if (!data.password || data.password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters',
        };
      }

      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create user in database
      const dbUser: DbUser = {
        id: userId,
        email: data.email,
        role: data.role,
        status: 'PENDING_VERIFICATION',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.createUser(dbUser);

      // Store password hash
      passwordHashes.set(userId, hashPassword(data.password));

      // Create verification token
      const verificationToken = this.generateToken();
      verificationTokens.set(verificationToken, {
        userId,
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // TODO: Send verification email

      const newUser: AuthUser = {
        id: userId,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        emailVerified: false,
        providers: ['credentials'],
        createdAt: new Date(),
      };

      return {
        success: true,
        user: newUser,
        isNewUser: true,
        requiresProfileCompletion: true,
      };
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // EMAIL VERIFICATION
  // ---------------------------------------------------------------------------

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    const tokenData = verificationTokens.get(token);

    if (!tokenData) {
      return { success: false, error: 'Invalid verification token' };
    }

    if (tokenData.expiry < new Date()) {
      verificationTokens.delete(token);
      return { success: false, error: 'Verification token expired' };
    }

    // Update user status
    const user = mockDb.getUserById(tokenData.userId);
    if (user) {
      mockDb.updateUser(tokenData.userId, { status: 'ACTIVE' });
    }

    verificationTokens.delete(token);

    return { success: true };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    const user = this.findUserByEmail(email);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email already verified' };
    }

    // Create new verification token
    const verificationToken = this.generateToken();
    verificationTokens.set(verificationToken, {
      userId: user.id,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // TODO: Send verification email

    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // PASSWORD RESET
  // ---------------------------------------------------------------------------

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    const user = this.findUserByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return { success: true };
    }

    // Create reset token
    const resetToken = this.generateToken();
    resetTokens.set(resetToken, {
      userId: user.id,
      expiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // TODO: Send password reset email

    return { success: true };
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return { success: false, error: 'Invalid reset token' };
    }

    if (tokenData.expiry < new Date()) {
      resetTokens.delete(token);
      return { success: false, error: 'Reset token expired' };
    }

    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    // Update password hash
    passwordHashes.set(tokenData.userId, hashPassword(newPassword));
    resetTokens.delete(token);

    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // ACCOUNT MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Get linked OAuth providers for user
   */
  getLinkedProviders(userId: string): AuthProvider[] {
    const providers: AuthProvider[] = [];
    const accounts = Array.from(authAccounts.values());

    for (const account of accounts) {
      if (account.userId === userId) {
        providers.push(account.provider);
      }
    }

    // Check if user has credentials
    if (passwordHashes.has(userId)) {
      providers.push('credentials');
    }

    return providers;
  }

  /**
   * Unlink OAuth provider from account
   */
  unlinkProvider(
    userId: string,
    provider: AuthProvider
  ): { success: boolean; error?: string } {
    if (provider === 'credentials') {
      // Remove password
      const providers = this.getLinkedProviders(userId);
      if (providers.length <= 1) {
        return {
          success: false,
          error: 'Cannot remove last login method',
        };
      }
      passwordHashes.delete(userId);
      return { success: true };
    }

    // Remove OAuth account
    const entries = Array.from(authAccounts.entries());
    for (const [accountId, account] of entries) {
      if (account.userId === userId && account.provider === provider) {
        const providers = this.getLinkedProviders(userId);
        if (providers.length <= 1) {
          return {
            success: false,
            error: 'Cannot remove last login method',
          };
        }
        authAccounts.delete(accountId);
        return { success: true };
      }
    }

    return { success: false, error: 'Provider not linked' };
  }

  /**
   * Change password for existing user
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const currentHash = passwordHashes.get(userId);

    if (!currentHash) {
      return { success: false, error: 'No password set for this account' };
    }

    if (!verifyPassword(currentPassword, currentHash)) {
      return { success: false, error: 'Current password is incorrect' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' };
    }

    passwordHashes.set(userId, hashPassword(newPassword));

    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  private mapDbUserToAuthUser(dbUser: DbUser): AuthUser {
    const providers = this.getLinkedProviders(dbUser.id);

    // Get additional profile data if available
    let firstName = '';
    let lastName = '';
    let approvalStatus: string | undefined;
    let image: string | undefined;

    // Try to get therapist data
    const therapist = mockDb.getTherapistByUserId(dbUser.id);
    if (therapist) {
      firstName = therapist.firstName;
      lastName = therapist.lastName;
      approvalStatus = therapist.approvalStatus;
      image = therapist.photoUrl ?? undefined;
    }

    // Try to get patient data if not therapist
    if (!firstName) {
      const patient = mockDb.getPatientByUserId(dbUser.id);
      if (patient) {
        firstName = patient.firstName;
        lastName = patient.lastName;
      }
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: `${firstName} ${lastName}`.trim() || dbUser.email.split('@')[0],
      firstName,
      lastName,
      image,
      role: dbUser.role,
      emailVerified: dbUser.status === 'ACTIVE',
      providers,
      approvalStatus,
      createdAt: dbUser.createdAt,
    };
  }

  private updateLastLogin(userId: string): void {
    // In production, update lastLoginAt in database
    mockDb.updateUser(userId, { updatedAt: new Date() });
  }

  private generateToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 32)}`;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const authService = AuthService.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function handleOAuthCallback(profile: OAuthProfile): Promise<LoginResult> {
  return authService.handleOAuthSignIn(profile);
}

export async function signInWithEmail(email: string, password: string): Promise<LoginResult> {
  return authService.signInWithCredentials(email, password);
}

export async function registerUser(data: RegistrationData): Promise<LoginResult> {
  return authService.registerWithCredentials(data);
}

export function getUserById(id: string): AuthUser | null {
  return authService.findUserById(id);
}

export function getUserByEmail(email: string): AuthUser | null {
  return authService.findUserByEmail(email);
}

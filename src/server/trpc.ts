import { initTRPC, TRPCError } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { MOCK_USERS, type MockUser, type UserRole } from '@/lib/auth/config';
import { hasPermission, Permission } from '@/lib/auth/permissions';

/**
 * Mock session type for development
 * In production, this will be replaced by NextAuth Session
 */
export interface MockSessionData {
  user: MockUser & { approvalStatus?: string };
}

/**
 * Context for tRPC procedures
 */
export interface Context {
  session: MockSessionData | null;
}

/**
 * Create context for each tRPC request
 * Reads mock session from cookie, header, or infers from Referer.
 * In production, this will use NextAuth session.
 */
export async function createContext(opts?: FetchCreateContextFnOptions): Promise<Context> {
  // 1. Try to read mock session from cookie
  const cookieHeader = opts?.req?.headers?.get('cookie') ?? '';
  const sessionMatch = cookieHeader.match(/next-auth\.session-token=([^;]+)/);

  if (sessionMatch) {
    try {
      const decoded = decodeURIComponent(sessionMatch[1]);
      const parsed = JSON.parse(decoded);
      if (parsed && parsed.role) {
        const roleKey = parsed.role.toLowerCase();
        const user = MOCK_USERS[roleKey] ?? MOCK_USERS.patient;
        return { session: { user } };
      }
    } catch {
      // Fall through
    }
  }

  // 2. Check for x-mock-role header (useful for testing)
  const mockRole = opts?.req?.headers?.get('x-mock-role');
  if (mockRole && MOCK_USERS[mockRole]) {
    return { session: { user: MOCK_USERS[mockRole] } };
  }

  // 3. Infer role from Referer header (dev convenience)
  const referer = opts?.req?.headers?.get('referer') ?? '';
  if (referer.includes('/admin')) {
    return { session: { user: MOCK_USERS.admin } };
  }
  if (referer.includes('/therapist')) {
    return { session: { user: MOCK_USERS.therapist } };
  }

  // Default to patient mock user for development
  return { session: { user: MOCK_USERS.patient } };
}

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * Middleware to check if user is authenticated
 */
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(isAuthed);

/**
 * Middleware to check user role
 */
const hasRole = (allowedRoles: UserRole[]) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    if (!allowedRoles.includes(ctx.session.user.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource',
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
        user: ctx.session.user,
      },
    });
  });

/**
 * Patient-only procedure
 */
export const patientProcedure = t.procedure.use(hasRole(['PATIENT']));

/**
 * Therapist-only procedure
 */
export const therapistProcedure = t.procedure.use(hasRole(['THERAPIST']));

/**
 * Admin-only procedure (also allows Owner)
 */
export const adminProcedure = t.procedure.use(hasRole(['ADMIN', 'OWNER']));

/**
 * Owner-only procedure
 */
export const ownerProcedure = t.procedure.use(hasRole(['OWNER']));

/**
 * Middleware to check specific permission
 */
const requirePermission = (permission: Permission) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    if (!hasPermission(ctx.session.user.role, permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action',
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
        user: ctx.session.user,
      },
    });
  });

/**
 * Create a procedure that requires a specific permission
 */
export const createPermissionProcedure = (permission: Permission) =>
  t.procedure.use(requirePermission(permission));

/**
 * Middleware to check therapist approval status
 */
const isApprovedTherapist = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  if (ctx.session.user.role !== 'THERAPIST') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This resource is only available to therapists',
    });
  }

  if (ctx.session.user.approvalStatus !== 'APPROVED') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Your therapist profile is not yet approved',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

/**
 * Approved therapist procedure
 */
export const approvedTherapistProcedure = t.procedure.use(isApprovedTherapist);

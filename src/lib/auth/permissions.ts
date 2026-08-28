import type { UserRole } from './config';

/**
 * Granular permissions for role-based access control
 */
export enum Permission {
  // Patient permissions
  PATIENT_VIEW_MATCHES = 'patient:view_matches',
  PATIENT_REQUEST_SESSION = 'patient:request_session',
  PATIENT_COMPLETE_QUESTIONNAIRE = 'patient:complete_questionnaire',
  PATIENT_VIEW_SESSIONS = 'patient:view_sessions',
  PATIENT_CANCEL_SESSION = 'patient:cancel_session',
  PATIENT_UPDATE_PROFILE = 'patient:update_profile',
  PATIENT_UPDATE_XFACTOR = 'patient:update_xfactor',

  // Therapist permissions
  THERAPIST_VIEW_OWN_SESSIONS = 'therapist:view_own_sessions',
  THERAPIST_MANAGE_AVAILABILITY = 'therapist:manage_availability',
  THERAPIST_UPLOAD_DOCUMENTS = 'therapist:upload_documents',
  THERAPIST_MANAGE_PROFILE = 'therapist:manage_profile',
  THERAPIST_APPROVE_SESSION = 'therapist:approve_session',
  THERAPIST_REJECT_SESSION = 'therapist:reject_session',
  THERAPIST_CANCEL_SESSION = 'therapist:cancel_session',
  THERAPIST_VIEW_OWN_PATIENTS = 'therapist:view_own_patients',
  THERAPIST_SEND_MESSAGE = 'therapist:send_message',

  // Admin permissions
  ADMIN_VIEW_USERS = 'admin:view_users',
  ADMIN_MANAGE_USERS = 'admin:manage_users',
  ADMIN_APPROVE_THERAPISTS = 'admin:approve_therapists',
  ADMIN_REJECT_THERAPISTS = 'admin:reject_therapists',
  ADMIN_SUSPEND_THERAPISTS = 'admin:suspend_therapists',
  ADMIN_REVIEW_DOCUMENTS = 'admin:review_documents',
  ADMIN_REQUEST_DOCUMENTS = 'admin:request_documents',
  ADMIN_MANAGE_QUESTIONNAIRES = 'admin:manage_questionnaires',
  ADMIN_VIEW_REPORTS = 'admin:view_reports',
  ADMIN_MANAGE_SYSTEM = 'admin:manage_system',
  ADMIN_VIEW_ALL_SESSIONS = 'admin:view_all_sessions',
  ADMIN_CREATE_DUMMY_DATA = 'admin:create_dummy_data',
  ADMIN_DELETE_RECORDS = 'admin:delete_records',
  ADMIN_VIEW_AUDIT_LOGS = 'admin:view_audit_logs',
  ADMIN_VIEW_NOTIFICATIONS = 'admin:view_notifications',
  ADMIN_ADD_INTERNAL_NOTES = 'admin:add_internal_notes',

  // Owner-only permissions
  OWNER_MANAGE_ADMINS = 'owner:manage_admins',
  OWNER_OVERRIDE_DECISIONS = 'owner:override_decisions',
  OWNER_VIEW_SYSTEM_STATE = 'owner:view_system_state',
  OWNER_BULK_ACTIONS = 'owner:bulk_actions',
  OWNER_DELETE_ANY = 'owner:delete_any',
  OWNER_IMPERSONATE = 'owner:impersonate',
}

/**
 * Mapping of roles to their permissions
 */
export const RolePermissions: Record<UserRole, Permission[]> = {
  PATIENT: [
    Permission.PATIENT_VIEW_MATCHES,
    Permission.PATIENT_REQUEST_SESSION,
    Permission.PATIENT_COMPLETE_QUESTIONNAIRE,
    Permission.PATIENT_VIEW_SESSIONS,
    Permission.PATIENT_CANCEL_SESSION,
    Permission.PATIENT_UPDATE_PROFILE,
    Permission.PATIENT_UPDATE_XFACTOR,
  ],
  THERAPIST: [
    Permission.THERAPIST_VIEW_OWN_SESSIONS,
    Permission.THERAPIST_MANAGE_AVAILABILITY,
    Permission.THERAPIST_UPLOAD_DOCUMENTS,
    Permission.THERAPIST_MANAGE_PROFILE,
    Permission.THERAPIST_APPROVE_SESSION,
    Permission.THERAPIST_REJECT_SESSION,
    Permission.THERAPIST_CANCEL_SESSION,
    Permission.THERAPIST_VIEW_OWN_PATIENTS,
    Permission.THERAPIST_SEND_MESSAGE,
  ],
  ADMIN: [
    // Admin has all patient and therapist viewing permissions
    Permission.ADMIN_VIEW_USERS,
    Permission.ADMIN_MANAGE_USERS,
    Permission.ADMIN_APPROVE_THERAPISTS,
    Permission.ADMIN_REJECT_THERAPISTS,
    Permission.ADMIN_SUSPEND_THERAPISTS,
    Permission.ADMIN_REVIEW_DOCUMENTS,
    Permission.ADMIN_REQUEST_DOCUMENTS,
    Permission.ADMIN_MANAGE_QUESTIONNAIRES,
    Permission.ADMIN_VIEW_REPORTS,
    Permission.ADMIN_MANAGE_SYSTEM,
    Permission.ADMIN_VIEW_ALL_SESSIONS,
    Permission.ADMIN_CREATE_DUMMY_DATA,
    Permission.ADMIN_DELETE_RECORDS,
    Permission.ADMIN_VIEW_AUDIT_LOGS,
    Permission.ADMIN_VIEW_NOTIFICATIONS,
    Permission.ADMIN_ADD_INTERNAL_NOTES,
  ],
  OWNER: Object.values(Permission), // Owner has ALL permissions
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return RolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return RolePermissions[role] ?? [];
}

/**
 * Route protection configuration
 */
export const RoutePermissions: Record<string, Permission[]> = {
  // Patient routes
  '/dashboard': [Permission.PATIENT_VIEW_MATCHES],
  '/questionnaire': [Permission.PATIENT_COMPLETE_QUESTIONNAIRE],
  '/matches': [Permission.PATIENT_VIEW_MATCHES],
  '/sessions': [Permission.PATIENT_VIEW_SESSIONS],
  '/profile': [Permission.PATIENT_UPDATE_PROFILE],

  // Therapist routes
  '/therapist/dashboard': [Permission.THERAPIST_VIEW_OWN_SESSIONS],
  '/therapist/sessions': [Permission.THERAPIST_VIEW_OWN_SESSIONS],
  '/therapist/availability': [Permission.THERAPIST_MANAGE_AVAILABILITY],
  '/therapist/documents': [Permission.THERAPIST_UPLOAD_DOCUMENTS],
  '/therapist/profile': [Permission.THERAPIST_MANAGE_PROFILE],
  '/therapist/patients': [Permission.THERAPIST_VIEW_OWN_PATIENTS],

  // Admin routes
  '/admin': [Permission.ADMIN_VIEW_USERS],
  '/admin/users': [Permission.ADMIN_VIEW_USERS],
  '/admin/therapists': [Permission.ADMIN_APPROVE_THERAPISTS],
  '/admin/applications': [Permission.ADMIN_APPROVE_THERAPISTS],
  '/admin/questionnaires': [Permission.ADMIN_MANAGE_QUESTIONNAIRES],
  '/admin/reports': [Permission.ADMIN_VIEW_REPORTS],
  '/admin/settings': [Permission.ADMIN_MANAGE_SYSTEM],
  '/admin/audit': [Permission.ADMIN_VIEW_AUDIT_LOGS],
  '/admin/notifications': [Permission.ADMIN_VIEW_NOTIFICATIONS],

  // Owner routes
  '/owner': [Permission.OWNER_VIEW_SYSTEM_STATE],
  '/owner/admins': [Permission.OWNER_MANAGE_ADMINS],
};

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  const matchingRoute = Object.keys(RoutePermissions)
    .filter((r) => route.startsWith(r))
    .sort((a, b) => b.length - a.length)[0];

  if (!matchingRoute) {
    return true; // Public route
  }

  const requiredPermissions = RoutePermissions[matchingRoute];
  return hasAnyPermission(role, requiredPermissions);
}

/**
 * Therapist approval status labels
 */
export const TherapistApprovalStatusLabels: Record<string, { en: string; he: string; color: string }> = {
  PENDING_INFO: { en: 'Pending Info', he: 'Awaiting information', color: 'yellow' },
  AWAITING_APPROVAL: { en: 'Awaiting Approval', he: 'Pending Approval', color: 'blue' },
  APPROVED: { en: 'Approved', he: 'Approved', color: 'green' },
  REJECTED: { en: 'Rejected', he: 'נDecline', color: 'red' },
  SUSPENDED: { en: 'Suspended', he: 'edTime', color: 'orange' },
  MISSING_DOCUMENTS: { en: 'Missing Documents', he: 'Missing documents', color: 'purple' },
};

/**
 * MatchMind Governance - Access Control
 *
 * Role-based access control (RBAC) system for managing
 * permissions across the platform.
 */

import type {
  IAccessControl,
  Role,
  Permission,
  RolePermissions,
  AccessDecision,
} from '../types';
import { getAuditLogger, createAuditEntry } from '../audit/audit-logger';

// =============================================================================
// DEFAULT ROLE PERMISSIONS
// =============================================================================

const DEFAULT_ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'admin',
    permissions: [
      // Full access
      'user.view', 'user.edit', 'user.delete', 'user.suspend',
      'therapist.view', 'therapist.edit', 'therapist.approve', 'therapist.documents',
      'patient.view', 'patient.edit', 'patient.questionnaire', 'patient.matches',
      'session.view', 'session.manage', 'session.approve',
      'data.import', 'data.export', 'data.delete',
      'config.view', 'config.edit', 'config.matching',
      'audit.view', 'audit.export',
      'analytics.view', 'analytics.export',
    ],
  },
  {
    role: 'support',
    permissions: [
      'user.view', 'user.edit',
      'therapist.view', 'therapist.documents',
      'patient.view',
      'session.view', 'session.manage',
      'audit.view',
      'analytics.view',
    ],
  },
  {
    role: 'analyst',
    permissions: [
      'therapist.view',
      'patient.view',
      'session.view',
      'config.view',
      'audit.view',
      'analytics.view', 'analytics.export',
    ],
  },
  {
    role: 'therapist',
    permissions: [
      'therapist.view', // Can view own profile
      'session.view', 'session.manage', 'session.approve', // Own sessions
    ],
  },
  {
    role: 'patient',
    permissions: [
      'patient.view', // Can view own profile
      'patient.edit', // Can edit own profile
      'patient.questionnaire',
      'patient.matches',
      'session.view', // Own sessions
    ],
  },
];

// =============================================================================
// ACCESS CONTROL IMPLEMENTATION
// =============================================================================

export class AccessControl implements IAccessControl {
  private rolePermissions: Map<Role, Set<Permission>>;
  private userOverrides: Map<string, { granted: Set<Permission>; revoked: Set<Permission> }>;

  constructor() {
    this.rolePermissions = new Map();
    this.userOverrides = new Map();

    // Initialize from defaults
    for (const rp of DEFAULT_ROLE_PERMISSIONS) {
      this.rolePermissions.set(rp.role, new Set(rp.permissions));
    }
  }

  /**
   * Check if a user has access to perform an action
   */
  async checkAccess(
    userId: string,
    permission: Permission,
    context?: {
      targetUserId?: string;
      ipAddress?: string;
    }
  ): Promise<AccessDecision> {
    const auditLogger = getAuditLogger();

    // Get user's role and permissions
    const userRole = await this.getUserRole(userId);
    const permissions = await this.getUserPermissions(userId);

    // Check if permission is granted
    const hasPermission = permissions.includes(permission);

    // Special case: users can always access their own data
    const isOwnData = context?.targetUserId === userId;
    const isSelfAccessPermission = this.isSelfAccessible(permission);

    if (!hasPermission && !(isOwnData && isSelfAccessPermission)) {
      // Log access denial
      await auditLogger.log(
        createAuditEntry('security.access_denied', `Access denied: ${permission}`, {
          actorId: userId,
          actorRole: userRole,
          details: { permission, targetUserId: context?.targetUserId },
          ipAddress: context?.ipAddress,
          success: false,
        })
      );

      return {
        allowed: false,
        reason: 'אין לך הרשאה לבצע פעולה זו',
        requiredPermission: permission,
        missingPermissions: [permission],
      };
    }

    return {
      allowed: true,
      reason: 'הרשאה אושרה',
    };
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const role = await this.getUserRole(userId);
    const rolePerms = this.rolePermissions.get(role) || new Set<Permission>();

    // Get user overrides
    const overrides = this.userOverrides.get(userId);
    let permissions = new Set(rolePerms);

    if (overrides) {
      // Add granted permissions
      Array.from(overrides.granted).forEach(perm => {
        permissions.add(perm);
      });
      // Remove revoked permissions
      Array.from(overrides.revoked).forEach(perm => {
        permissions.delete(perm);
      });
    }

    return Array.from(permissions);
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(userId: string, role: Role): Promise<boolean> {
    const userRole = await this.getUserRole(userId);
    return userRole === role;
  }

  /**
   * Grant additional permission to a user
   */
  async grantPermission(
    userId: string,
    permission: Permission,
    grantedBy: string
  ): Promise<void> {
    const overrides = this.userOverrides.get(userId) || {
      granted: new Set<Permission>(),
      revoked: new Set<Permission>(),
    };

    overrides.granted.add(permission);
    overrides.revoked.delete(permission);
    this.userOverrides.set(userId, overrides);

    // Audit log
    const auditLogger = getAuditLogger();
    await auditLogger.log(
      createAuditEntry('admin.permission_change', `הרשאה ${permission} ניתנה למשתמש`, {
        actorId: grantedBy,
        targetId: userId,
        targetType: 'user',
        details: { permission, action: 'grant' },
      })
    );
  }

  /**
   * Revoke permission from a user
   */
  async revokePermission(
    userId: string,
    permission: Permission,
    revokedBy: string
  ): Promise<void> {
    const overrides = this.userOverrides.get(userId) || {
      granted: new Set<Permission>(),
      revoked: new Set<Permission>(),
    };

    overrides.revoked.add(permission);
    overrides.granted.delete(permission);
    this.userOverrides.set(userId, overrides);

    // Audit log
    const auditLogger = getAuditLogger();
    await auditLogger.log(
      createAuditEntry('admin.permission_change', `הרשאה ${permission} הוסרה ממשתמש`, {
        actorId: revokedBy,
        targetId: userId,
        targetType: 'user',
        details: { permission, action: 'revoke' },
      })
    );
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  /**
   * Get user's role from database
   * In production, this would query the database
   */
  private async getUserRole(userId: string): Promise<Role> {
    // Placeholder: In production, query the database
    // const user = await prisma.user.findUnique({ where: { id: userId }});
    // return user?.role as Role || 'patient';

    // For now, return a default
    return 'patient';
  }

  /**
   * Check if a permission allows self-access
   */
  private isSelfAccessible(permission: Permission): boolean {
    const selfAccessiblePermissions: Permission[] = [
      'patient.view',
      'patient.edit',
      'patient.questionnaire',
      'patient.matches',
      'therapist.view',
      'session.view',
    ];

    return selfAccessiblePermissions.includes(permission);
  }
}

// =============================================================================
// PERMISSION UTILITIES
// =============================================================================

/**
 * Get Hebrew label for a permission
 */
export function getPermissionLabel(permission: Permission): string {
  const labels: Record<Permission, string> = {
    'user.view': 'צפייה במשתמשים',
    'user.edit': 'עריכת משתמשים',
    'user.delete': 'מחיקת משתמשים',
    'user.suspend': 'השעיית משתמשים',
    'therapist.view': 'צפייה במטפלים',
    'therapist.edit': 'עריכת מטפלים',
    'therapist.approve': 'אישור מטפלים',
    'therapist.documents': 'ניהול מסמכי מטפלים',
    'patient.view': 'צפייה במטופלים',
    'patient.edit': 'עריכת מטופלים',
    'patient.questionnaire': 'ניהול שאלונים',
    'patient.matches': 'צפייה בהתאמות',
    'session.view': 'צפייה בפגישות',
    'session.manage': 'ניהול פגישות',
    'session.approve': 'אישור פגישות',
    'data.import': 'ייבוא נתונים',
    'data.export': 'ייצוא נתונים',
    'data.delete': 'מחיקת נתונים',
    'config.view': 'צפייה בהגדרות',
    'config.edit': 'עריכת הגדרות',
    'config.matching': 'הגדרות התאמה',
    'audit.view': 'צפייה ביומני בקרה',
    'audit.export': 'ייצוא יומני בקרה',
    'analytics.view': 'צפייה באנליטיקס',
    'analytics.export': 'ייצוא אנליטיקס',
  };

  return labels[permission] || permission;
}

/**
 * Get Hebrew label for a role
 */
export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    admin: 'מנהל מערכת',
    therapist: 'מטפל',
    patient: 'מטופל',
    support: 'תמיכה',
    analyst: 'אנליסט',
  };

  return labels[role] || role;
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  const rolePerms = DEFAULT_ROLE_PERMISSIONS.find(rp => rp.role === role);
  return rolePerms?.permissions || [];
}

/**
 * Group permissions by category
 */
export function groupPermissionsByCategory(): Record<string, Permission[]> {
  return {
    'משתמשים': ['user.view', 'user.edit', 'user.delete', 'user.suspend'],
    'מטפלים': ['therapist.view', 'therapist.edit', 'therapist.approve', 'therapist.documents'],
    'מטופלים': ['patient.view', 'patient.edit', 'patient.questionnaire', 'patient.matches'],
    'פגישות': ['session.view', 'session.manage', 'session.approve'],
    'נתונים': ['data.import', 'data.export', 'data.delete'],
    'הגדרות': ['config.view', 'config.edit', 'config.matching'],
    'בקרה': ['audit.view', 'audit.export'],
    'אנליטיקס': ['analytics.view', 'analytics.export'],
  };
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let accessControlInstance: AccessControl | null = null;

export function getAccessControl(): IAccessControl {
  if (!accessControlInstance) {
    accessControlInstance = new AccessControl();
  }
  return accessControlInstance;
}

// =============================================================================
// FACTORY
// =============================================================================

export function createAccessControl(): IAccessControl {
  return new AccessControl();
}

/**
 * MatchMind Governance - Type Definitions
 *
 * Types for audit logging, access control, configuration management,
 * and compliance tracking.
 */

// =============================================================================
// AUDIT LOG TYPES
// =============================================================================

export type AuditAction =
  // User actions
  | 'user.login'
  | 'user.logout'
  | 'user.register'
  | 'user.password_change'
  | 'user.password_reset'
  | 'user.profile_update'
  | 'user.delete'
  | 'user.suspend'
  | 'user.reactivate'

  // Therapist actions
  | 'therapist.create'
  | 'therapist.update'
  | 'therapist.approve'
  | 'therapist.reject'
  | 'therapist.suspend'
  | 'therapist.document_upload'
  | 'therapist.document_approve'
  | 'therapist.document_reject'
  | 'therapist.availability_update'

  // Patient actions
  | 'patient.create'
  | 'patient.update'
  | 'patient.questionnaire_start'
  | 'patient.questionnaire_complete'
  | 'patient.xfactor_computed'

  // Matching actions
  | 'match.compute'
  | 'match.view'
  | 'match.refresh'
  | 'match.config_change'

  // Session actions
  | 'session.request'
  | 'session.approve'
  | 'session.reject'
  | 'session.cancel'
  | 'session.complete'
  | 'session.reschedule'

  // Data actions
  | 'data.import_start'
  | 'data.import_complete'
  | 'data.import_fail'
  | 'data.export'
  | 'data.delete'

  // Admin actions
  | 'admin.config_update'
  | 'admin.permission_change'
  | 'admin.system_setting_change'
  | 'admin.feature_flag_toggle'

  // Security actions
  | 'security.access_denied'
  | 'security.rate_limit'
  | 'security.suspicious_activity';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AuditCategory =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'configuration'
  | 'security'
  | 'matching'
  | 'session';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;

  // Action details
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;

  // Actor
  actorId?: string;
  actorType: 'user' | 'system' | 'api' | 'cron';
  actorEmail?: string;
  actorRole?: string;

  // Target
  targetId?: string;
  targetType?: string;
  targetName?: string;

  // Context
  description: string;
  details?: Record<string, unknown>;
  previousValue?: unknown;
  newValue?: unknown;

  // Request info
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;

  // Result
  success: boolean;
  errorMessage?: string;
}

// =============================================================================
// ACCESS CONTROL TYPES
// =============================================================================

export type Role = 'admin' | 'therapist' | 'patient' | 'support' | 'analyst';

export type Permission =
  // User permissions
  | 'user.view'
  | 'user.edit'
  | 'user.delete'
  | 'user.suspend'

  // Therapist permissions
  | 'therapist.view'
  | 'therapist.edit'
  | 'therapist.approve'
  | 'therapist.documents'

  // Patient permissions
  | 'patient.view'
  | 'patient.edit'
  | 'patient.questionnaire'
  | 'patient.matches'

  // Session permissions
  | 'session.view'
  | 'session.manage'
  | 'session.approve'

  // Data permissions
  | 'data.import'
  | 'data.export'
  | 'data.delete'

  // Config permissions
  | 'config.view'
  | 'config.edit'
  | 'config.matching'

  // Audit permissions
  | 'audit.view'
  | 'audit.export'

  // Analytics permissions
  | 'analytics.view'
  | 'analytics.export';

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  requiredPermission?: Permission;
  missingPermissions?: Permission[];
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export type ConfigScope = 'global' | 'organization' | 'user';

export type ConfigType =
  | 'matching'
  | 'notification'
  | 'security'
  | 'feature'
  | 'ui'
  | 'integration';

export interface ConfigEntry {
  key: string;
  value: unknown;
  type: ConfigType;
  scope: ConfigScope;
  scopeId?: string;  // Organization or user ID

  // Metadata
  description?: string;
  validValues?: unknown[];
  defaultValue?: unknown;

  // History
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
  version: number;
}

export interface ConfigChange {
  key: string;
  previousValue: unknown;
  newValue: unknown;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

// =============================================================================
// FEATURE FLAG TYPES
// =============================================================================

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;

  // State
  enabled: boolean;
  enabledForRoles?: Role[];
  enabledForUserIds?: string[];
  enabledPercentage?: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// =============================================================================
// COMPLIANCE TYPES
// =============================================================================

export type DataRetentionPolicy = {
  entityType: string;
  retentionDays: number;
  archiveEnabled: boolean;
  deleteOnExpiry: boolean;
};

export interface PrivacyConsent {
  userId: string;
  consentType: 'terms' | 'privacy' | 'marketing' | 'data_processing';
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  version: string;
  ipAddress?: string;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  handledBy?: string;
  notes?: string;
}

// =============================================================================
// INTERFACES
// =============================================================================

export interface IAuditLogger {
  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void>;
  query(filters: AuditQueryFilters): Promise<AuditLogEntry[]>;
  export(filters: AuditQueryFilters, format: 'json' | 'csv'): Promise<string>;
}

export interface AuditQueryFilters {
  startDate?: Date;
  endDate?: Date;
  actions?: AuditAction[];
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  actorId?: string;
  targetId?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export interface IAccessControl {
  checkAccess(userId: string, permission: Permission): Promise<AccessDecision>;
  getUserPermissions(userId: string): Promise<Permission[]>;
  hasRole(userId: string, role: Role): Promise<boolean>;
  grantPermission(userId: string, permission: Permission, grantedBy: string): Promise<void>;
  revokePermission(userId: string, permission: Permission, revokedBy: string): Promise<void>;
}

export interface IConfigManager {
  get<T>(key: string, scope?: ConfigScope, scopeId?: string): Promise<T | null>;
  set<T>(key: string, value: T, scope: ConfigScope, scopeId?: string, changedBy?: string): Promise<void>;
  delete(key: string, scope: ConfigScope, scopeId?: string): Promise<void>;
  getHistory(key: string): Promise<ConfigChange[]>;
}

export interface IFeatureFlagManager {
  isEnabled(key: string, userId?: string, role?: Role): Promise<boolean>;
  getFlag(key: string): Promise<FeatureFlag | null>;
  setFlag(flag: FeatureFlag): Promise<void>;
  toggleFlag(key: string, enabled: boolean, toggledBy: string): Promise<void>;
}

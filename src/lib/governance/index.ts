/**
 * MatchMind Governance
 *
 * Comprehensive governance, audit, and access control system
 * for managing platform security, compliance, and configuration.
 *
 * @example
 * ```typescript
 * import {
 *   getAuditLogger,
 *   getAccessControl,
 *   getConfigManager,
 *   createAuditEntry
 * } from '@/lib/governance';
 *
 * // Log an audit event
 * const auditLogger = getAuditLogger();
 * await auditLogger.log(createAuditEntry('user.login', 'User logged in', {
 *   actorId: userId,
 *   actorEmail: email,
 * }));
 *
 * // Check access
 * const accessControl = getAccessControl();
 * const decision = await accessControl.checkAccess(userId, 'therapist.approve');
 *
 * // Get configuration
 * const configManager = getConfigManager();
 * const maxResults = await configManager.get<number>('matching.max_results');
 * ```
 */

// =============================================================================
// AUDIT LOGGING
// =============================================================================

export {
  AuditLogger,
  getAuditLogger,
  createAuditLogger,
  createAuditEntry,
  getActionSeverity,
  getActionCategory,
} from './audit/audit-logger';

// =============================================================================
// ACCESS CONTROL
// =============================================================================

export {
  AccessControl,
  getAccessControl,
  createAccessControl,
  getPermissionLabel,
  getRoleLabel,
  getRolePermissions,
  groupPermissionsByCategory,
} from './access/access-control';

// =============================================================================
// CONFIGURATION MANAGEMENT
// =============================================================================

export {
  ConfigManager,
  getConfigManager,
  createConfigManager,
  getAvailableConfigs,
  getConfigLabel,
} from './config/config-manager';

// =============================================================================
// TYPES
// =============================================================================

export type {
  // Audit types
  AuditAction,
  AuditSeverity,
  AuditCategory,
  AuditLogEntry,
  AuditQueryFilters,
  IAuditLogger,

  // Access control types
  Role,
  Permission,
  RolePermissions,
  AccessDecision,
  IAccessControl,

  // Configuration types
  ConfigScope,
  ConfigType,
  ConfigEntry,
  ConfigChange,
  IConfigManager,

  // Feature flag types
  FeatureFlag,
  IFeatureFlagManager,

  // Compliance types
  DataRetentionPolicy,
  PrivacyConsent,
  DataSubjectRequest,
} from './types';

/**
 * MatchMind Governance - Configuration Manager
 *
 * Centralized configuration management with versioning,
 * scoping, and audit trails.
 */

import type {
  IConfigManager,
  ConfigEntry,
  ConfigChange,
  ConfigScope,
  ConfigType,
} from '../types';
import { getAuditLogger, createAuditEntry } from '../audit/audit-logger';

// =============================================================================
// DEFAULT CONFIGURATIONS
// =============================================================================

const DEFAULT_CONFIGS: ConfigEntry[] = [
  // Matching configuration
  {
    key: 'matching.default_config_id',
    value: 'default-v1',
    type: 'matching',
    scope: 'global',
    description: 'Default matching configuration to use',
    version: 1,
  },
  {
    key: 'matching.minimum_score',
    value: 0,
    type: 'matching',
    scope: 'global',
    description: 'Minimum match score to display',
    defaultValue: 0,
    version: 1,
  },
  {
    key: 'matching.max_results',
    value: 20,
    type: 'matching',
    scope: 'global',
    description: 'Maximum number of matches to show',
    defaultValue: 20,
    version: 1,
  },
  {
    key: 'matching.auto_refresh_hours',
    value: 24,
    type: 'matching',
    scope: 'global',
    description: 'Hours before auto-refreshing matches',
    defaultValue: 24,
    version: 1,
  },

  // Notification configuration
  {
    key: 'notification.email_enabled',
    value: true,
    type: 'notification',
    scope: 'global',
    description: 'Enable email notifications',
    defaultValue: true,
    version: 1,
  },
  {
    key: 'notification.session_reminder_hours',
    value: 24,
    type: 'notification',
    scope: 'global',
    description: 'Hours before session to send reminder',
    defaultValue: 24,
    version: 1,
  },

  // Security configuration
  {
    key: 'security.max_login_attempts',
    value: 5,
    type: 'security',
    scope: 'global',
    description: 'Maximum failed login attempts before lockout',
    defaultValue: 5,
    version: 1,
  },
  {
    key: 'security.lockout_duration_minutes',
    value: 15,
    type: 'security',
    scope: 'global',
    description: 'Account lockout duration in minutes',
    defaultValue: 15,
    version: 1,
  },
  {
    key: 'security.session_timeout_minutes',
    value: 60,
    type: 'security',
    scope: 'global',
    description: 'Session timeout in minutes',
    defaultValue: 60,
    version: 1,
  },
  {
    key: 'security.require_email_verification',
    value: true,
    type: 'security',
    scope: 'global',
    description: 'Require email verification for new accounts',
    defaultValue: true,
    version: 1,
  },

  // Feature flags
  {
    key: 'feature.online_sessions',
    value: true,
    type: 'feature',
    scope: 'global',
    description: 'Enable online session support',
    defaultValue: true,
    version: 1,
  },
  {
    key: 'feature.military_matching',
    value: true,
    type: 'feature',
    scope: 'global',
    description: 'Enable military-specific matching features',
    defaultValue: true,
    version: 1,
  },
  {
    key: 'feature.xfactor_v2',
    value: false,
    type: 'feature',
    scope: 'global',
    description: 'Enable X-Factor v2 algorithm',
    defaultValue: false,
    version: 1,
  },

  // UI configuration
  {
    key: 'ui.default_language',
    value: 'he',
    type: 'ui',
    scope: 'global',
    description: 'Default interface language',
    validValues: ['he', 'en'],
    defaultValue: 'he',
    version: 1,
  },
  {
    key: 'ui.theme',
    value: 'light',
    type: 'ui',
    scope: 'global',
    description: 'Default UI theme',
    validValues: ['light', 'dark', 'system'],
    defaultValue: 'light',
    version: 1,
  },
];

// =============================================================================
// CONFIG MANAGER IMPLEMENTATION
// =============================================================================

export class ConfigManager implements IConfigManager {
  private configs: Map<string, ConfigEntry>;
  private history: Map<string, ConfigChange[]>;

  constructor() {
    this.configs = new Map();
    this.history = new Map();

    // Initialize with defaults
    for (const config of DEFAULT_CONFIGS) {
      const key = this.buildKey(config.key, config.scope, config.scopeId);
      this.configs.set(key, config);
    }
  }

  /**
   * Get a configuration value
   */
  async get<T>(
    key: string,
    scope: ConfigScope = 'global',
    scopeId?: string
  ): Promise<T | null> {
    // Try scoped config first
    const scopedKey = this.buildKey(key, scope, scopeId);
    let config = this.configs.get(scopedKey);

    // Fall back to global if not found
    if (!config && scope !== 'global') {
      const globalKey = this.buildKey(key, 'global');
      config = this.configs.get(globalKey);
    }

    if (!config) {
      return null;
    }

    return config.value as T;
  }

  /**
   * Set a configuration value
   */
  async set<T>(
    key: string,
    value: T,
    scope: ConfigScope,
    scopeId?: string,
    changedBy?: string
  ): Promise<void> {
    const fullKey = this.buildKey(key, scope, scopeId);
    const existing = this.configs.get(fullKey);

    // Validate if validValues are defined
    if (existing?.validValues && !existing.validValues.includes(value as never)) {
      throw new Error(
        `Invalid value for ${key}. Valid values: ${existing.validValues.join(', ')}`
      );
    }

    // Create change record
    const change: ConfigChange = {
      key,
      previousValue: existing?.value,
      newValue: value,
      changedBy: changedBy || 'system',
      changedAt: new Date(),
    };

    // Update history
    const keyHistory = this.history.get(fullKey) || [];
    keyHistory.push(change);
    this.history.set(fullKey, keyHistory);

    // Update config
    const newConfig: ConfigEntry = {
      key,
      value,
      type: existing?.type || 'feature',
      scope,
      scopeId,
      description: existing?.description,
      validValues: existing?.validValues,
      defaultValue: existing?.defaultValue,
      lastModifiedBy: changedBy,
      lastModifiedAt: new Date(),
      version: (existing?.version || 0) + 1,
    };

    this.configs.set(fullKey, newConfig);

    // Audit log
    const auditLogger = getAuditLogger();
    await auditLogger.log(
      createAuditEntry('admin.config_update', `הגדרה ${key} עודכנה`, {
        actorId: changedBy,
        details: { key, scope, scopeId },
        previousValue: existing?.value,
        newValue: value,
      })
    );
  }

  /**
   * Delete a configuration
   */
  async delete(key: string, scope: ConfigScope, scopeId?: string): Promise<void> {
    const fullKey = this.buildKey(key, scope, scopeId);
    this.configs.delete(fullKey);
  }

  /**
   * Get configuration change history
   */
  async getHistory(key: string): Promise<ConfigChange[]> {
    // Get all history entries that match the key (across scopes)
    const allHistory: ConfigChange[] = [];

    Array.from(this.history.entries()).forEach(([fullKey, changes]) => {
      if (fullKey.startsWith(key)) {
        allHistory.push(...changes);
      }
    });

    // Sort by date descending
    return allHistory.sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
  }

  // ===========================================================================
  // ADDITIONAL METHODS
  // ===========================================================================

  /**
   * Get all configurations for a scope
   */
  async getAllForScope(scope: ConfigScope, scopeId?: string): Promise<ConfigEntry[]> {
    const results: ConfigEntry[] = [];

    Array.from(this.configs.entries()).forEach(([, config]) => {
      if (config.scope === scope && config.scopeId === scopeId) {
        results.push(config);
      }
    });

    return results;
  }

  /**
   * Get all configurations of a specific type
   */
  async getAllByType(type: ConfigType): Promise<ConfigEntry[]> {
    const results: ConfigEntry[] = [];

    Array.from(this.configs.values()).forEach(config => {
      if (config.type === type) {
        results.push(config);
      }
    });

    return results;
  }

  /**
   * Reset a configuration to its default value
   */
  async resetToDefault(
    key: string,
    scope: ConfigScope,
    scopeId?: string,
    resetBy?: string
  ): Promise<void> {
    const fullKey = this.buildKey(key, scope, scopeId);
    const config = this.configs.get(fullKey);

    if (!config || config.defaultValue === undefined) {
      throw new Error(`No default value found for ${key}`);
    }

    await this.set(key, config.defaultValue, scope, scopeId, resetBy);
  }

  /**
   * Bulk update configurations
   */
  async bulkUpdate(
    updates: { key: string; value: unknown; scope?: ConfigScope; scopeId?: string }[],
    changedBy: string
  ): Promise<void> {
    for (const update of updates) {
      await this.set(
        update.key,
        update.value,
        update.scope || 'global',
        update.scopeId,
        changedBy
      );
    }
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private buildKey(key: string, scope: ConfigScope, scopeId?: string): string {
    if (scope === 'global') {
      return key;
    }
    return `${key}:${scope}:${scopeId || ''}`;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all available configuration keys grouped by type
 */
export function getAvailableConfigs(): Record<ConfigType, string[]> {
  return {
    matching: [
      'matching.default_config_id',
      'matching.minimum_score',
      'matching.max_results',
      'matching.auto_refresh_hours',
    ],
    notification: [
      'notification.email_enabled',
      'notification.session_reminder_hours',
    ],
    security: [
      'security.max_login_attempts',
      'security.lockout_duration_minutes',
      'security.session_timeout_minutes',
      'security.require_email_verification',
    ],
    feature: [
      'feature.online_sessions',
      'feature.military_matching',
      'feature.xfactor_v2',
    ],
    ui: [
      'ui.default_language',
      'ui.theme',
    ],
    integration: [],
  };
}

/**
 * Get Hebrew label for configuration key
 */
export function getConfigLabel(key: string): string {
  const labels: Record<string, string> = {
    'matching.default_config_id': 'הגדרות התאמה ברירת מחדל',
    'matching.minimum_score': 'ציון התאמה מינימלי',
    'matching.max_results': 'מספר תוצאות מקסימלי',
    'matching.auto_refresh_hours': 'רענון אוטומטי (שעות)',
    'notification.email_enabled': 'אפשר התראות אימייל',
    'notification.session_reminder_hours': 'תזכורת לפני פגישה (שעות)',
    'security.max_login_attempts': 'ניסיונות התחברות מקסימליים',
    'security.lockout_duration_minutes': 'זמן נעילה (דקות)',
    'security.session_timeout_minutes': 'פקיעת סשן (דקות)',
    'security.require_email_verification': 'דרוש אימות אימייל',
    'feature.online_sessions': 'פגישות אונליין',
    'feature.military_matching': 'התאמה צבאית',
    'feature.xfactor_v2': 'אלגוריתם X-Factor v2',
    'ui.default_language': 'שפת ממשק',
    'ui.theme': 'ערכת נושא',
  };

  return labels[key] || key;
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let configManagerInstance: ConfigManager | null = null;

export function getConfigManager(): IConfigManager {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager();
  }
  return configManagerInstance;
}

// =============================================================================
// FACTORY
// =============================================================================

export function createConfigManager(): IConfigManager {
  return new ConfigManager();
}

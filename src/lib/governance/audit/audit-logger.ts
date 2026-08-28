/**
 * MatchMind Governance - Audit Logger
 *
 * Comprehensive audit logging system for tracking all actions
 * in the platform for security, compliance, and debugging.
 */

import type {
  IAuditLogger,
  AuditLogEntry,
  AuditQueryFilters,
  AuditAction,
  AuditSeverity,
  AuditCategory,
} from '../types';

// =============================================================================
// AUDIT LOGGER IMPLEMENTATION
// =============================================================================

export class AuditLogger implements IAuditLogger {
  private logBuffer: AuditLogEntry[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private maxBufferSize: number = 100;

  constructor() {
    // In production, set up periodic flushing
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.flush(), this.flushInterval);
    }
  }

  /**
   * Log an audit entry
   */
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    // Add to buffer
    this.logBuffer.push(fullEntry);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.maxBufferSize) {
      await this.flush();
    }

    // For critical events, flush immediately
    if (entry.severity === 'critical') {
      await this.flush();
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(fullEntry);
    }
  }

  /**
   * Query audit logs
   */
  async query(filters: AuditQueryFilters): Promise<AuditLogEntry[]> {
    // In production, this would query the database
    // For now, return from buffer (for testing)
    let results = [...this.logBuffer];

    if (filters.startDate) {
      results = results.filter(e => e.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      results = results.filter(e => e.timestamp <= filters.endDate!);
    }

    if (filters.actions && filters.actions.length > 0) {
      results = results.filter(e => filters.actions!.includes(e.action));
    }

    if (filters.categories && filters.categories.length > 0) {
      results = results.filter(e => filters.categories!.includes(e.category));
    }

    if (filters.severities && filters.severities.length > 0) {
      results = results.filter(e => filters.severities!.includes(e.severity));
    }

    if (filters.actorId) {
      results = results.filter(e => e.actorId === filters.actorId);
    }

    if (filters.targetId) {
      results = results.filter(e => e.targetId === filters.targetId);
    }

    if (filters.success !== undefined) {
      results = results.filter(e => e.success === filters.success);
    }

    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 100;

    return results.slice(offset, offset + limit);
  }

  /**
   * Export audit logs
   */
  async export(
    filters: AuditQueryFilters,
    format: 'json' | 'csv'
  ): Promise<string> {
    const entries = await this.query(filters);

    if (format === 'json') {
      return JSON.stringify(entries, null, 2);
    }

    // CSV format
    const headers = [
      'timestamp',
      'action',
      'category',
      'severity',
      'actorId',
      'actorEmail',
      'actorRole',
      'targetId',
      'targetType',
      'description',
      'success',
      'ipAddress',
    ];

    const rows = entries.map(entry => [
      entry.timestamp.toISOString(),
      entry.action,
      entry.category,
      entry.severity,
      entry.actorId || '',
      entry.actorEmail || '',
      entry.actorRole || '',
      entry.targetId || '',
      entry.targetType || '',
      `"${entry.description.replace(/"/g, '""')}"`,
      entry.success ? 'true' : 'false',
      entry.ipAddress || '',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const entries = [...this.logBuffer];
    this.logBuffer = [];

    // In production, batch insert to database
    // await prisma.auditLog.createMany({ data: entries });

    // For now, just log that we flushed
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Audit] Flushed ${entries.length} entries`);
    }
  }

  private consoleLog(entry: AuditLogEntry): void {
    const severityColors: Record<AuditSeverity, string> = {
      low: '\x1b[37m',      // White
      medium: '\x1b[33m',   // Yellow
      high: '\x1b[35m',     // Magenta
      critical: '\x1b[31m', // Red
    };

    const color = severityColors[entry.severity];
    const reset = '\x1b[0m';

    console.log(
      `${color}[AUDIT] [${entry.severity.toUpperCase()}]${reset} ` +
      `${entry.action} - ${entry.description}` +
      (entry.actorEmail ? ` (by ${entry.actorEmail})` : '') +
      (entry.success ? '' : ' [FAILED]')
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get severity level for an action
 */
export function getActionSeverity(action: AuditAction): AuditSeverity {
  const criticalActions: AuditAction[] = [
    'user.delete',
    'data.delete',
    'admin.permission_change',
    'security.suspicious_activity',
  ];

  const highActions: AuditAction[] = [
    'user.suspend',
    'therapist.approve',
    'therapist.reject',
    'therapist.suspend',
    'admin.config_update',
    'admin.system_setting_change',
    'security.access_denied',
    'data.export',
  ];

  const mediumActions: AuditAction[] = [
    'user.password_change',
    'user.password_reset',
    'therapist.document_approve',
    'therapist.document_reject',
    'session.approve',
    'session.reject',
    'data.import_start',
    'data.import_complete',
    'match.config_change',
  ];

  if (criticalActions.includes(action)) return 'critical';
  if (highActions.includes(action)) return 'high';
  if (mediumActions.includes(action)) return 'medium';
  return 'low';
}

/**
 * Get category for an action
 */
export function getActionCategory(action: AuditAction): AuditCategory {
  if (action.startsWith('user.login') || action.startsWith('user.logout') || action.startsWith('user.register')) {
    return 'authentication';
  }

  if (action.startsWith('security.')) {
    return 'security';
  }

  if (action.startsWith('admin.') || action.includes('permission')) {
    return 'authorization';
  }

  if (action.startsWith('data.') || action.includes('update') || action.includes('create') || action.includes('delete')) {
    return 'data_modification';
  }

  if (action.includes('view') || action.includes('export')) {
    return 'data_access';
  }

  if (action.startsWith('match.')) {
    return 'matching';
  }

  if (action.startsWith('session.')) {
    return 'session';
  }

  return 'data_modification';
}

/**
 * Create a standard audit entry
 */
export function createAuditEntry(
  action: AuditAction,
  description: string,
  options: {
    actorId?: string;
    actorType?: AuditLogEntry['actorType'];
    actorEmail?: string;
    actorRole?: string;
    targetId?: string;
    targetType?: string;
    targetName?: string;
    details?: Record<string, unknown>;
    previousValue?: unknown;
    newValue?: unknown;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    sessionId?: string;
    success?: boolean;
    errorMessage?: string;
  } = {}
): Omit<AuditLogEntry, 'id' | 'timestamp'> {
  return {
    action,
    category: getActionCategory(action),
    severity: getActionSeverity(action),
    description,
    actorType: options.actorType || 'user',
    success: options.success !== false,
    ...options,
  };
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let auditLoggerInstance: AuditLogger | null = null;

export function getAuditLogger(): IAuditLogger {
  if (!auditLoggerInstance) {
    auditLoggerInstance = new AuditLogger();
  }
  return auditLoggerInstance;
}

// =============================================================================
// FACTORY
// =============================================================================

export function createAuditLogger(): IAuditLogger {
  return new AuditLogger();
}

/**
 * External Data Connector
 *
 * Infrastructure for integrating with:
 * - Health Management Organizations (HMOs) APIs
 * - Clinical institutions
 * - Insurance providers
 * - Licensing boards
 *
 * Supports:
 * - Real-time API connections
 * - Batch file imports (CSV, Excel, JSON)
 * - Scheduled sync jobs
 * - Data validation and transformation
 */

// ============================================================================
// TYPES
// ============================================================================

export type ConnectorType = 'API' | 'FILE_IMPORT' | 'WEBHOOK';
export type ConnectorStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'RATE_LIMITED';

export interface ExternalConnector {
  id: string;
  name: string;
  type: ConnectorType;
  provider: string;
  status: ConnectorStatus;
  config: ConnectorConfig;
  lastSync?: Date;
  nextSync?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectorConfig {
  // API Config
  baseUrl?: string;
  apiKey?: string;
  authType?: 'API_KEY' | 'OAUTH2' | 'BASIC';
  headers?: Record<string, string>;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };

  // File Import Config
  fileFormat?: 'CSV' | 'EXCEL' | 'JSON' | 'XML';
  fieldMapping?: FieldMapping[];
  delimiter?: string;
  encoding?: string;

  // Sync Config
  syncSchedule?: string; // Cron expression
  syncMode?: 'FULL' | 'INCREMENTAL';
  batchSize?: number;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'NONE' | 'UPPERCASE' | 'LOWERCASE' | 'DATE_PARSE' | 'CUSTOM';
  customTransform?: string;
  required: boolean;
  defaultValue?: any;
}

export interface SyncResult {
  connectorId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors: SyncError[];
}

export interface SyncError {
  recordIndex: number;
  field?: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

// ============================================================================
// SUPPORTED INTEGRATIONS
// ============================================================================

export const SUPPORTED_INTEGRATIONS = {
  // Israeli Health Funds
  healthFunds: {
    CLALIT: {
      name: 'כללית',
      nameEn: 'Clalit Health Services',
      apiAvailable: true,
      supportedOperations: ['verify_member', 'check_coverage', 'submit_claim'],
    },
    MACCABI: {
      name: 'מכבי',
      nameEn: 'Maccabi Healthcare Services',
      apiAvailable: true,
      supportedOperations: ['verify_member', 'check_coverage'],
    },
    MEUHEDET: {
      name: 'מאוחדת',
      nameEn: 'Meuhedet Health Fund',
      apiAvailable: true,
      supportedOperations: ['verify_member', 'check_coverage'],
    },
    LEUMIT: {
      name: 'לאומית',
      nameEn: 'Leumit Health Fund',
      apiAvailable: false,
      supportedOperations: [],
    },
  },

  // Licensing & Credentials
  licensing: {
    MINISTRY_OF_HEALTH: {
      name: 'משרד הבריאות',
      nameEn: 'Ministry of Health',
      apiAvailable: false,
      supportedOperations: ['verify_license'],
    },
    PSYCHOLOGY_COUNCIL: {
      name: 'מועצת הפסיכולוגים',
      nameEn: 'Israel Psychology Council',
      apiAvailable: false,
      supportedOperations: ['verify_license', 'check_specialization'],
    },
  },

  // Scheduling
  scheduling: {
    GOOGLE_CALENDAR: {
      name: 'Google Calendar',
      apiAvailable: true,
      supportedOperations: ['sync_availability', 'create_event'],
    },
    OUTLOOK: {
      name: 'Microsoft Outlook',
      apiAvailable: true,
      supportedOperations: ['sync_availability', 'create_event'],
    },
  },
};

// ============================================================================
// CONNECTOR REGISTRY
// ============================================================================

const connectorRegistry = new Map<string, ExternalConnector>();

// ============================================================================
// EXTERNAL CONNECTOR SERVICE
// ============================================================================

class ExternalConnectorService {
  private static instance: ExternalConnectorService;

  private constructor() {
    this.initializeDefaultConnectors();
  }

  public static getInstance(): ExternalConnectorService {
    if (!ExternalConnectorService.instance) {
      ExternalConnectorService.instance = new ExternalConnectorService();
    }
    return ExternalConnectorService.instance;
  }

  // ---------------------------------------------------------------------------
  // CONNECTOR MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Register a new external connector
   */
  registerConnector(config: Omit<ExternalConnector, 'id' | 'createdAt' | 'updatedAt'>): ExternalConnector {
    const connector: ExternalConnector = {
      ...config,
      id: `connector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    connectorRegistry.set(connector.id, connector);
    return connector;
  }

  /**
   * Get connector by ID
   */
  getConnector(id: string): ExternalConnector | null {
    return connectorRegistry.get(id) ?? null;
  }

  /**
   * Get all connectors
   */
  getAllConnectors(): ExternalConnector[] {
    return Array.from(connectorRegistry.values());
  }

  /**
   * Update connector status
   */
  updateConnectorStatus(id: string, status: ConnectorStatus, error?: string): void {
    const connector = connectorRegistry.get(id);
    if (connector) {
      connector.status = status;
      connector.errorMessage = error;
      connector.updatedAt = new Date();
    }
  }

  // ---------------------------------------------------------------------------
  // API INTEGRATION
  // ---------------------------------------------------------------------------

  /**
   * Make API request to external service
   */
  async apiRequest<T>(
    connectorId: string,
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      params?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const connector = this.getConnector(connectorId);

    if (!connector) {
      return { success: false, error: 'Connector not found' };
    }

    if (connector.status !== 'ACTIVE') {
      return { success: false, error: `Connector is ${connector.status}` };
    }

    if (connector.type !== 'API') {
      return { success: false, error: 'Not an API connector' };
    }

    try {
      // Build URL
      const url = new URL(endpoint, connector.config.baseUrl);
      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...connector.config.headers,
      };

      if (connector.config.authType === 'API_KEY' && connector.config.apiKey) {
        headers['Authorization'] = `Bearer ${connector.config.apiKey}`;
      }

      // Make request (mock in development)
      if (process.env.NODE_ENV === 'development') {
        return this.mockApiResponse<T>(connector.provider, endpoint);
      }

      const response = await fetch(url.toString(), {
        method: options.method ?? 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'API request failed';
      this.updateConnectorStatus(connectorId, 'ERROR', message);
      return { success: false, error: message };
    }
  }

  /**
   * Mock API responses for development
   */
  private mockApiResponse<T>(provider: string, endpoint: string): ApiResponse<T> {
    // Mock health fund verification
    if (provider.includes('HEALTH_FUND') && endpoint.includes('verify')) {
      return {
        success: true,
        data: {
          verified: true,
          memberName: 'Test User',
          coverage: ['mental_health', 'psychotherapy'],
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        } as any,
      };
    }

    // Mock license verification
    if (provider.includes('LICENSE') && endpoint.includes('verify')) {
      return {
        success: true,
        data: {
          valid: true,
          licenseNumber: 'PSY-12345',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          specializations: ['clinical', 'trauma'],
        } as any,
      };
    }

    return { success: true, data: {} as T };
  }

  // ---------------------------------------------------------------------------
  // FILE IMPORT
  // ---------------------------------------------------------------------------

  /**
   * Import data from file
   */
  async importFromFile(
    connectorId: string,
    fileContent: string | Buffer,
    options: { validateOnly?: boolean } = {}
  ): Promise<SyncResult> {
    const connector = this.getConnector(connectorId);
    const startedAt = new Date();

    if (!connector) {
      return this.createFailedResult(connectorId, startedAt, 'Connector not found');
    }

    if (connector.type !== 'FILE_IMPORT') {
      return this.createFailedResult(connectorId, startedAt, 'Not a file import connector');
    }

    try {
      // Parse file based on format
      const records = this.parseFile(fileContent, connector.config);

      // Validate and transform records
      const { valid, errors } = this.validateRecords(records, connector.config);

      if (options.validateOnly) {
        return {
          connectorId,
          startedAt,
          completedAt: new Date(),
          status: errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
          recordsProcessed: records.length,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsSkipped: errors.length,
          errors,
        };
      }

      // Process valid records
      let created = 0;
      let updated = 0;

      for (const record of valid) {
        // In production, this would insert/update database
        if (record._isNew) {
          created++;
        } else {
          updated++;
        }
      }

      return {
        connectorId,
        startedAt,
        completedAt: new Date(),
        status: errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
        recordsProcessed: records.length,
        recordsCreated: created,
        recordsUpdated: updated,
        recordsSkipped: errors.length,
        errors,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'File import failed';
      return this.createFailedResult(connectorId, startedAt, message);
    }
  }

  private parseFile(
    content: string | Buffer,
    config: ConnectorConfig
  ): Record<string, any>[] {
    const encoding = (config.encoding ?? 'utf-8') as BufferEncoding;
    const text = typeof content === 'string' ? content : content.toString(encoding);

    switch (config.fileFormat) {
      case 'JSON':
        return JSON.parse(text);

      case 'CSV':
        return this.parseCSV(text, config.delimiter ?? ',');

      case 'EXCEL':
        // Would use xlsx library in production
        throw new Error('Excel parsing requires xlsx library');

      default:
        throw new Error(`Unsupported format: ${config.fileFormat}`);
    }
  }

  private parseCSV(text: string, delimiter: string): Record<string, any>[] {
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(delimiter).map((h) => h.trim());
    const records: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter);
      const record: Record<string, any> = {};

      headers.forEach((header, index) => {
        record[header] = values[index]?.trim() ?? '';
      });

      records.push(record);
    }

    return records;
  }

  private validateRecords(
    records: Record<string, any>[],
    config: ConnectorConfig
  ): { valid: Record<string, any>[]; errors: SyncError[] } {
    const valid: Record<string, any>[] = [];
    const errors: SyncError[] = [];

    records.forEach((record, index) => {
      const recordErrors: SyncError[] = [];

      // Apply field mappings and validation
      const transformed: Record<string, any> = { _isNew: true };

      if (config.fieldMapping) {
        for (const mapping of config.fieldMapping) {
          const sourceValue = record[mapping.sourceField];

          if (mapping.required && !sourceValue) {
            recordErrors.push({
              recordIndex: index,
              field: mapping.sourceField,
              message: `Required field "${mapping.sourceField}" is missing`,
              severity: 'ERROR',
            });
            continue;
          }

          let value = sourceValue ?? mapping.defaultValue;

          // Apply transform
          if (value && mapping.transform) {
            switch (mapping.transform) {
              case 'UPPERCASE':
                value = String(value).toUpperCase();
                break;
              case 'LOWERCASE':
                value = String(value).toLowerCase();
                break;
              case 'DATE_PARSE':
                value = new Date(value);
                break;
            }
          }

          transformed[mapping.targetField] = value;
        }
      } else {
        // No mapping, use record as-is
        Object.assign(transformed, record);
      }

      if (recordErrors.length === 0) {
        valid.push(transformed);
      } else {
        errors.push(...recordErrors);
      }
    });

    return { valid, errors };
  }

  private createFailedResult(
    connectorId: string,
    startedAt: Date,
    error: string
  ): SyncResult {
    return {
      connectorId,
      startedAt,
      completedAt: new Date(),
      status: 'FAILED',
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [{ recordIndex: -1, message: error, severity: 'ERROR' }],
    };
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------

  private initializeDefaultConnectors(): void {
    // Health Fund connectors (mock for development)
    this.registerConnector({
      name: 'Clalit Health Fund',
      type: 'API',
      provider: 'HEALTH_FUND_CLALIT',
      status: 'ACTIVE',
      config: {
        baseUrl: 'https://api.clalit.co.il',
        authType: 'API_KEY',
        rateLimit: { requestsPerMinute: 60, requestsPerDay: 10000 },
      },
    });

    this.registerConnector({
      name: 'Maccabi Health Fund',
      type: 'API',
      provider: 'HEALTH_FUND_MACCABI',
      status: 'ACTIVE',
      config: {
        baseUrl: 'https://api.maccabi4u.co.il',
        authType: 'OAUTH2',
        rateLimit: { requestsPerMinute: 30, requestsPerDay: 5000 },
      },
    });

    // CSV Import connector
    this.registerConnector({
      name: 'Therapist Bulk Import',
      type: 'FILE_IMPORT',
      provider: 'INTERNAL_IMPORT',
      status: 'ACTIVE',
      config: {
        fileFormat: 'CSV',
        delimiter: ',',
        encoding: 'utf-8',
        fieldMapping: [
          { sourceField: 'email', targetField: 'email', required: true },
          { sourceField: 'first_name', targetField: 'firstName', required: true },
          { sourceField: 'last_name', targetField: 'lastName', required: true },
          { sourceField: 'license_number', targetField: 'licenseNumber', required: true },
          { sourceField: 'phone', targetField: 'phone', required: false },
          { sourceField: 'city', targetField: 'city', required: false },
        ],
      },
    });
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const externalConnector = ExternalConnectorService.getInstance();

// Convenience functions
export function getConnector(id: string): ExternalConnector | null {
  return externalConnector.getConnector(id);
}

export function getAllConnectors(): ExternalConnector[] {
  return externalConnector.getAllConnectors();
}

export async function verifyHealthFundMember(
  connectorId: string,
  memberId: string
): Promise<ApiResponse<any>> {
  return externalConnector.apiRequest(connectorId, '/members/verify', {
    method: 'POST',
    body: { memberId },
  });
}

export async function importTherapistsFromCSV(
  fileContent: string,
  validateOnly = false
): Promise<SyncResult> {
  const importConnector = getAllConnectors().find(
    (c) => c.provider === 'INTERNAL_IMPORT'
  );

  if (!importConnector) {
    throw new Error('Import connector not found');
  }

  return externalConnector.importFromFile(importConnector.id, fileContent, {
    validateOnly,
  });
}

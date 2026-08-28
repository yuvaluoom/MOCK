/**
 * MatchMind Data Ingestion - Type Definitions
 *
 * Types for importing therapist, patient, and organizational data
 * from external sources (health funds, clinics, CSV files, etc.)
 */

// =============================================================================
// DATA SOURCE TYPES
// =============================================================================

export type DataSourceType =
  | 'csv'
  | 'excel'
  | 'json'
  | 'api'
  | 'health_fund'
  | 'clinic_system'
  | 'manual';

export type DataSourceStatus =
  | 'active'
  | 'inactive'
  | 'error'
  | 'pending_setup';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  status: DataSourceStatus;

  // Connection details
  connectionConfig?: ConnectionConfig;

  // Mapping configuration
  fieldMapping?: FieldMapping;

  // Scheduling
  syncSchedule?: SyncSchedule;

  // Metadata
  lastSyncAt?: Date;
  lastSyncStatus?: 'success' | 'partial' | 'failed';
  recordCount?: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectionConfig {
  // For API sources
  apiEndpoint?: string;
  apiKey?: string;
  authType?: 'none' | 'api_key' | 'oauth' | 'basic';

  // For file sources
  fileFormat?: 'csv' | 'xlsx' | 'json';
  delimiter?: string;
  encoding?: string;
  hasHeader?: boolean;

  // For health fund integrations
  healthFundId?: string;
  clinicCode?: string;
}

export interface FieldMapping {
  // Target field -> Source field or transformation
  [targetField: string]: string | FieldTransformation;
}

export interface FieldTransformation {
  sourceField: string;
  transform: TransformationType;
  params?: Record<string, unknown>;
}

export type TransformationType =
  | 'direct'           // Direct mapping
  | 'lowercase'        // Convert to lowercase
  | 'uppercase'        // Convert to uppercase
  | 'trim'             // Trim whitespace
  | 'split'            // Split into array
  | 'join'             // Join array to string
  | 'map_value'        // Map to predefined values
  | 'parse_date'       // Parse date string
  | 'parse_number'     // Parse number
  | 'hebrew_to_english' // Translate Hebrew field names
  | 'custom';          // Custom transformation function

export interface SyncSchedule {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'manual';
  dayOfWeek?: number;  // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  hour?: number;       // 0-23
  minute?: number;     // 0-59
  timezone: string;
}

// =============================================================================
// IMPORT BATCH TYPES
// =============================================================================

export type ImportEntityType = 'therapist' | 'patient' | 'organization';

export type ImportBatchStatus =
  | 'pending'
  | 'validating'
  | 'validated'
  | 'importing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ImportBatch {
  id: string;
  dataSourceId: string;
  entityType: ImportEntityType;
  status: ImportBatchStatus;

  // File info (for file-based imports)
  fileName?: string;
  fileSize?: number;
  filePath?: string;

  // Progress tracking
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  skippedRecords: number;

  // Results
  records: ImportRecord[];
  summary?: ImportSummary;

  // Audit
  importedBy: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface ImportRecord {
  id: string;
  batchId: string;
  rowNumber: number;

  // Original data
  rawData: Record<string, unknown>;

  // Mapped data
  mappedData?: Record<string, unknown>;

  // Validation
  status: 'pending' | 'valid' | 'invalid' | 'imported' | 'failed' | 'skipped';
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];

  // Result
  entityId?: string;  // ID of created/updated entity
  action?: 'created' | 'updated' | 'skipped';
  errorMessage?: string;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

export interface ImportSummary {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  createdRecords: number;
  updatedRecords: number;
  skippedRecords: number;
  failedRecords: number;

  errorsByField: Record<string, number>;
  warningsByField: Record<string, number>;

  processingTimeMs: number;
}

// =============================================================================
// THERAPIST IMPORT SCHEMA
// =============================================================================

export interface TherapistImportRow {
  // Required fields
  email: string;
  fullName: string;
  licenseNumber: string;

  // Personal info
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;

  // Professional info
  title?: string;
  licenseType?: string;
  yearsExperience?: number;
  education?: string | string[];

  // Practice info
  specializations?: string | string[];
  therapeuticApproaches?: string | string[];
  languages?: string | string[];
  healthFunds?: string | string[];

  // Location
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;

  // Availability
  supportsOnline?: boolean;
  supportsInPerson?: boolean;
  sessionPrice?: number;

  // Organization
  organizationId?: string;
  clinicName?: string;
}

export interface TherapistImportResult {
  therapistId: string;
  email: string;
  action: 'created' | 'updated';
  changes?: string[];
}

// =============================================================================
// PATIENT IMPORT SCHEMA
// =============================================================================

export interface PatientImportRow {
  // Required fields
  email: string;
  fullName: string;

  // Personal info
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;

  // Health info
  healthFund?: string;
  healthFundMemberId?: string;

  // Preferences
  preferredCity?: string;
  preferredLanguages?: string | string[];
  preferredGender?: string;
  preferredApproach?: string;

  // Organization
  organizationId?: string;
  referralSource?: string;
}

// =============================================================================
// ORGANIZATION IMPORT SCHEMA
// =============================================================================

export interface OrganizationImportRow {
  name: string;
  type: string;
  code?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  healthFundCode?: string;
}

// =============================================================================
// INTERFACES
// =============================================================================

export interface IDataParser {
  parse(data: Buffer | string, config: ConnectionConfig): Promise<RawRecord[]>;
  validateFormat(data: Buffer | string, config: ConnectionConfig): Promise<FormatValidationResult>;
}

export interface IFieldMapper {
  map(record: RawRecord, mapping: FieldMapping): MappedRecord;
  applyTransformation(value: unknown, transform: FieldTransformation): unknown;
}

export interface IRecordValidator {
  validate(record: MappedRecord, entityType: ImportEntityType): ValidationResult;
  validateBatch(records: MappedRecord[], entityType: ImportEntityType): BatchValidationResult;
}

export interface IDataImporter {
  importBatch(batch: ImportBatch): Promise<ImportSummary>;
  importRecord(record: ImportRecord, entityType: ImportEntityType): Promise<ImportRecordResult>;
}

export interface IDataIngestionPipeline {
  // Full pipeline
  processImport(
    source: DataSource,
    data: Buffer | string,
    entityType: ImportEntityType,
    userId: string
  ): Promise<ImportBatch>;

  // Individual steps
  parse(source: DataSource, data: Buffer | string): Promise<RawRecord[]>;
  map(records: RawRecord[], source: DataSource): MappedRecord[];
  validate(records: MappedRecord[], entityType: ImportEntityType): BatchValidationResult;
  import(batch: ImportBatch): Promise<ImportSummary>;

  // Status
  getBatchStatus(batchId: string): Promise<ImportBatch | null>;
  cancelBatch(batchId: string): Promise<void>;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

export type RawRecord = Record<string, unknown>;
export type MappedRecord = Record<string, unknown>;

export interface FormatValidationResult {
  valid: boolean;
  errors: string[];
  detectedColumns?: string[];
  sampleRows?: RawRecord[];
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface BatchValidationResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recordResults: ValidationResult[];
}

export interface ImportRecordResult {
  success: boolean;
  entityId?: string;
  action?: 'created' | 'updated' | 'skipped';
  error?: string;
}

// =============================================================================
// HEALTH FUND SPECIFIC TYPES
// =============================================================================

export type HealthFundCode = 'clalit' | 'maccabi' | 'meuhedet' | 'leumit';

export interface HealthFundIntegrationConfig {
  fundCode: HealthFundCode;
  apiEndpoint: string;
  credentials: {
    clientId: string;
    clientSecret: string;
  };
  dataMapping: FieldMapping;
}

export interface HealthFundTherapistRecord {
  providerId: string;
  providerName: string;
  licenseNumber: string;
  specialty: string;
  clinicCode: string;
  clinicName: string;
  address: string;
  city: string;
  phone: string;
  acceptingNewPatients: boolean;
  languages: string[];
}

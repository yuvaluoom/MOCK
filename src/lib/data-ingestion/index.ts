/**
 * MatchMind Data Ingestion
 *
 * Infrastructure for importing therapist, patient, and organizational data
 * from external sources including CSV files, health funds, and clinic systems.
 *
 * @example
 * ```typescript
 * import { createDataIngestionPipeline, previewImport } from '@/lib/data-ingestion';
 *
 * // Preview import
 * const preview = await previewImport(csvData, 'therapist');
 *
 * // Full import
 * const pipeline = createDataIngestionPipeline();
 * const batch = await pipeline.processImport(source, csvData, 'therapist', userId);
 * ```
 */

// =============================================================================
// PIPELINE
// =============================================================================

export {
  DataIngestionPipeline,
  createDataIngestionPipeline,
  previewImport,
  getRequiredFields,
  getSupportedFields,
} from './pipeline/ingestion-pipeline';

// =============================================================================
// PARSERS
// =============================================================================

export {
  CsvParser,
  createCsvParser,
} from './parsers/csv-parser';

// =============================================================================
// MAPPERS
// =============================================================================

export {
  FieldMapper,
  createFieldMapper,
  DEFAULT_THERAPIST_MAPPING,
  DEFAULT_PATIENT_MAPPING,
} from './mappers/field-mapper';

// =============================================================================
// VALIDATORS
// =============================================================================

export {
  RecordValidator,
  createRecordValidator,
} from './validators/record-validator';

// =============================================================================
// TYPES
// =============================================================================

export type {
  // Data Sources
  DataSourceType,
  DataSourceStatus,
  DataSource,
  ConnectionConfig,
  FieldMapping,
  FieldTransformation,
  TransformationType,
  SyncSchedule,

  // Import Batches
  ImportEntityType,
  ImportBatchStatus,
  ImportBatch,
  ImportRecord,
  ImportSummary,
  ValidationError,
  ValidationWarning,

  // Entity Import Schemas
  TherapistImportRow,
  TherapistImportResult,
  PatientImportRow,
  OrganizationImportRow,

  // Interfaces
  IDataParser,
  IFieldMapper,
  IRecordValidator,
  IDataImporter,
  IDataIngestionPipeline,

  // Helper Types
  RawRecord,
  MappedRecord,
  FormatValidationResult,
  ValidationResult,
  BatchValidationResult,
  ImportRecordResult,

  // Health Fund Types
  HealthFundCode,
  HealthFundIntegrationConfig,
  HealthFundTherapistRecord,
} from './types';

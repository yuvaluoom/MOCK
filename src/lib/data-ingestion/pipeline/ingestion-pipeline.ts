/**
 * MatchMind Data Ingestion - Pipeline
 *
 * Orchestrates the full data import process from parsing
 * through validation to database import.
 */

import type {
  IDataIngestionPipeline,
  IDataParser,
  IFieldMapper,
  IRecordValidator,
  DataSource,
  ImportBatch,
  ImportRecord,
  ImportSummary,
  ImportEntityType,
  RawRecord,
  MappedRecord,
  BatchValidationResult,
  ValidationResult,
} from '../types';
import { CsvParser } from '../parsers/csv-parser';
import { FieldMapper, DEFAULT_THERAPIST_MAPPING, DEFAULT_PATIENT_MAPPING } from '../mappers/field-mapper';
import { RecordValidator } from '../validators/record-validator';

// =============================================================================
// INGESTION PIPELINE IMPLEMENTATION
// =============================================================================

export class DataIngestionPipeline implements IDataIngestionPipeline {
  private parser: IDataParser;
  private mapper: IFieldMapper;
  private validator: IRecordValidator;

  constructor(
    parser?: IDataParser,
    mapper?: IFieldMapper,
    validator?: IRecordValidator
  ) {
    this.parser = parser || new CsvParser();
    this.mapper = mapper || new FieldMapper();
    this.validator = validator || new RecordValidator();
  }

  /**
   * Process a full import from raw data to database
   */
  async processImport(
    source: DataSource,
    data: Buffer | string,
    entityType: ImportEntityType,
    userId: string
  ): Promise<ImportBatch> {
    const startTime = performance.now();

    // Initialize batch
    const batch: ImportBatch = {
      id: this.generateBatchId(),
      dataSourceId: source.id,
      entityType,
      status: 'pending',
      totalRecords: 0,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      skippedRecords: 0,
      records: [],
      importedBy: userId,
      createdAt: new Date(),
    };

    try {
      // Step 1: Parse
      batch.status = 'validating';
      const rawRecords = await this.parse(source, data);
      batch.totalRecords = rawRecords.length;

      // Step 2: Map
      const mappedRecords = this.map(rawRecords, source);

      // Step 3: Validate
      const validationResult = this.validate(mappedRecords, entityType);

      // Step 4: Create import records
      batch.records = this.createImportRecords(
        batch.id,
        rawRecords,
        mappedRecords,
        validationResult
      );

      batch.status = 'validated';

      // Step 5: Import (if auto-import is enabled)
      // In practice, you might want to pause here for user confirmation
      // For now, we'll mark as validated and let the caller decide

      const processingTime = performance.now() - startTime;

      batch.summary = {
        totalRecords: batch.totalRecords,
        validRecords: validationResult.validRecords,
        invalidRecords: validationResult.invalidRecords,
        createdRecords: 0,
        updatedRecords: 0,
        skippedRecords: 0,
        failedRecords: 0,
        errorsByField: this.countErrorsByField(validationResult.errors),
        warningsByField: this.countErrorsByField(validationResult.warnings),
        processingTimeMs: processingTime,
      };

    } catch (error) {
      batch.status = 'failed';
      console.error('Import pipeline error:', error);
    }

    return batch;
  }

  /**
   * Parse raw data into records
   */
  async parse(source: DataSource, data: Buffer | string): Promise<RawRecord[]> {
    const config = source.connectionConfig || {
      fileFormat: 'csv',
      hasHeader: true,
      delimiter: ',',
      encoding: 'utf-8',
    };

    return this.parser.parse(data, config);
  }

  /**
   * Map raw records to schema
   */
  map(records: RawRecord[], source: DataSource): MappedRecord[] {
    const mapping = source.fieldMapping || this.getDefaultMapping(source);

    return records.map(record => this.mapper.map(record, mapping));
  }

  /**
   * Validate mapped records
   */
  validate(records: MappedRecord[], entityType: ImportEntityType): BatchValidationResult {
    return this.validator.validateBatch(records, entityType);
  }

  /**
   * Import validated batch to database
   */
  async import(batch: ImportBatch): Promise<ImportSummary> {
    const startTime = performance.now();

    batch.status = 'importing';
    batch.startedAt = new Date();

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const record of batch.records) {
      if (record.status === 'invalid') {
        skippedCount++;
        record.status = 'skipped';
        continue;
      }

      try {
        const result = await this.importRecord(record, batch.entityType);

        if (result.success) {
          record.status = 'imported';
          record.entityId = result.entityId;
          record.action = result.action;

          if (result.action === 'created') {
            createdCount++;
          } else if (result.action === 'updated') {
            updatedCount++;
          }
        } else {
          record.status = 'failed';
          record.errorMessage = result.error;
          failedCount++;
        }
      } catch (error) {
        record.status = 'failed';
        record.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failedCount++;
      }

      batch.processedRecords++;
    }

    batch.successfulRecords = createdCount + updatedCount;
    batch.failedRecords = failedCount;
    batch.skippedRecords = skippedCount;
    batch.status = 'completed';
    batch.completedAt = new Date();

    const processingTime = performance.now() - startTime;

    return {
      totalRecords: batch.totalRecords,
      validRecords: batch.records.filter(r => r.status !== 'invalid').length,
      invalidRecords: batch.records.filter(r => r.status === 'invalid').length,
      createdRecords: createdCount,
      updatedRecords: updatedCount,
      skippedRecords: skippedCount,
      failedRecords: failedCount,
      errorsByField: batch.summary?.errorsByField || {},
      warningsByField: batch.summary?.warningsByField || {},
      processingTimeMs: processingTime,
    };
  }

  /**
   * Import a single record
   * Note: In a real implementation, this would call Prisma to create/update entities
   */
  async importRecord(
    record: ImportRecord,
    entityType: ImportEntityType
  ): Promise<{ success: boolean; entityId?: string; action?: 'created' | 'updated' | 'skipped'; error?: string }> {
    // This is a placeholder implementation
    // In production, you would:
    // 1. Check if entity exists (by email or unique identifier)
    // 2. Create or update the entity using Prisma
    // 3. Return the result

    const mappedData = record.mappedData;
    if (!mappedData) {
      return { success: false, error: 'No mapped data available' };
    }

    // Simulate database operation
    // In real implementation:
    // const prisma = getPrismaClient();
    // const existingEntity = await prisma.therapist.findUnique({ where: { email: mappedData.email }});
    // if (existingEntity) {
    //   await prisma.therapist.update({ where: { id: existingEntity.id }, data: mappedData });
    //   return { success: true, entityId: existingEntity.id, action: 'updated' };
    // } else {
    //   const newEntity = await prisma.therapist.create({ data: mappedData });
    //   return { success: true, entityId: newEntity.id, action: 'created' };
    // }

    // Placeholder: Generate a fake ID
    const entityId = `${entityType}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return {
      success: true,
      entityId,
      action: 'created',
    };
  }

  /**
   * Get batch status
   */
  async getBatchStatus(batchId: string): Promise<ImportBatch | null> {
    // In production, this would fetch from database
    // For now, return null (batch not found)
    return null;
  }

  /**
   * Cancel a running batch
   */
  async cancelBatch(batchId: string): Promise<void> {
    // In production, this would update batch status and stop processing
    console.log(`Cancelling batch: ${batchId}`);
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private getDefaultMapping(source: DataSource): Record<string, string> {
    // Return empty mapping - let field mapper use auto-mapping
    return {};
  }

  private createImportRecords(
    batchId: string,
    rawRecords: RawRecord[],
    mappedRecords: MappedRecord[],
    validationResult: BatchValidationResult
  ): ImportRecord[] {
    return rawRecords.map((raw, index) => {
      const mapped = mappedRecords[index];
      const validation = validationResult.recordResults[index];
      const rowNumber = (raw._rowNumber as number) || index + 1;

      return {
        id: `record_${batchId}_${index}`,
        batchId,
        rowNumber,
        rawData: raw,
        mappedData: mapped,
        status: validation.valid ? 'valid' : 'invalid',
        validationErrors: validation.errors,
        validationWarnings: validation.warnings,
      };
    });
  }

  private countErrorsByField(
    errors: Array<{ field: string }>
  ): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const error of errors) {
      counts[error.field] = (counts[error.field] || 0) + 1;
    }

    return counts;
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createDataIngestionPipeline(): IDataIngestionPipeline {
  return new DataIngestionPipeline();
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Quick validation check for a file before full import
 */
export async function previewImport(
  data: Buffer | string,
  entityType: ImportEntityType,
  options?: {
    delimiter?: string;
    hasHeader?: boolean;
    encoding?: string;
  }
): Promise<{
  valid: boolean;
  columns: string[];
  sampleRows: MappedRecord[];
  errors: string[];
  warnings: string[];
}> {
  const parser = new CsvParser();
  const mapper = new FieldMapper();
  const validator = new RecordValidator();

  const config = {
    fileFormat: 'csv' as const,
    hasHeader: options?.hasHeader !== false,
    delimiter: options?.delimiter || ',',
    encoding: options?.encoding || 'utf-8',
  };

  // Validate format
  const formatResult = await parser.validateFormat(data, config);
  if (!formatResult.valid) {
    return {
      valid: false,
      columns: [],
      sampleRows: [],
      errors: formatResult.errors,
      warnings: [],
    };
  }

  // Map sample rows
  const sampleMapped = (formatResult.sampleRows || []).map(row =>
    mapper.map(row, {})
  );

  // Validate sample rows
  const validationResult = validator.validateBatch(sampleMapped, entityType);

  return {
    valid: validationResult.invalidRecords === 0,
    columns: formatResult.detectedColumns || [],
    sampleRows: sampleMapped,
    errors: validationResult.errors.map(e => e.message),
    warnings: validationResult.warnings.map(w => w.message),
  };
}

/**
 * Get required fields for an entity type
 */
export function getRequiredFields(entityType: ImportEntityType): string[] {
  switch (entityType) {
    case 'therapist':
      return ['email', 'fullName', 'licenseNumber'];
    case 'patient':
      return ['email', 'fullName'];
    case 'organization':
      return ['name', 'type'];
    default:
      return [];
  }
}

/**
 * Get all supported fields for an entity type
 */
export function getSupportedFields(entityType: ImportEntityType): {
  field: string;
  label: string;
  required: boolean;
  type: string;
}[] {
  switch (entityType) {
    case 'therapist':
      return [
        { field: 'email', label: 'Email', required: true, type: 'email' },
        { field: 'fullName', label: 'Full Name', required: true, type: 'string' },
        { field: 'licenseNumber', label: 'License Number', required: true, type: 'string' },
        { field: 'firstName', label: 'First Name', required: false, type: 'string' },
        { field: 'lastName', label: 'Last Name', required: false, type: 'string' },
        { field: 'phone', label: 'Phone', required: false, type: 'phone' },
        { field: 'gender', label: 'Gender', required: false, type: 'enum' },
        { field: 'licenseType', label: 'Type License', required: false, type: 'enum' },
        { field: 'yearsExperience', label: 'years experience', required: false, type: 'number' },
        { field: 'education', label: 'Education', required: false, type: 'array' },
        { field: 'specializations', label: 'Specializations', required: false, type: 'array' },
        { field: 'therapeuticApproaches', label: 'Therapeutic approaches', required: false, type: 'array' },
        { field: 'languages', label: 'Languages', required: false, type: 'array' },
        { field: 'healthFunds', label: 'Health Funds', required: false, type: 'array' },
        { field: 'city', label: 'City', required: false, type: 'string' },
        { field: 'address', label: 'Address', required: false, type: 'string' },
        { field: 'supportsOnline', label: 'Therapy orOnline', required: false, type: 'boolean' },
        { field: 'supportsInPerson', label: 'Therapy In-Person', required: false, type: 'boolean' },
        { field: 'sessionPrice', label: 'Price Session', required: false, type: 'number' },
      ];
    case 'patient':
      return [
        { field: 'email', label: 'Email', required: true, type: 'email' },
        { field: 'fullName', label: 'Full Name', required: true, type: 'string' },
        { field: 'firstName', label: 'First Name', required: false, type: 'string' },
        { field: 'lastName', label: 'Last Name', required: false, type: 'string' },
        { field: 'phone', label: 'Phone', required: false, type: 'phone' },
        { field: 'gender', label: 'Gender', required: false, type: 'enum' },
        { field: 'birthDate', label: 'Date Birth', required: false, type: 'date' },
        { field: 'healthFund', label: 'Health Fund', required: false, type: 'enum' },
        { field: 'preferredCity', label: 'Preferred City', required: false, type: 'string' },
        { field: 'preferredLanguages', label: 'Languages edup toOptions', required: false, type: 'array' },
        { field: 'preferredGender', label: 'Preferred Therapist Gender', required: false, type: 'enum' },
      ];
    case 'organization':
      return [
        { field: 'name', label: 'Name', required: true, type: 'string' },
        { field: 'type', label: 'Type', required: true, type: 'enum' },
        { field: 'code', label: 'Code', required: false, type: 'string' },
        { field: 'contactEmail', label: 'Email', required: false, type: 'email' },
        { field: 'contactPhone', label: 'Phone', required: false, type: 'phone' },
        { field: 'address', label: 'Address', required: false, type: 'string' },
        { field: 'city', label: 'City', required: false, type: 'string' },
      ];
    default:
      return [];
  }
}

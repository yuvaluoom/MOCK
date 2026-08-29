/**
 * MatchMind Data Ingestion - Record Validator
 *
 * Validates imported records against schema requirements
 * and business rules before import.
 */

import type {
  IRecordValidator,
  MappedRecord,
  ImportEntityType,
  ValidationResult,
  BatchValidationResult,
  ValidationError,
  ValidationWarning,
} from '../types';

// =============================================================================
// VALIDATION RULES
// =============================================================================

interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'email' | 'phone' | 'date';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: unknown, record: MappedRecord) => string | null;
  warningIf?: (value: unknown, record: MappedRecord) => string | null;
}

const THERAPIST_VALIDATION_RULES: ValidationRule[] = [
  // Required fields
  {
    field: 'email',
    required: true,
    type: 'email',
  },
  {
    field: 'fullName',
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100,
  },
  {
    field: 'licenseNumber',
    required: true,
    type: 'string',
    pattern: /^[0-9]{4,10}$/,
    custom: (value) => {
      const strValue = String(value);
      if (!/^\d+$/.test(strValue)) {
        return 'License Number Must contain digits only';
      }
      return null;
    },
  },

  // Optional but validated
  {
    field: 'phone',
    type: 'phone',
    warningIf: (value) => {
      if (!value) return 'Recommended to add a phone number';
      return null;
    },
  },
  {
    field: 'yearsExperience',
    type: 'number',
    min: 0,
    max: 60,
  },
  {
    field: 'sessionPrice',
    type: 'number',
    min: 0,
    max: 2000,
    warningIf: (value) => {
      if (typeof value === 'number' && value > 800) {
        return 'Session price is above market average';
      }
      return null;
    },
  },
  {
    field: 'gender',
    enum: ['male', 'female', 'other'],
  },
  {
    field: 'licenseType',
    enum: ['psychologist', 'clinical_psychologist', 'psychotherapist', 'social_worker', 'psychiatrist'],
  },
  {
    field: 'healthFunds',
    type: 'array',
    custom: (value) => {
      if (!Array.isArray(value)) return null;
      const validFunds = ['clalit', 'maccabi', 'meuhedet', 'leumit', 'private'];
      const invalidFunds = value.filter(f =>
        !validFunds.includes(String(f).toLowerCase())
      );
      if (invalidFunds.length > 0) {
        return `Unrecognized health funds: ${invalidFunds.join(', ')}`;
      }
      return null;
    },
  },
  {
    field: 'languages',
    type: 'array',
    warningIf: (value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return 'Recommended to specify languages';
      }
      return null;
    },
  },
  {
    field: 'city',
    type: 'string',
    warningIf: (value) => {
      if (!value) return 'Recommended to specify city';
      return null;
    },
  },
];

const PATIENT_VALIDATION_RULES: ValidationRule[] = [
  {
    field: 'email',
    required: true,
    type: 'email',
  },
  {
    field: 'fullName',
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100,
  },
  {
    field: 'phone',
    type: 'phone',
  },
  {
    field: 'healthFund',
    enum: ['clalit', 'maccabi', 'meuhedet', 'leumit'],
  },
  {
    field: 'gender',
    enum: ['male', 'female', 'other'],
  },
  {
    field: 'birthDate',
    type: 'date',
  },
  {
    field: 'preferredGender',
    enum: ['male', 'female', 'no_preference'],
  },
];

const ORGANIZATION_VALIDATION_RULES: ValidationRule[] = [
  {
    field: 'name',
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 200,
  },
  {
    field: 'type',
    required: true,
    enum: ['health_fund', 'hospital', 'clinic', 'ngo', 'employer', 'military'],
  },
  {
    field: 'contactEmail',
    type: 'email',
  },
  {
    field: 'contactPhone',
    type: 'phone',
  },
];

// =============================================================================
// RECORD VALIDATOR IMPLEMENTATION
// =============================================================================

export class RecordValidator implements IRecordValidator {
  private rulesMap: Record<ImportEntityType, ValidationRule[]> = {
    therapist: THERAPIST_VALIDATION_RULES,
    patient: PATIENT_VALIDATION_RULES,
    organization: ORGANIZATION_VALIDATION_RULES,
  };

  /**
   * Validate a single record
   */
  validate(record: MappedRecord, entityType: ImportEntityType): ValidationResult {
    const rules = this.rulesMap[entityType] || [];
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of rules) {
      const value = record[rule.field];
      const rowNumber = record._rowNumber as number | undefined;

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: rule.field,
          code: 'REQUIRED',
          message: `Required field: ${this.getFieldLabel(rule.field)}`,
          value: rowNumber ? `Row ${rowNumber}` : undefined,
        });
        continue;
      }

      // Skip further validation if empty and not required
      if (value === undefined || value === null || value === '') {
        // Check for warnings on empty optional fields
        if (rule.warningIf) {
          const warning = rule.warningIf(value, record);
          if (warning) {
            warnings.push({
              field: rule.field,
              code: 'SUGGESTED',
              message: warning,
              suggestion: `Consider adding ${this.getFieldLabel(rule.field)}`,
            });
          }
        }
        continue;
      }

      // Type validation
      if (rule.type) {
        const typeError = this.validateType(value, rule.type, rule.field);
        if (typeError) {
          errors.push(typeError);
          continue;
        }
      }

      // String length validation
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push({
            field: rule.field,
            code: 'MIN_LENGTH',
            message: `${this.getFieldLabel(rule.field)} must be at least ${rule.minLength} characters`,
            value,
          });
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push({
            field: rule.field,
            code: 'MAX_LENGTH',
            message: `${this.getFieldLabel(rule.field)} cannot exceed ${rule.maxLength} characters`,
            value,
          });
        }
      }

      // Number range validation
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push({
            field: rule.field,
            code: 'MIN_VALUE',
            message: `${this.getFieldLabel(rule.field)} must be at least ${rule.min}`,
            value,
          });
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push({
            field: rule.field,
            code: 'MAX_VALUE',
            message: `${this.getFieldLabel(rule.field)} cannot exceed ${rule.max}`,
            value,
          });
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          errors.push({
            field: rule.field,
            code: 'PATTERN',
            message: `${this.getFieldLabel(rule.field)} has an invalid format`,
            value,
          });
        }
      }

      // Enum validation
      if (rule.enum) {
        const checkValue = typeof value === 'string' ? value.toLowerCase() : value;
        if (!rule.enum.includes(checkValue as string)) {
          errors.push({
            field: rule.field,
            code: 'ENUM',
            message: `${this.getFieldLabel(rule.field)} must be one of: ${rule.enum.join(', ')}`,
            value,
          });
        }
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value, record);
        if (customError) {
          errors.push({
            field: rule.field,
            code: 'CUSTOM',
            message: customError,
            value,
          });
        }
      }

      // Warnings
      if (rule.warningIf) {
        const warning = rule.warningIf(value, record);
        if (warning) {
          warnings.push({
            field: rule.field,
            code: 'WARNING',
            message: warning,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate a batch of records
   */
  validateBatch(
    records: MappedRecord[],
    entityType: ImportEntityType
  ): BatchValidationResult {
    const recordResults: ValidationResult[] = [];
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    let validCount = 0;
    let invalidCount = 0;

    // Check for duplicate emails
    const emails = new Map<string, number[]>();
    records.forEach((record, index) => {
      const email = record.email as string;
      if (email) {
        const existing = emails.get(email.toLowerCase()) || [];
        existing.push(index + 1);
        emails.set(email.toLowerCase(), existing);
      }
    });

    Array.from(emails.entries()).forEach(([email, rows]) => {
      if (rows.length > 1) {
        allErrors.push({
          field: 'email',
          code: 'DUPLICATE',
          message: `Duplicate email in rows: ${rows.join(', ')}`,
          value: email,
        });
      }
    });

    // Validate each record
    for (const record of records) {
      const result = this.validate(record, entityType);
      recordResults.push(result);

      if (result.valid) {
        validCount++;
      } else {
        invalidCount++;
      }

      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    return {
      totalRecords: records.length,
      validRecords: validCount,
      invalidRecords: invalidCount,
      errors: allErrors,
      warnings: allWarnings,
      recordResults,
    };
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private validateType(
    value: unknown,
    type: ValidationRule['type'],
    field: string
  ): ValidationError | null {
    const fieldLabel = this.getFieldLabel(field);

    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            field,
            code: 'TYPE',
            message: `${fieldLabel} must be text`,
            value,
          };
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return {
            field,
            code: 'TYPE',
            message: `${fieldLabel} must be a number`,
            value,
          };
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            field,
            code: 'TYPE',
            message: `${fieldLabel} must be yes/no`,
            value,
          };
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          return {
            field,
            code: 'TYPE',
            message: `${fieldLabel} must be a list`,
            value,
          };
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          return {
            field,
            code: 'EMAIL',
            message: `${fieldLabel} is not a valid email address`,
            value,
          };
        }
        break;

      case 'phone':
        if (typeof value !== 'string' || !this.isValidPhone(value)) {
          return {
            field,
            code: 'PHONE',
            message: `${fieldLabel} is not a valid phone number`,
            value,
          };
        }
        break;

      case 'date':
        if (!this.isValidDate(value)) {
          return {
            field,
            code: 'DATE',
            message: `${fieldLabel} is not a valid date`,
            value,
          };
        }
        break;
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Israeli phone format: +972 or 0 followed by 9-10 digits
    const phoneRegex = /^(\+972|0)[\d]{8,10}$/;
    const normalized = phone.replace(/[\s\-()]/g, '');
    return phoneRegex.test(normalized);
  }

  private isValidDate(value: unknown): boolean {
    if (typeof value === 'string') {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }
    return false;
  }

  private getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      email: 'Email',
      fullName: 'Full Name',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone',
      gender: 'Gender',
      licenseNumber: 'License Number',
      licenseType: 'Type License',
      yearsExperience: 'years experience',
      sessionPrice: 'Price Session',
      healthFund: 'Health Fund',
      healthFunds: 'Health Funds',
      languages: 'Languages',
      city: 'City',
      address: 'Address',
      specializations: 'Specializations',
      therapeuticApproaches: 'Therapeutic approaches',
      birthDate: 'Date Birth',
      name: 'Name',
      type: 'Type',
      contactEmail: 'Contact Email',
      contactPhone: 'Contact Phone',
    };

    return labels[field] || field;
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createRecordValidator(): IRecordValidator {
  return new RecordValidator();
}

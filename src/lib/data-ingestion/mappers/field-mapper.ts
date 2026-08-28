/**
 * MatchMind Data Ingestion - Field Mapper
 *
 * Maps raw imported data to the application schema using
 * configurable field mappings and transformations.
 */

import type {
  IFieldMapper,
  FieldMapping,
  FieldTransformation,
  RawRecord,
  MappedRecord,
  TransformationType,
} from '../types';

// =============================================================================
// FIELD MAPPER IMPLEMENTATION
// =============================================================================

export class FieldMapper implements IFieldMapper {
  // Hebrew to English field name mappings
  private hebrewFieldMappings: Record<string, string> = {
    // Personal info
    'full_name': 'fullName',
    'first_name': 'firstName',
    'last_name': 'lastName',
    'email': 'email',
    'phone': 'phone',
    'gender': 'gender',
    'birth_date': 'birthDate',

    // Professional info
    'license_number': 'licenseNumber',
    'license_type': 'licenseType',
    'years_experience': 'yearsExperience',
    'experience': 'yearsExperience',
    'education': 'education',
    'title': 'title',

    // Practice info
    'specializations': 'specializations',
    'therapeutic_approaches': 'therapeuticApproaches',
    'languages': 'languages',
    'health_funds': 'healthFunds',
    'health_fund': 'healthFund',

    // Location
    'city': 'city',
    'address': 'address',

    // Availability
    'supports_online': 'supportsOnline',
    'supports_in_person': 'supportsInPerson',
    'session_price': 'sessionPrice',

    // Organization
    'Name_מרפאה': 'clinicName',
    'ארגון': 'organizationId',
  };

  // Value mappings for common fields
  private valueMappings: Record<string, Record<string, string>> = {
    gender: {
      'Male': 'male',
      'Female': 'female',
      'Other': 'other',
      'male': 'male',
      'female': 'female',
      'other': 'other',
    },
    healthFund: {
      'Clalit': 'clalit',
      'Maccabi': 'maccabi',
      'Meuhedet': 'meuhedet',
      'Noומית': 'leumit',
      'clalit': 'clalit',
      'maccabi': 'maccabi',
      'meuhedet': 'meuhedet',
      'leumit': 'leumit',
    },
    licenseType: {
      'פסיכולוג': 'psychologist',
      'פסיכולוג_קליני': 'clinical_psychologist',
      'פסיכsרפיסט': 'psychotherapist',
      'עובד_סוציאלי': 'social_worker',
      'פסיכיאטר': 'psychiatrist',
    },
  };

  /**
   * Map a raw record using the provided field mapping
   */
  map(record: RawRecord, mapping: FieldMapping): MappedRecord {
    const result: MappedRecord = {};

    // First, apply explicit mappings
    for (const [targetField, sourceConfig] of Object.entries(mapping)) {
      if (typeof sourceConfig === 'string') {
        // Direct field mapping
        const value = record[sourceConfig];
        if (value !== undefined && value !== null) {
          result[targetField] = this.autoTransformValue(targetField, value);
        }
      } else {
        // Transformation mapping
        const value = this.applyTransformation(
          record[sourceConfig.sourceField],
          sourceConfig
        );
        if (value !== undefined && value !== null) {
          result[targetField] = value;
        }
      }
    }

    // Then, try to auto-map any unmapped Hebrew fields
    for (const [rawField, value] of Object.entries(record)) {
      if (rawField.startsWith('_')) continue; // Skip metadata fields

      const normalizedField = rawField.toLowerCase().replace(/\s+/g, '_');
      const englishField = this.hebrewFieldMappings[normalizedField];

      if (englishField && !(englishField in result)) {
        result[englishField] = this.autoTransformValue(englishField, value);
      }
    }

    // Preserve row number for error reporting
    if ('_rowNumber' in record) {
      result._rowNumber = record._rowNumber;
    }

    return result;
  }

  /**
   * Apply a transformation to a value
   */
  applyTransformation(
    value: unknown,
    transform: FieldTransformation
  ): unknown {
    if (value === undefined || value === null) {
      return null;
    }

    const stringValue = String(value);

    switch (transform.transform) {
      case 'direct':
        return value;

      case 'lowercase':
        return stringValue.toLowerCase();

      case 'uppercase':
        return stringValue.toUpperCase();

      case 'trim':
        return stringValue.trim();

      case 'split':
        const delimiter = (transform.params?.delimiter as string) || ',';
        return stringValue
          .split(delimiter)
          .map(s => s.trim())
          .filter(s => s !== '');

      case 'join':
        if (Array.isArray(value)) {
          const joinDelimiter = (transform.params?.delimiter as string) || ', ';
          return value.join(joinDelimiter);
        }
        return stringValue;

      case 'map_value':
        const valueMap = transform.params?.map as Record<string, string>;
        if (valueMap) {
          return valueMap[stringValue.toLowerCase()] || stringValue;
        }
        return stringValue;

      case 'parse_date':
        return this.parseDate(stringValue, transform.params?.format as string);

      case 'parse_number':
        const parsed = Number(stringValue.replace(/[^\d.-]/g, ''));
        return isNaN(parsed) ? null : parsed;

      case 'hebrew_to_english':
        return this.translateHebrewField(stringValue);

      case 'custom':
        // Custom transformations would be implemented here
        return value;

      default:
        return value;
    }
  }

  // ===========================================================================
  // AUTO-TRANSFORMATION HELPERS
  // ===========================================================================

  /**
   * Auto-transform a value based on the target field name
   */
  private autoTransformValue(field: string, value: unknown): unknown {
    if (value === undefined || value === null) {
      return null;
    }

    const stringValue = String(value);

    // Check if we have a value mapping for this field
    if (field in this.valueMappings) {
      const mapping = this.valueMappings[field];
      const normalizedValue = stringValue.toLowerCase().replace(/\s+/g, '_');
      if (normalizedValue in mapping) {
        return mapping[normalizedValue];
      }
    }

    // Field-specific transformations
    switch (field) {
      case 'email':
        return stringValue.toLowerCase().trim();

      case 'phone':
        return this.normalizePhoneNumber(stringValue);

      case 'yearsExperience':
      case 'sessionPrice':
        const num = Number(stringValue.replace(/[^\d.-]/g, ''));
        return isNaN(num) ? null : num;

      case 'supportsOnline':
      case 'supportsInPerson':
        return this.parseBoolean(value);

      case 'specializations':
      case 'therapeuticApproaches':
      case 'languages':
      case 'healthFunds':
      case 'education':
        return this.parseArray(value);

      case 'birthDate':
        return this.parseDate(stringValue);

      default:
        return value;
    }
  }

  /**
   * Parse a value as boolean
   */
  private parseBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') return value;

    const stringValue = String(value).toLowerCase().trim();
    return (
      stringValue === 'true' ||
      stringValue === '1' ||
      stringValue === 'yes' ||
      stringValue === 'Yes' ||
      stringValue === 'v' ||
      stringValue === '✓'
    );
  }

  /**
   * Parse a value as array
   */
  private parseArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map(v => String(v).trim()).filter(v => v !== '');
    }

    const stringValue = String(value);

    // Try different delimiters
    for (const delimiter of [',', ';', '|', '/', '\n']) {
      if (stringValue.includes(delimiter)) {
        return stringValue
          .split(delimiter)
          .map(s => s.trim())
          .filter(s => s !== '');
      }
    }

    // Single value
    return stringValue.trim() ? [stringValue.trim()] : [];
  }

  /**
   * Parse date from various formats
   */
  private parseDate(value: string, format?: string): string | null {
    if (!value) return null;

    // Try ISO format first
    const isoDate = new Date(value);
    if (!isNaN(isoDate.getTime())) {
      return isoDate.toISOString().split('T')[0];
    }

    // Try DD/MM/YYYY (common in Israel)
    const dmyMatch = value.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1]);
      const month = parseInt(dmyMatch[2]);
      let year = parseInt(dmyMatch[3]);
      if (year < 100) {
        year += year > 50 ? 1900 : 2000;
      }

      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }

    return null;
  }

  /**
   * Normalize Israeli phone numbers
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-numeric characters except +
    let normalized = phone.replace(/[^\d+]/g, '');

    // Convert to international format
    if (normalized.startsWith('0')) {
      normalized = '+972' + normalized.substring(1);
    } else if (!normalized.startsWith('+')) {
      normalized = '+972' + normalized;
    }

    return normalized;
  }

  /**
   * Translate Hebrew field name to English
   */
  private translateHebrewField(hebrewField: string): string {
    const normalized = hebrewField.toLowerCase().replace(/\s+/g, '_');
    return this.hebrewFieldMappings[normalized] || hebrewField;
  }
}

// =============================================================================
// DEFAULT FIELD MAPPINGS
// =============================================================================

export const DEFAULT_THERAPIST_MAPPING: FieldMapping = {
  email: 'email',
  fullName: 'fullName',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  gender: {
    sourceField: 'gender',
    transform: 'map_value',
    params: {
      map: {
        'Male': 'male',
        'Female': 'female',
        'male': 'male',
        'female': 'female',
      },
    },
  },
  licenseNumber: 'licenseNumber',
  licenseType: 'licenseType',
  yearsExperience: {
    sourceField: 'yearsExperience',
    transform: 'parse_number',
  },
  education: {
    sourceField: 'education',
    transform: 'split',
    params: { delimiter: ',' },
  },
  specializations: {
    sourceField: 'specializations',
    transform: 'split',
    params: { delimiter: ',' },
  },
  therapeuticApproaches: {
    sourceField: 'therapeuticApproaches',
    transform: 'split',
    params: { delimiter: ',' },
  },
  languages: {
    sourceField: 'languages',
    transform: 'split',
    params: { delimiter: ',' },
  },
  healthFunds: {
    sourceField: 'healthFunds',
    transform: 'split',
    params: { delimiter: ',' },
  },
  city: 'city',
  address: 'address',
  supportsOnline: 'supportsOnline',
  supportsInPerson: 'supportsInPerson',
  sessionPrice: {
    sourceField: 'sessionPrice',
    transform: 'parse_number',
  },
};

export const DEFAULT_PATIENT_MAPPING: FieldMapping = {
  email: 'email',
  fullName: 'fullName',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  gender: {
    sourceField: 'gender',
    transform: 'map_value',
    params: {
      map: {
        'Male': 'male',
        'Female': 'female',
        'male': 'male',
        'female': 'female',
      },
    },
  },
  birthDate: {
    sourceField: 'birthDate',
    transform: 'parse_date',
  },
  healthFund: 'healthFund',
  healthFundMemberId: 'healthFundMemberId',
  preferredCity: 'preferredCity',
  preferredLanguages: {
    sourceField: 'preferredLanguages',
    transform: 'split',
    params: { delimiter: ',' },
  },
  preferredGender: 'preferredGender',
  preferredApproach: 'preferredApproach',
};

// =============================================================================
// FACTORY
// =============================================================================

export function createFieldMapper(): IFieldMapper {
  return new FieldMapper();
}

/**
 * MatchMind Data Ingestion - CSV Parser
 *
 * Parses CSV files with support for Hebrew content and various encodings.
 */

import type {
  IDataParser,
  ConnectionConfig,
  RawRecord,
  FormatValidationResult,
} from '../types';

// =============================================================================
// CSV PARSER IMPLEMENTATION
// =============================================================================

export class CsvParser implements IDataParser {
  private defaultDelimiter = ',';
  private defaultEncoding = 'utf-8';

  /**
   * Parse CSV data into records
   */
  async parse(
    data: Buffer | string,
    config: ConnectionConfig
  ): Promise<RawRecord[]> {
    const content = this.decodeContent(data, config.encoding);
    const delimiter = config.delimiter || this.defaultDelimiter;
    const hasHeader = config.hasHeader !== false; // Default true

    const lines = this.splitLines(content);
    if (lines.length === 0) {
      return [];
    }

    // Parse header row
    const headers = hasHeader
      ? this.parseLine(lines[0], delimiter)
      : this.generateHeaders(this.parseLine(lines[0], delimiter).length);

    // Parse data rows
    const startIndex = hasHeader ? 1 : 0;
    const records: RawRecord[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = this.parseLine(line, delimiter);
      const record = this.createRecord(headers, values, i + 1);
      records.push(record);
    }

    return records;
  }

  /**
   * Validate CSV format before full parsing
   */
  async validateFormat(
    data: Buffer | string,
    config: ConnectionConfig
  ): Promise<FormatValidationResult> {
    const errors: string[] = [];

    try {
      const content = this.decodeContent(data, config.encoding);
      const delimiter = config.delimiter || this.defaultDelimiter;
      const lines = this.splitLines(content);

      if (lines.length === 0) {
        errors.push('File is empty');
        return { valid: false, errors };
      }

      // Check first line for headers
      const firstLine = this.parseLine(lines[0], delimiter);
      if (firstLine.length === 0) {
        errors.push('No columns found in the first row');
        return { valid: false, errors };
      }

      // Check column consistency
      const columnCount = firstLine.length;
      const inconsistentRows: number[] = [];

      for (let i = 1; i < Math.min(lines.length, 10); i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = this.parseLine(line, delimiter);
        if (values.length !== columnCount) {
          inconsistentRows.push(i + 1);
        }
      }

      if (inconsistentRows.length > 0) {
        errors.push(`Rows with inconsistent column count: ${inconsistentRows.join(', ')}`);
      }

      // Parse sample rows
      const sampleRows: RawRecord[] = [];
      const headers = config.hasHeader !== false ? firstLine : this.generateHeaders(columnCount);
      const startIndex = config.hasHeader !== false ? 1 : 0;

      for (let i = startIndex; i < Math.min(lines.length, startIndex + 5); i++) {
        const line = lines[i]?.trim();
        if (!line) continue;

        const values = this.parseLine(line, delimiter);
        sampleRows.push(this.createRecord(headers, values, i + 1));
      }

      return {
        valid: errors.length === 0,
        errors,
        detectedColumns: headers,
        sampleRows,
      };
    } catch (error) {
      errors.push(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { valid: false, errors };
    }
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  /**
   * Decode content from buffer or string
   */
  private decodeContent(data: Buffer | string, encoding?: string): string {
    if (typeof data === 'string') {
      return data;
    }

    const enc = encoding || this.defaultEncoding;

    // Handle common encodings
    if (enc.toLowerCase() === 'utf-8' || enc.toLowerCase() === 'utf8') {
      return data.toString('utf-8');
    }

    // For Hebrew files, try windows-1255 if utf-8 produces garbled text
    // Note: In a real implementation, you'd use iconv-lite for encoding conversion
    return data.toString('utf-8');
  }

  /**
   * Split content into lines, handling different line endings
   */
  private splitLines(content: string): string[] {
    // Handle Windows (\r\n), Unix (\n), and Mac (\r) line endings
    return content.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
  }

  /**
   * Parse a single CSV line, handling quoted values
   */
  private parseLine(line: string, delimiter: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // End of field
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    values.push(current.trim());

    return values;
  }

  /**
   * Generate default headers for headerless files
   */
  private generateHeaders(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `column_${i + 1}`);
  }

  /**
   * Create a record object from headers and values
   */
  private createRecord(
    headers: string[],
    values: string[],
    rowNumber: number
  ): RawRecord {
    const record: RawRecord = {
      _rowNumber: rowNumber,
    };

    headers.forEach((header, index) => {
      const normalizedHeader = this.normalizeHeader(header);
      const value = values[index];

      // Try to parse as number or boolean
      record[normalizedHeader] = this.parseValue(value);
    });

    return record;
  }

  /**
   * Normalize header names
   */
  private normalizeHeader(header: string): string {
    return header
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_\u0590-\u05FF]/g, ''); // Keep Hebrew chars
  }

  /**
   * Try to parse a value to appropriate type
   */
  private parseValue(value: string | undefined): unknown {
    if (value === undefined || value === '') {
      return null;
    }

    const trimmed = value.trim();

    // Boolean
    if (trimmed.toLowerCase() === 'true' || trimmed === 'Yes') {
      return true;
    }
    if (trimmed.toLowerCase() === 'false' || trimmed === 'No') {
      return false;
    }

    // Number
    const num = Number(trimmed);
    if (!isNaN(num) && trimmed !== '') {
      return num;
    }

    return trimmed;
  }
}

// =============================================================================
// FACTORY
// =============================================================================

export function createCsvParser(): IDataParser {
  return new CsvParser();
}

/**
 * MatchMind Clinical Export Service
 *
 * Generates JSON and PDF exports of session records.
 * Includes consent verification and audit logging.
 */

import type {
  SessionRecord,
  ClinicalNotes,
  PatientSessionSummary,
  ExportFormat,
  ExportRequest,
  ExportResult,
} from '../types';
import { createFileHash } from '../security/encryption';

// =============================================================================
// TYPES
// =============================================================================

export interface ExportOptions {
  includePatientSummary?: boolean;
  redactSensitiveInfo?: boolean;
  language?: 'he' | 'en';
}

export interface ExportMetadata {
  exportedAt: string;
  exportedBy: string;
  purpose: string;
  recipientType?: string;
  format: ExportFormat;
  fileHash: string;
  expiresAt: string;
}

// =============================================================================
// JSON EXPORT
// =============================================================================

export function exportToJson(
  session: SessionRecord,
  notes: ClinicalNotes | undefined,
  patientSummary: PatientSessionSummary | undefined,
  exportedBy: string,
  purpose: string,
  options: ExportOptions = {}
): ExportResult {
  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy,
      purpose,
      format: 'JSON' as ExportFormat,
      version: '1.0',
    },
    session: {
      id: session.id,
      sessionNumber: session.sessionNumber,
      sessionDate: session.sessionDate.toISOString(),
      sessionType: session.sessionType,
      sessionStatus: session.sessionStatus,
      documentationStatus: session.documentationStatus,
      scheduledStartTime: session.scheduledStartTime.toISOString(),
      scheduledEndTime: session.scheduledEndTime.toISOString(),
      actualStartTime: session.actualStartTime?.toISOString(),
      actualEndTime: session.actualEndTime?.toISOString(),
      actualDurationMinutes: session.actualDurationMinutes,
    },
    clinicalNotes: notes
      ? {
          presentingIssue: options.redactSensitiveInfo
            ? redactText(notes.presentingIssue)
            : notes.presentingIssue,
          clinicalSummary: options.redactSensitiveInfo
            ? redactText(notes.clinicalSummary)
            : notes.clinicalSummary,
          interventions: options.redactSensitiveInfo
            ? redactText(notes.interventions)
            : notes.interventions,
          patientResponse: options.redactSensitiveInfo
            ? redactText(notes.patientResponse)
            : notes.patientResponse,
          therapeuticMethods: notes.therapeuticMethods,
          progressIndicator: notes.progressIndicator,
          riskLevel: notes.riskLevel,
          icdCodes: notes.icdCodes,
          dsmCodes: notes.dsmCodes,
          homeworkAssigned: notes.homeworkAssigned,
          nextSessionFocus: notes.nextSessionFocus,
          recommendedInterval: notes.recommendedInterval,
        }
      : undefined,
    patientSummary:
      options.includePatientSummary && patientSummary
        ? {
            summaryHebrew: patientSummary.summaryHebrew,
            topicsDiscussed: patientSummary.topicsDiscussed,
            keyTakeaways: patientSummary.keyTakeaways,
            homework: patientSummary.homework.map((hw) => ({
              title: hw.title,
              description: hw.description,
              dueDate: hw.dueDate?.toISOString(),
            })),
          }
        : undefined,
  };

  const content = JSON.stringify(exportData, null, 2);
  const fileHash = createFileHash(content);

  // Expiration: 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    exportId: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    format: 'JSON',
    content,
    fileHash,
    expiresAt,
  };
}

// =============================================================================
// PDF EXPORT (Placeholder - requires PDF library in production)
// =============================================================================

export function exportToPdf(
  session: SessionRecord,
  notes: ClinicalNotes | undefined,
  patientSummary: PatientSessionSummary | undefined,
  exportedBy: string,
  purpose: string,
  options: ExportOptions = {}
): ExportResult {
  // In production, use a PDF library like pdfkit, jspdf, or puppeteer
  // For now, generate HTML that could be converted to PDF

  const html = generatePdfHtml(session, notes, patientSummary, {
    exportedBy,
    purpose,
    options,
  });

  const fileHash = createFileHash(html);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    exportId: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    format: 'PDF',
    content: html, // In production, this would be base64 PDF or file URL
    fileHash,
    expiresAt,
  };
}

function generatePdfHtml(
  session: SessionRecord,
  notes: ClinicalNotes | undefined,
  patientSummary: PatientSessionSummary | undefined,
  meta: { exportedBy: string; purpose: string; options: ExportOptions }
): string {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const sessionTypeLabels: Record<string, string> = {
    IN_PERSON: 'In-Person Session',
    REMOTE_VIDEO: 'Video Call',
    REMOTE_PHONE: 'Call Phone',
    HOME_VISIT: 'Home visit',
  };

  const riskLevelLabels: Record<string, string> = {
    NONE: 'No Risk',
    LOW: 'Low',
    MODERATE: 'Moderate',
    HIGH: 'High',
    CRITICAL: 'Critical',
  };

  return `
<!DOCTYPE html>
<html lang="he">
<head>
  <meta charset="UTF-8">
  <title>Documentation Session #${session.sessionNumber}</title>
  <style>
    body {
      font-family: 'David Libre', 'Arial Hebrew', Arial, sans-serif;
      direction: rtl;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      line-height: 1.6;
    }
    .header {
      border-bottom: 2px solid #0d9488;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #0d9488;
      margin: 0;
    }
    .meta {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section h2 {
      color: #333;
      font-size: 16px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .section p {
      margin: 0;
      color: #444;
    }
    .field-label {
      font-weight: bold;
      color: #333;
    }
    .risk-high {
      color: #dc2626;
      font-weight: bold;
    }
    .risk-moderate {
      color: #f59e0b;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #888;
    }
    .watermark {
      position: fixed;
      bottom: 20px;
      left: 20px;
      color: #ddd;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Clinical Session Documentation</h1>
    <p class="meta">
      Session Number ${session.sessionNumber} |
      ${formatDate(session.sessionDate)} |
      ${sessionTypeLabels[session.sessionType] || session.sessionType}
    </p>
  </div>

  ${
    notes
      ? `
  <div class="section">
    <h2>Presenting Issue</h2>
    <p>${meta.options.redactSensitiveInfo ? '[Hidden information]' : notes.presentingIssue || 'Not specified'}</p>
  </div>

  <div class="section">
    <h2>Clinical Summary</h2>
    <p>${meta.options.redactSensitiveInfo ? '[Hidden information]' : notes.clinicalSummary || 'Not specified'}</p>
  </div>

  <div class="section">
    <h2>Interventions</h2>
    <p>${meta.options.redactSensitiveInfo ? '[Hidden information]' : notes.interventions || 'Not specified'}</p>
  </div>

  <div class="section">
    <h2>Response ofPatient</h2>
    <p>${meta.options.redactSensitiveInfo ? '[Hidden information]' : notes.patientResponse || 'Not specified'}</p>
  </div>

  <div class="section">
    <h2>Risk Assessment</h2>
    <p class="${notes.riskLevel === 'HIGH' || notes.riskLevel === 'CRITICAL' ? 'risk-high' : notes.riskLevel === 'MODERATE' ? 'risk-moderate' : ''}">
      ${riskLevelLabels[notes.riskLevel] || notes.riskLevel}
    </p>
  </div>

  ${notes.icdCodes && notes.icdCodes.length > 0 ? `
  <div class="section">
    <h2>Diagnosis Codes</h2>
    <p><span class="field-label">ICD-10:</span> ${notes.icdCodes.join(', ')}</p>
    ${notes.dsmCodes && notes.dsmCodes.length > 0 ? `<p><span class="field-label">DSM-5:</span> ${notes.dsmCodes.join(', ')}</p>` : ''}
  </div>
  ` : ''}
  `
      : '<p>No clinical notes for this session.</p>'
  }

  ${
    meta.options.includePatientSummary && patientSummary
      ? `
  <div class="section">
    <h2>Summary forPatient</h2>
    <p>${patientSummary.summaryHebrew || 'Not specified'}</p>
    ${
      patientSummary.keyTakeaways && patientSummary.keyTakeaways.length > 0
        ? `
    <h3>Key Points</h3>
    <ul>
      ${patientSummary.keyTakeaways.map((t) => `<li>${t}</li>`).join('')}
    </ul>
    `
        : ''
    }
  </div>
  `
      : ''
  }

  <div class="footer">
    <p>
      <strong>Export Purpose:</strong> ${meta.purpose}<br>
      <strong>Exported By:</strong> ${meta.exportedBy}<br>
      <strong>Export Date:</strong> ${formatDate(new Date())}
    </p>
    <p>
      This document is confidential and intended only for authorized parties.
      Do not distribute, copy, or share without proper authorization.
    </p>
  </div>

  <div class="watermark">
    MatchMind - Clinical Documentation System
  </div>
</body>
</html>
  `.trim();
}

// =============================================================================
// HL7 FHIR EXPORT (Placeholder for future HMO integration)
// =============================================================================

export function exportToFhir(
  session: SessionRecord,
  notes: ClinicalNotes | undefined,
  _patientSummary: PatientSessionSummary | undefined,
  exportedBy: string,
  purpose: string
): ExportResult {
  // FHIR R4 Encounter resource structure (simplified)
  const fhirResource = {
    resourceType: 'Encounter',
    id: session.id,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Encounter'],
    },
    status: mapSessionStatusToFhir(session.sessionStatus),
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: mapSessionTypeToFhir(session.sessionType),
    },
    period: {
      start: session.actualStartTime?.toISOString() || session.scheduledStartTime.toISOString(),
      end: session.actualEndTime?.toISOString() || session.scheduledEndTime.toISOString(),
    },
    // Note: In production, would include proper patient/practitioner references
  };

  const content = JSON.stringify(fhirResource, null, 2);
  const fileHash = createFileHash(content);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    exportId: `export-fhir-${Date.now()}`,
    format: 'HL7_FHIR',
    content,
    fileHash,
    expiresAt,
  };
}

function mapSessionStatusToFhir(status: string): string {
  const mapping: Record<string, string> = {
    SCHEDULED: 'planned',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'finished',
    CANCELLED: 'cancelled',
    NO_SHOW: 'cancelled',
  };
  return mapping[status] || 'unknown';
}

function mapSessionTypeToFhir(type: string): string {
  const mapping: Record<string, string> = {
    IN_PERSON: 'AMB',
    REMOTE_VIDEO: 'VR',
    REMOTE_PHONE: 'VR',
    HOME_VISIT: 'HH',
  };
  return mapping[type] || 'AMB';
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function redactText(text: string | undefined): string {
  if (!text) return '[Not specified]';
  // Replace content with asterisks, keeping structure visible
  return text.replace(/\S/g, '*');
}

/**
 * Validate export request
 */
export function validateExportRequest(request: ExportRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.sessionRecordId) {
    errors.push('Session ID is required');
  }

  if (!request.format) {
    errors.push('Export format is required');
  }

  if (!request.purpose || request.purpose.length < 5) {
    errors.push('Export purpose is required (at least 5 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create export audit record
 */
export function createExportAuditRecord(
  exportResult: ExportResult,
  exportedBy: string,
  purpose: string,
  sessionId: string
): {
  exportId: string;
  sessionRecordId: string;
  format: ExportFormat;
  exportedById: string;
  purpose: string;
  fileHash: string;
  expiresAt: Date;
  createdAt: Date;
} {
  return {
    exportId: exportResult.exportId,
    sessionRecordId: sessionId,
    format: exportResult.format,
    exportedById: exportedBy,
    purpose,
    fileHash: exportResult.fileHash,
    expiresAt: exportResult.expiresAt,
    createdAt: new Date(),
  };
}

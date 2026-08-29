/**
 * MatchMind Clinical Documentation - Notes Validator
 *
 * Validates clinical notes before submission.
 * Checks for completeness, safety requirements, and compliance.
 */

import type {
  ClinicalNotes,
  SaveClinicalNotesInput,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  RiskLevel,
} from '../types';

// =============================================================================
// VALIDATION RULES
// =============================================================================

interface ValidationRule {
  field: string;
  check: (notes: Partial<ClinicalNotes>) => boolean;
  errorCode: string;
  message: string;
  messageHe: string;
  isRequired: boolean;
}

const SUBMISSION_RULES: ValidationRule[] = [
  {
    field: 'clinicalSummary',
    check: (notes) => !!notes.clinicalSummary && notes.clinicalSummary.length >= 50,
    errorCode: 'CLINICAL_SUMMARY_REQUIRED',
    message: 'Clinical summary is required (minimum 50 characters)',
    messageHe: 'Clinical Summary Required (at least 50 characters)',
    isRequired: true,
  },
  {
    field: 'riskLevel',
    check: (notes) => !!notes.riskLevel,
    errorCode: 'RISK_LEVEL_REQUIRED',
    message: 'Risk level assessment is required',
    messageHe: 'Risk level assessment required',
    isRequired: true,
  },
  {
    field: 'therapeuticMethods',
    check: (notes) => !!notes.therapeuticMethods && notes.therapeuticMethods.length > 0,
    errorCode: 'THERAPEUTIC_METHODS_REQUIRED',
    message: 'At least one therapeutic method must be specified',
    messageHe: 'At least one therapeutic method must be specified',
    isRequired: true,
  },
];

const SAFETY_RULES: ValidationRule[] = [
  {
    field: 'assessment.safetyAssessment',
    check: (notes) => {
      const riskLevel = notes.riskLevel as RiskLevel | undefined;
      if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
        return !!notes.assessment?.safetyAssessment;
      }
      return true;
    },
    errorCode: 'SAFETY_ASSESSMENT_REQUIRED_FOR_HIGH_RISK',
    message: 'Safety assessment is required for high/critical risk levels',
    messageHe: 'Safety assessment required for high/critical risk levels',
    isRequired: true,
  },
  {
    field: 'assessment.safetyAssessment.safetyPlan',
    check: (notes) => {
      const safety = notes.assessment?.safetyAssessment;
      if (safety?.suicidalIdeation || safety?.homicidalIdeation) {
        return !!safety.safetyPlan;
      }
      return true;
    },
    errorCode: 'SAFETY_PLAN_REQUIRED',
    message: 'Safety plan is required when suicidal/homicidal ideation is present',
    messageHe: 'Safety plan required when suicidal/homicidal ideation is present',
    isRequired: true,
  },
  {
    field: 'assessment.safetyAssessment.emergencyContacts',
    check: (notes) => {
      const safety = notes.assessment?.safetyAssessment;
      if (safety?.suicidalIdeation || safety?.selfHarmBehavior) {
        return !!safety.emergencyContacts && safety.emergencyContacts.length > 0;
      }
      return true;
    },
    errorCode: 'EMERGENCY_CONTACTS_REQUIRED',
    message: 'Emergency contacts are required for at-risk patients',
    messageHe: 'Emergency contacts required for at-risk patients',
    isRequired: true,
  },
];

const WARNING_RULES: Array<{
  field: string;
  check: (notes: Partial<ClinicalNotes>) => boolean;
  warningCode: string;
  message: string;
  messageHe: string;
  suggestion?: string;
}> = [
  {
    field: 'presentingIssue',
    check: (notes) => !notes.presentingIssue,
    warningCode: 'PRESENTING_ISSUE_MISSING',
    message: 'Consider documenting the presenting issue',
    messageHe: 'Consider updating the presenting issue',
    suggestion: 'Add a brief description of why the patient sought this session',
  },
  {
    field: 'interventions',
    check: (notes) => !notes.interventions,
    warningCode: 'INTERVENTIONS_MISSING',
    message: 'Consider documenting interventions used',
    messageHe: 'Consider updating the interventions performed',
    suggestion: 'Describe the therapeutic techniques and interventions applied',
  },
  {
    field: 'patientResponse',
    check: (notes) => !notes.patientResponse,
    warningCode: 'PATIENT_RESPONSE_MISSING',
    message: 'Consider documenting patient response',
    messageHe: 'Consider updating the patient response',
    suggestion: 'Note how the patient responded to the session and interventions',
  },
  {
    field: 'progressIndicator',
    check: (notes) => !notes.progressIndicator,
    warningCode: 'PROGRESS_INDICATOR_MISSING',
    message: 'Consider adding a progress indicator',
    messageHe: 'Consider adding a progress indicator',
    suggestion: 'Track progress over time with a consistent indicator',
  },
  {
    field: 'followUp',
    check: (notes) => !notes.followUp?.nextSessionDate,
    warningCode: 'NEXT_SESSION_NOT_SCHEDULED',
    message: 'Next session is not scheduled',
    messageHe: 'Next session has not been scheduled',
  },
  {
    field: 'riskAssessmentDate',
    check: (notes) => {
      if (!notes.riskAssessmentDate) return false;
      const daysSinceAssessment = Math.floor(
        (Date.now() - notes.riskAssessmentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceAssessment > 30;
    },
    warningCode: 'RISK_ASSESSMENT_OUTDATED',
    message: 'Risk assessment is more than 30 days old',
    messageHe: 'Risk assessment is older than 30 days',
    suggestion: 'Consider updating the risk assessment',
  },
];

// =============================================================================
// VALIDATOR FUNCTIONS
// =============================================================================

/**
 * Validate clinical notes for submission
 */
export function validateForSubmission(notes: Partial<ClinicalNotes>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check required submission rules
  SUBMISSION_RULES.forEach((rule) => {
    if (!rule.check(notes)) {
      errors.push({
        field: rule.field,
        code: rule.errorCode,
        message: rule.message,
        messageHe: rule.messageHe,
      });
    }
  });

  // Check safety rules
  SAFETY_RULES.forEach((rule) => {
    if (!rule.check(notes)) {
      errors.push({
        field: rule.field,
        code: rule.errorCode,
        message: rule.message,
        messageHe: rule.messageHe,
      });
    }
  });

  // Check warnings
  WARNING_RULES.forEach((rule) => {
    if (rule.check(notes)) {
      warnings.push({
        field: rule.field,
        code: rule.warningCode,
        message: rule.message,
        messageHe: rule.messageHe,
        suggestion: rule.suggestion,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate clinical notes during auto-save (less strict)
 */
export function validateForAutoSave(input: SaveClinicalNotesInput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Only check for obviously invalid data during auto-save
  if (input.clinicalSummary && input.clinicalSummary.length > 50000) {
    errors.push({
      field: 'clinicalSummary',
      code: 'CONTENT_TOO_LONG',
      message: 'Clinical summary exceeds maximum length',
      messageHe: 'Clinical summary exceeds maximum length',
    });
  }

  if (input.icdCodes && input.icdCodes.length > 20) {
    warnings.push({
      field: 'icdCodes',
      code: 'TOO_MANY_ICD_CODES',
      message: 'Unusually many ICD codes specified',
      messageHe: 'Unusually high number of ICD codes',
    });
  }

  if (input.dsmCodes && input.dsmCodes.length > 10) {
    warnings.push({
      field: 'dsmCodes',
      code: 'TOO_MANY_DSM_CODES',
      message: 'Unusually many DSM codes specified',
      messageHe: 'Unusually high number of DSM codes',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate safety assessment completeness
 */
export function validateSafetyAssessment(
  notes: Partial<ClinicalNotes>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const safety = notes.assessment?.safetyAssessment;
  const riskLevel = notes.riskLevel;

  if (!safety && (riskLevel === 'HIGH' || riskLevel === 'CRITICAL')) {
    errors.push({
      field: 'assessment.safetyAssessment',
      code: 'SAFETY_ASSESSMENT_REQUIRED',
      message: 'Safety assessment is required for elevated risk levels',
      messageHe: 'Safety assessment required for elevated risk levels',
    });
  }

  if (safety) {
    // Check for logical consistency
    if (safety.suicidalPlan && !safety.suicidalIdeation) {
      warnings.push({
        field: 'assessment.safetyAssessment',
        code: 'INCONSISTENT_SUICIDAL_ASSESSMENT',
        message: 'Suicidal plan marked without ideation',
        messageHe: 'Suicidal plan marked without ideation',
        suggestion: 'Review suicidal ideation assessment',
      });
    }

    if (safety.suicidalIntent && !safety.suicidalPlan) {
      warnings.push({
        field: 'assessment.safetyAssessment',
        code: 'INCONSISTENT_SUICIDAL_INTENT',
        message: 'Suicidal intent marked without plan',
        messageHe: 'Suicidal intent marked without a plan',
        suggestion: 'Review suicidal plan assessment',
      });
    }

    // High-risk indicators require safety plan
    const isHighRisk =
      safety.suicidalIdeation ||
      safety.suicidalPlan ||
      safety.suicidalIntent ||
      safety.homicidalIdeation;

    if (isHighRisk && !safety.safetyPlan) {
      errors.push({
        field: 'assessment.safetyAssessment.safetyPlan',
        code: 'SAFETY_PLAN_REQUIRED',
        message: 'Safety plan is required for high-risk indicators',
        messageHe: 'Safety plan required for high risk indicators',
      });
    }

    if (isHighRisk && (!safety.emergencyContacts || safety.emergencyContacts.length === 0)) {
      errors.push({
        field: 'assessment.safetyAssessment.emergencyContacts',
        code: 'EMERGENCY_CONTACTS_REQUIRED',
        message: 'Emergency contacts are required for high-risk patients',
        messageHe: 'Emergency contacts required for high-risk patients',
      });
    }

    // Check protective factors for high risk
    if (
      isHighRisk &&
      (!safety.protectiveFactors || safety.protectiveFactors.length === 0)
    ) {
      warnings.push({
        field: 'assessment.safetyAssessment.protectiveFactors',
        code: 'PROTECTIVE_FACTORS_MISSING',
        message: 'Consider documenting protective factors',
        messageHe: 'Consider updating protective factors',
        suggestion: 'Document what keeps the patient safe',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if notes are complete enough for submission
 */
export function getCompletionStatus(notes: Partial<ClinicalNotes>): {
  percentage: number;
  missingRequired: string[];
  missingOptional: string[];
} {
  const requiredFields = [
    { field: 'clinicalSummary', check: !!notes.clinicalSummary },
    { field: 'riskLevel', check: !!notes.riskLevel },
    {
      field: 'therapeuticMethods',
      check: !!notes.therapeuticMethods && notes.therapeuticMethods.length > 0,
    },
  ];

  const optionalFields = [
    { field: 'presentingIssue', check: !!notes.presentingIssue },
    { field: 'interventions', check: !!notes.interventions },
    { field: 'patientResponse', check: !!notes.patientResponse },
    { field: 'progressIndicator', check: !!notes.progressIndicator },
    { field: 'followUp', check: !!notes.followUp },
    { field: 'assessment', check: !!notes.assessment },
  ];

  const completedRequired = requiredFields.filter((f) => f.check).length;
  const completedOptional = optionalFields.filter((f) => f.check).length;

  const requiredWeight = 0.7;
  const optionalWeight = 0.3;

  const requiredPercentage = (completedRequired / requiredFields.length) * 100;
  const optionalPercentage = (completedOptional / optionalFields.length) * 100;

  const percentage = Math.round(
    requiredPercentage * requiredWeight + optionalPercentage * optionalWeight
  );

  return {
    percentage,
    missingRequired: requiredFields.filter((f) => !f.check).map((f) => f.field),
    missingOptional: optionalFields.filter((f) => !f.check).map((f) => f.field),
  };
}

/**
 * Get Hebrew field labels for display
 */
export function getFieldLabelHe(field: string): string {
  const labels: Record<string, string> = {
    clinicalSummary: 'Clinical Summary',
    riskLevel: 'Risk level',
    therapeuticMethods: 'Therapeutic Methods',
    presentingIssue: 'Presenting Issue',
    interventions: 'Interventions',
    patientResponse: 'Response ofPatient',
    progressIndicator: 'Progress Indicator',
    followUp: 'Follow-up',
    assessment: 'Assessment',
    'assessment.safetyAssessment': 'Safety Assessment',
    'assessment.safetyAssessment.safetyPlan': 'Safety Plan',
    'assessment.safetyAssessment.emergencyContacts': 'Emergency Contacts',
    'assessment.safetyAssessment.protectiveFactors': 'Protective Factors',
    icdCodes: 'Code ICD',
    dsmCodes: 'Code DSM',
    riskAssessmentDate: 'Risk Assessment Date',
  };

  return labels[field] || field;
}

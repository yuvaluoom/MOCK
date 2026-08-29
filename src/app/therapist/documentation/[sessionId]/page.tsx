'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lock,
  Download,
  Share2,
  Clock,
} from 'lucide-react';
import { ClinicalNotesForm } from '@/components/clinical/ClinicalNotesForm';
import { SafetyAssessmentForm } from '@/components/clinical/SafetyAssessmentForm';
import { PatientSummaryForm } from '@/components/clinical/PatientSummaryForm';
import type { ClinicalNotes, RiskLevel, DocumentationStatus } from '@/lib/clinical/types';

type FormSection = 'notes' | 'safety' | 'summary';

interface SessionInfo {
  id: string;
  patientName: string;
  patientId: string;
  sessionNumber: number;
  sessionDate: string;
  sessionType: string;
  documentationStatus: DocumentationStatus;
  isOverdue: boolean;
  deadline: string;
  currentVersion: number;
}

export default function SessionDocumentationPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [activeSection, setActiveSection] = useState<FormSection>('notes');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Mock session data - replace with tRPC
  const sessionInfo: SessionInfo = {
    id: sessionId,
    patientName: 'Israel Israeli',
    patientId: 'patient-1',
    sessionNumber: 5,
    sessionDate: '2024-02-06',
    sessionType: 'IN_PERSON',
    documentationStatus: 'DRAFT',
    isOverdue: false,
    deadline: '2024-02-08',
    currentVersion: 1,
  };

  // Mock clinical notes - replace with tRPC
  const [clinicalNotes, setClinicalNotes] = useState<Partial<ClinicalNotes>>({
    presentingIssue: '',
    clinicalSummary: '',
    interventions: '',
    patientResponse: '',
    therapeuticMethods: [],
    riskLevel: 'NONE',
    icdCodes: [],
    dsmCodes: [],
    homeworkAssigned: false,
  });

  const completionPercentage = calculateCompletionPercentage(clinicalNotes);
  const isReadOnly = sessionInfo.documentationStatus === 'LOCKED' ||
                     sessionInfo.documentationStatus === 'SUBMITTED';

  // Auto-save handler
  const handleAutoSave = useCallback(async (notes: Partial<ClinicalNotes>) => {
    if (isReadOnly) return;

    setIsSaving(true);
    try {
      // TODO: Call tRPC mutation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isReadOnly]);

  const handleNotesChange = (updates: Partial<ClinicalNotes>) => {
    setClinicalNotes(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async () => {
    if (completionPercentage < 100) {
      alert('Please complete all required fields before submitting');
      return;
    }

    setShowSubmitConfirm(false);
    setIsSaving(true);

    try {
      // TODO: Call tRPC mutation
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/therapist/documentation');
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    // TODO: Implement export
    alert('Documentation export coming soon');
  };

  const sections = [
    { id: 'notes' as FormSection, label: 'Clinical notes', icon: '📝' },
    { id: 'safety' as FormSection, label: 'Safety Assessment', icon: '🛡️' },
    { id: 'summary' as FormSection, label: 'Patient Summary', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/therapist/documentation')}
              >
                <ArrowRight className="w-4 h-4 ml-1" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-200" />
              <div>
                <h1 className="font-semibold text-gray-900">
                  {sessionInfo.patientName} - Session #{sessionInfo.sessionNumber}
                </h1>
                <p className="text-xs text-gray-500">
                  {new Date(sessionInfo.sessionDate).toLocaleDateString('en-US')} •
                  {sessionInfo.sessionType === 'IN_PERSON' ? ' In-Person' : ' Online'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Save Status */}
              <div className="flex items-center gap-2 text-sm">
                {isSaving ? (
                  <span className="text-gray-500 flex items-center gap-1">
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Saved {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : hasUnsavedChanges ? (
                  <span className="text-yellow-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Unsaved changes
                  </span>
                ) : null}
              </div>

              {/* Completion Indicator */}
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      completionPercentage === 100 ? 'bg-green-500' : 'bg-calm-500'
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{completionPercentage}%</span>
              </div>

              {/* Status Badge */}
              {getStatusBadge(sessionInfo.documentationStatus, sessionInfo.isOverdue)}

              {/* Actions */}
              {!isReadOnly && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutoSave(clinicalNotes)}
                    disabled={isSaving || !hasUnsavedChanges}
                  >
                    Save
                  </Button>
                  <Button
                    variant="calm"
                    size="sm"
                    onClick={() => setShowSubmitConfirm(true)}
                    disabled={isSaving || completionPercentage < 100}
                  >
                    Submit
                  </Button>
                </>
              )}
              {isReadOnly && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 ml-1" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors ${
                        activeSection === section.id
                          ? 'bg-calm-50 text-calm-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{section.icon}</span>
                      <span>{section.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Risk Level Indicator */}
                {clinicalNotes.riskLevel && clinicalNotes.riskLevel !== 'NONE' && (
                  <div className={`mt-4 p-3 rounded-lg ${getRiskLevelStyle(clinicalNotes.riskLevel)}`}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Risk level: {getRiskLevelLabel(clinicalNotes.riskLevel)}</span>
                    </div>
                  </div>
                )}

                {/* Version Info */}
                <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                  <p>Version: {sessionInfo.currentVersion}</p>
                  {sessionInfo.isOverdue && (
                    <p className="text-red-600 mt-1">
                      Deadline: {new Date(sessionInfo.deadline).toLocaleDateString('en-US')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            {activeSection === 'notes' && (
              <ClinicalNotesForm
                notes={clinicalNotes}
                onChange={handleNotesChange}
                onAutoSave={handleAutoSave}
                isReadOnly={isReadOnly}
              />
            )}
            {activeSection === 'safety' && (
              <SafetyAssessmentForm
                notes={clinicalNotes}
                onChange={handleNotesChange}
                isReadOnly={isReadOnly}
              />
            )}
            {activeSection === 'summary' && (
              <PatientSummaryForm
                sessionId={sessionId}
                patientName={sessionInfo.patientName}
                isReadOnly={isReadOnly}
              />
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirm Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                After submission, the documentation will be locked for regular editing.
                Corrections will require a detailed explanation and will be logged in the version history.
              </p>
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Please ensure all clinical information is accurate and complete before submission.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="calm"
                  onClick={handleSubmit}
                  disabled={isSaving}
                >
                  {isSaving ? 'Submitting...' : 'Confirm & Submit'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper functions
function calculateCompletionPercentage(notes: Partial<ClinicalNotes>): number {
  const requiredFields = [
    !!notes.clinicalSummary && notes.clinicalSummary.length >= 50,
    !!notes.riskLevel,
    !!notes.therapeuticMethods && notes.therapeuticMethods.length > 0,
  ];

  const optionalFields = [
    !!notes.presentingIssue,
    !!notes.interventions,
    !!notes.patientResponse,
    !!notes.progressIndicator,
  ];

  const requiredComplete = requiredFields.filter(Boolean).length;
  const optionalComplete = optionalFields.filter(Boolean).length;

  const requiredWeight = 0.7;
  const optionalWeight = 0.3;

  const requiredPercentage = (requiredComplete / requiredFields.length) * 100;
  const optionalPercentage = (optionalComplete / optionalFields.length) * 100;

  return Math.round(requiredPercentage * requiredWeight + optionalPercentage * optionalWeight);
}

function getStatusBadge(status: DocumentationStatus, isOverdue: boolean) {
  if (isOverdue && status === 'DRAFT') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <AlertTriangle className="w-3 h-3" />
        Overdue
      </span>
    );
  }

  const config: Record<DocumentationStatus, { label: string; className: string; icon?: React.ReactNode }> = {
    DRAFT: { label: 'Draft', className: 'bg-yellow-100 text-yellow-700' },
    SUBMITTED: { label: 'Submitted', className: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
    AMENDED: { label: 'Fixed', className: 'bg-blue-100 text-blue-700' },
    LOCKED: { label: 'Locked', className: 'bg-gray-100 text-gray-700', icon: <Lock className="w-3 h-3" /> },
  };

  const { label, className, icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {icon}
      {label}
    </span>
  );
}

function getRiskLevelStyle(riskLevel: RiskLevel): string {
  const styles: Record<RiskLevel, string> = {
    NONE: 'bg-green-50 text-green-700',
    LOW: 'bg-blue-50 text-blue-700',
    MODERATE: 'bg-yellow-50 text-yellow-700',
    HIGH: 'bg-orange-50 text-orange-700',
    CRITICAL: 'bg-red-50 text-red-700',
  };
  return styles[riskLevel];
}

function getRiskLevelLabel(riskLevel: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    NONE: 'None',
    LOW: 'Low',
    MODERATE: 'Moderate',
    HIGH: 'High',
    CRITICAL: 'Critical',
  };
  return labels[riskLevel];
}

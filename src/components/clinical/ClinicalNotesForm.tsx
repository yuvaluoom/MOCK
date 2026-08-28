'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Info,
  Check,
} from 'lucide-react';
import type {
  ClinicalNotes,
  TherapeuticMethod,
  ProgressIndicator,
  RiskLevel,
} from '@/lib/clinical/types';
import {
  THERAPEUTIC_METHOD_LABELS,
  PROGRESS_INDICATOR_LABELS,
  RISK_LEVEL_LABELS,
} from '@/lib/clinical/types';

interface ClinicalNotesFormProps {
  notes: Partial<ClinicalNotes>;
  onChange: (updates: Partial<ClinicalNotes>) => void;
  onAutoSave: (notes: Partial<ClinicalNotes>) => void;
  isReadOnly?: boolean;
}

export function ClinicalNotesForm({
  notes,
  onChange,
  onAutoSave,
  isReadOnly = false,
}: ClinicalNotesFormProps) {
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced auto-save
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    const timeout = setTimeout(() => {
      onAutoSave(notes);
    }, 2000);
    setAutoSaveTimeout(timeout);
  }, [notes, onAutoSave, autoSaveTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  const handleChange = (field: keyof ClinicalNotes, value: unknown) => {
    onChange({ [field]: value });
    if (!isReadOnly) {
      scheduleAutoSave();
    }
  };

  const toggleTherapeuticMethod = (method: TherapeuticMethod) => {
    const current = notes.therapeuticMethods || [];
    const updated = current.includes(method)
      ? current.filter(m => m !== method)
      : [...current, method];
    handleChange('therapeuticMethods', updated);
  };

  const therapeuticMethods: TherapeuticMethod[] = [
    'CBT', 'DBT', 'PSYCHODYNAMIC', 'HUMANISTIC', 'EMDR',
    'MINDFULNESS', 'FAMILY_THERAPY', 'COUPLES_THERAPY',
    'PLAY_THERAPY', 'ART_THERAPY', 'NARRATIVE',
    'SOLUTION_FOCUSED', 'INTEGRATIVE', 'OTHER'
  ];

  const progressIndicators: ProgressIndicator[] = [
    'SIGNIFICANT_IMPROVEMENT', 'MODERATE_IMPROVEMENT', 'SLIGHT_IMPROVEMENT',
    'NO_CHANGE', 'SLIGHT_DECLINE', 'MODERATE_DECLINE',
    'SIGNIFICANT_DECLINE', 'UNABLE_TO_ASSESS'
  ];

  const riskLevels: RiskLevel[] = ['NONE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

  return (
    <div className="space-y-6">
      {/* Presenting Issue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Subject edצג
            <span className="text-xs font-normal text-gray-500">(Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes.presentingIssue || ''}
            onChange={(e) => handleChange('presentingIssue', e.target.value)}
            placeholder="תאר את הSubject or הבעיה העיקרית שהPatient הביא לSession..."
            rows={3}
            disabled={isReadOnly}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Clinical Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Clinical Summary
            <span className="text-xs font-normal text-red-500">*Required (at least 50 characters)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              value={notes.clinicalSummary || ''}
              onChange={(e) => handleChange('clinicalSummary', e.target.value)}
              placeholder="סכם את הSession, כולל תכנs עיקריs, תהליכs שAlertחשו sובנs קליניs..."
              rows={6}
              disabled={isReadOnly}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {(notes.clinicalSummary?.length || 0) < 50 && (
                  <span className="text-red-500">
                    עוד {50 - (notes.clinicalSummary?.length || 0)} characters Requireds
                  </span>
                )}
                {(notes.clinicalSummary?.length || 0) >= 50 && (
                  <span className="text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    מיניedם הושג
                  </span>
                )}
              </span>
              <span>{notes.clinicalSummary?.length || 0} characters</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Therapeutic Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            שיטs Therapy
            <span className="text-xs font-normal text-red-500">*Required at least אחד</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {therapeuticMethods.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => !isReadOnly && toggleTherapeuticMethod(method)}
                disabled={isReadOnly}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  notes.therapeuticMethods?.includes(method)
                    ? 'bg-calm-100 text-calm-700 border-2 border-calm-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                {THERAPEUTIC_METHOD_LABELS[method].he}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interventions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            התערבויs
            <span className="text-xs font-normal text-gray-500">(Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes.interventions || ''}
            onChange={(e) => handleChange('interventions', e.target.value)}
            placeholder="תאר את ההתערבויs והטכניקs שהופעלו במהלך הSession..."
            rows={4}
            disabled={isReadOnly}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Patient Response */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Response ofPatient
            <span className="text-xs font-normal text-gray-500">(Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes.patientResponse || ''}
            onChange={(e) => handleChange('patientResponse', e.target.value)}
            placeholder="תאר כיצד הPatient הגיב להתערבויs ולתכנs שעלו בSession..."
            rows={3}
            disabled={isReadOnly}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            מדד התקדמs
            <span className="text-xs font-normal text-gray-500">(Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {progressIndicators.map((indicator) => (
              <button
                key={indicator}
                type="button"
                onClick={() => !isReadOnly && handleChange('progressIndicator', indicator)}
                disabled={isReadOnly}
                className={`px-3 py-2 rounded-lg text-sm transition-colors text-center ${
                  notes.progressIndicator === indicator
                    ? 'bg-calm-100 text-calm-700 border-2 border-calm-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                {PROGRESS_INDICATOR_LABELS[indicator].he}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Risk level
            <span className="text-xs font-normal text-red-500">*Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {riskLevels.map((level) => {
              const config = RISK_LEVEL_LABELS[level];
              const colorClasses: Record<string, string> = {
                green: notes.riskLevel === level ? 'bg-green-100 text-green-700 border-green-500' : 'hover:bg-green-50',
                blue: notes.riskLevel === level ? 'bg-blue-100 text-blue-700 border-blue-500' : 'hover:bg-blue-50',
                yellow: notes.riskLevel === level ? 'bg-yellow-100 text-yellow-700 border-yellow-500' : 'hover:bg-yellow-50',
                orange: notes.riskLevel === level ? 'bg-orange-100 text-orange-700 border-orange-500' : 'hover:bg-orange-50',
                red: notes.riskLevel === level ? 'bg-red-100 text-red-700 border-red-500' : 'hover:bg-red-50',
              };

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => !isReadOnly && handleChange('riskLevel', level)}
                  disabled={isReadOnly}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border-2 ${
                    notes.riskLevel === level ? colorClasses[config.color] : `bg-gray-50 text-gray-600 border-transparent ${colorClasses[config.color]}`
                  } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  {config.he}
                </button>
              );
            })}
          </div>

          {(notes.riskLevel === 'HIGH' || notes.riskLevel === 'CRITICAL') && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Risk level גבוהה Thisהתה</p>
                  <p className="mt-1">
                    נא למNo את טופס Assessment הבטיחs המNo בלשונית Assessment בטיחs.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Code אבחנה
            <span className="text-xs font-normal text-gray-500">(Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Code ICD-10</Label>
              <Input
                value={notes.icdCodes?.join(', ') || ''}
                onChange={(e) => handleChange('icdCodes', e.target.value.split(',').map(c => c.trim()).filter(Boolean))}
                placeholder="לדוגמה: F32.1, F41.1"
                disabled={isReadOnly}
                dir="ltr"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-600">Code DSM-5</Label>
              <Input
                value={notes.dsmCodes?.join(', ') || ''}
                onChange={(e) => handleChange('dsmCodes', e.target.value.split(',').map(c => c.trim()).filter(Boolean))}
                placeholder="לדוגמה: 300.4, 296.32"
                disabled={isReadOnly}
                dir="ltr"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Session Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">תכנון המשך</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-gray-600">edקד הSession Nextה</Label>
            <Textarea
              value={notes.nextSessionFocus || ''}
              onChange={(e) => handleChange('nextSessionFocus', e.target.value)}
              placeholder="Subjects ומטרs לSession Nextה..."
              rows={2}
              disabled={isReadOnly}
              className="resize-none mt-1"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notes.homeworkAssigned || false}
                onChange={(e) => handleChange('homeworkAssigned', e.target.checked)}
                disabled={isReadOnly}
                className="w-4 h-4 rounded border-gray-300 text-calm-600 focus:ring-calm-500"
              />
              <span className="text-sm text-gray-700">ניתנה משימה לבית</span>
            </label>

            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">מרווח Recommended (ימs):</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={notes.recommendedInterval || ''}
                onChange={(e) => handleChange('recommendedInterval', parseInt(e.target.value) || undefined)}
                disabled={isReadOnly}
                className="w-20"
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  Plus,
  Trash2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import type {
  ClinicalNotes,
  SafetyAssessment,
  EmergencyContact,
} from '@/lib/clinical/types';

interface SafetyAssessmentFormProps {
  notes: Partial<ClinicalNotes>;
  onChange: (updates: Partial<ClinicalNotes>) => void;
  isReadOnly?: boolean;
}

export function SafetyAssessmentForm({
  notes,
  onChange,
  isReadOnly = false,
}: SafetyAssessmentFormProps) {
  const safety = notes.assessment?.safetyAssessment || {
    suicidalIdeation: false,
    suicidalPlan: false,
    suicidalIntent: false,
    homicidalIdeation: false,
    selfHarmBehavior: false,
    protectiveFactors: [],
    riskFactors: [],
    safetyPlan: '',
    emergencyContacts: [],
  };

  const [newProtectiveFactor, setNewProtectiveFactor] = useState('');
  const [newRiskFactor, setNewRiskFactor] = useState('');

  const updateSafety = (updates: Partial<SafetyAssessment>) => {
    onChange({
      assessment: {
        ...notes.assessment,
        safetyAssessment: {
          ...safety,
          ...updates,
        },
      },
    });
  };

  const hasRiskIndicators = safety.suicidalIdeation || safety.suicidalPlan ||
    safety.suicidalIntent || safety.homicidalIdeation || safety.selfHarmBehavior;

  const addProtectiveFactor = () => {
    if (newProtectiveFactor.trim()) {
      updateSafety({
        protectiveFactors: [...(safety.protectiveFactors || []), newProtectiveFactor.trim()],
      });
      setNewProtectiveFactor('');
    }
  };

  const removeProtectiveFactor = (index: number) => {
    updateSafety({
      protectiveFactors: (safety.protectiveFactors || []).filter((_, i) => i !== index),
    });
  };

  const addRiskFactor = () => {
    if (newRiskFactor.trim()) {
      updateSafety({
        riskFactors: [...(safety.riskFactors || []), newRiskFactor.trim()],
      });
      setNewRiskFactor('');
    }
  };

  const removeRiskFactor = (index: number) => {
    updateSafety({
      riskFactors: (safety.riskFactors || []).filter((_, i) => i !== index),
    });
  };

  const addEmergencyContact = () => {
    const newContact: EmergencyContact = {
      name: '',
      relationship: '',
      phone: '',
      isAwareOfTreatment: false,
    };
    updateSafety({
      emergencyContacts: [...(safety.emergencyContacts || []), newContact],
    });
  };

  const updateEmergencyContact = (index: number, updates: Partial<EmergencyContact>) => {
    const contacts = [...(safety.emergencyContacts || [])];
    contacts[index] = { ...contacts[index], ...updates };
    updateSafety({ emergencyContacts: contacts });
  };

  const removeEmergencyContact = (index: number) => {
    updateSafety({
      emergencyContacts: (safety.emergencyContacts || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Risk Indicators Alert */}
      {hasRiskIndicators && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">זוהו מדדי סיכון</h3>
              <p className="text-sm text-red-700 mt-1">
                נא להשלים את כל פרטי הערכת הבטיחות, כולל תוכנית בטיחות ואנשי קשר לחירום.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-gray-600" />
            מדדי סיכון
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Suicidal Ideation */}
            <div className={`p-4 rounded-lg border-2 ${safety.suicidalIdeation ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safety.suicidalIdeation}
                  onChange={(e) => updateSafety({ suicidalIdeation: e.target.checked })}
                  disabled={isReadOnly}
                  className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="font-medium text-gray-900">אידיאציה אובדנית</span>
                  <p className="text-xs text-gray-500">מחשבות על סיום החיים</p>
                </div>
              </label>
            </div>

            {/* Suicidal Plan */}
            <div className={`p-4 rounded-lg border-2 ${safety.suicidalPlan ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safety.suicidalPlan}
                  onChange={(e) => updateSafety({ suicidalPlan: e.target.checked })}
                  disabled={isReadOnly}
                  className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="font-medium text-gray-900">תוכנית אובדנית</span>
                  <p className="text-xs text-gray-500">תוכנית ספציפית לביצוע</p>
                </div>
              </label>
            </div>

            {/* Suicidal Intent */}
            <div className={`p-4 rounded-lg border-2 ${safety.suicidalIntent ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safety.suicidalIntent}
                  onChange={(e) => updateSafety({ suicidalIntent: e.target.checked })}
                  disabled={isReadOnly}
                  className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="font-medium text-gray-900">כוונה אובדנית</span>
                  <p className="text-xs text-gray-500">כוונה ממשית לביצוע</p>
                </div>
              </label>
            </div>

            {/* Homicidal Ideation */}
            <div className={`p-4 rounded-lg border-2 ${safety.homicidalIdeation ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safety.homicidalIdeation}
                  onChange={(e) => updateSafety({ homicidalIdeation: e.target.checked })}
                  disabled={isReadOnly}
                  className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="font-medium text-gray-900">אידיאציה רצחנית</span>
                  <p className="text-xs text-gray-500">מחשבות על פגיעה באחרים</p>
                </div>
              </label>
            </div>

            {/* Self Harm */}
            <div className={`p-4 rounded-lg border-2 ${safety.selfHarmBehavior ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safety.selfHarmBehavior}
                  onChange={(e) => updateSafety({ selfHarmBehavior: e.target.checked })}
                  disabled={isReadOnly}
                  className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-900">התנהגות פגיעה עצמית</span>
                  <p className="text-xs text-gray-500">התנהגויות מזיקות לעצמו</p>
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protective Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            גורמי הגנה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            גורמים שמגנים על המטופל ומפחיתים סיכון (למשל: תמיכה משפחתית, תחביבים, אמונות...)
          </p>

          <div className="flex flex-wrap gap-2">
            {(safety.protectiveFactors || []).map((factor, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {factor}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeProtectiveFactor(index)}
                    className="hover:text-green-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {!isReadOnly && (
            <div className="flex gap-2">
              <Input
                value={newProtectiveFactor}
                onChange={(e) => setNewProtectiveFactor(e.target.value)}
                placeholder="הוסף גורם הגנה..."
                onKeyDown={(e) => e.key === 'Enter' && addProtectiveFactor()}
                dir="rtl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProtectiveFactor}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            גורמי סיכון
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            גורמים שמגבירים סיכון (למשל: היסטוריה של ניסיונות, שימוש בחומרים, בידוד חברתי...)
          </p>

          <div className="flex flex-wrap gap-2">
            {(safety.riskFactors || []).map((factor, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
              >
                {factor}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeRiskFactor(index)}
                    className="hover:text-orange-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {!isReadOnly && (
            <div className="flex gap-2">
              <Input
                value={newRiskFactor}
                onChange={(e) => setNewRiskFactor(e.target.value)}
                placeholder="הוסף גורם סיכון..."
                onKeyDown={(e) => e.key === 'Enter' && addRiskFactor()}
                dir="rtl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRiskFactor}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety Plan */}
      <Card className={hasRiskIndicators && !safety.safetyPlan ? 'border-red-300' : ''}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            תוכנית בטיחות
            {hasRiskIndicators && (
              <span className="text-xs font-normal text-red-500">*נדרש</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={safety.safetyPlan || ''}
            onChange={(e) => updateSafety({ safetyPlan: e.target.value })}
            placeholder="תאר את תוכנית הבטיחות שנקבעה עם המטופל: צעדים להתמודדות במצוקה, מספרי חירום, אנשי קשר תומכים..."
            rows={5}
            disabled={isReadOnly}
            className="resize-none"
            dir="rtl"
          />
          {hasRiskIndicators && !safety.safetyPlan && (
            <p className="text-sm text-red-600 mt-2">
              תוכנית בטיחות נדרשת כאשר זוהו מדדי סיכון
            </p>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className={hasRiskIndicators && (!safety.emergencyContacts || safety.emergencyContacts.length === 0) ? 'border-red-300' : ''}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              אנשי קשר לחירום
              {hasRiskIndicators && (
                <span className="text-xs font-normal text-red-500">*נדרש לפחות אחד</span>
              )}
            </span>
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEmergencyContact}
              >
                <Plus className="w-4 h-4 ml-1" />
                הוסף איש קשר
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!safety.emergencyContacts || safety.emergencyContacts.length === 0) ? (
            <p className="text-sm text-gray-500 text-center py-4">
              לא הוגדרו אנשי קשר לחירום
            </p>
          ) : (
            <div className="space-y-4">
              {safety.emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">איש קשר #{index + 1}</span>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmergencyContact(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500">שם</Label>
                      <Input
                        value={contact.name}
                        onChange={(e) => updateEmergencyContact(index, { name: e.target.value })}
                        placeholder="שם מלא"
                        disabled={isReadOnly}
                        dir="rtl"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">קרבה</Label>
                      <Input
                        value={contact.relationship}
                        onChange={(e) => updateEmergencyContact(index, { relationship: e.target.value })}
                        placeholder="למשל: הורה, בן/בת זוג"
                        disabled={isReadOnly}
                        dir="rtl"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">טלפון</Label>
                      <Input
                        value={contact.phone}
                        onChange={(e) => updateEmergencyContact(index, { phone: e.target.value })}
                        placeholder="050-0000000"
                        disabled={isReadOnly}
                        dir="ltr"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contact.isAwareOfTreatment}
                          onChange={(e) => updateEmergencyContact(index, { isAwareOfTreatment: e.target.checked })}
                          disabled={isReadOnly}
                          className="w-4 h-4 rounded border-gray-300 text-calm-600 focus:ring-calm-500"
                        />
                        <span className="text-sm text-gray-700">מודע/ת לטיפול</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hotline Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <h4 className="font-medium text-blue-900 mb-2">קווים חמים לשעת חירום</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-800">ער&quot;ן:</span>
              <span className="text-blue-700" dir="ltr">1201</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-800">סה&quot;ר:</span>
              <span className="text-blue-700" dir="ltr">*2784</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-800">נט&quot;ל:</span>
              <span className="text-blue-700" dir="ltr">1-800-363-363</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

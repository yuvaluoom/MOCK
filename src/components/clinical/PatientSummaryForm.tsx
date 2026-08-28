'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Share2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle,
  Info,
} from 'lucide-react';
import type { PatientSessionSummary, PatientHomework } from '@/lib/clinical/types';

interface PatientSummaryFormProps {
  sessionId: string;
  patientName: string;
  isReadOnly?: boolean;
}

export function PatientSummaryForm({
  sessionId,
  patientName,
  isReadOnly = false,
}: PatientSummaryFormProps) {
  // Mock data - replace with tRPC
  const [summary, setSummary] = useState<Partial<PatientSessionSummary>>({
    summaryHebrew: '',
    topicsDiscussed: [],
    keyTakeaways: [],
    homework: [],
    isVisibleToPatient: false,
  });

  const [newTopic, setNewTopic] = useState('');
  const [newTakeaway, setNewTakeaway] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addTopic = () => {
    if (newTopic.trim()) {
      setSummary(prev => ({
        ...prev,
        topicsDiscussed: [...(prev.topicsDiscussed || []), newTopic.trim()],
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (index: number) => {
    setSummary(prev => ({
      ...prev,
      topicsDiscussed: (prev.topicsDiscussed || []).filter((_, i) => i !== index),
    }));
  };

  const addTakeaway = () => {
    if (newTakeaway.trim()) {
      setSummary(prev => ({
        ...prev,
        keyTakeaways: [...(prev.keyTakeaways || []), newTakeaway.trim()],
      }));
      setNewTakeaway('');
    }
  };

  const removeTakeaway = (index: number) => {
    setSummary(prev => ({
      ...prev,
      keyTakeaways: (prev.keyTakeaways || []).filter((_, i) => i !== index),
    }));
  };

  const addHomework = () => {
    const newHomework: PatientHomework = {
      id: `hw-${Date.now()}`,
      title: '',
      description: '',
      isCompleted: false,
    };
    setSummary(prev => ({
      ...prev,
      homework: [...(prev.homework || []), newHomework],
    }));
  };

  const updateHomework = (index: number, updates: Partial<PatientHomework>) => {
    setSummary(prev => {
      const homework = [...(prev.homework || [])];
      homework[index] = { ...homework[index], ...updates };
      return { ...prev, homework };
    });
  };

  const removeHomework = (index: number) => {
    setSummary(prev => ({
      ...prev,
      homework: (prev.homework || []).filter((_, i) => i !== index),
    }));
  };

  const handleShare = async () => {
    setIsSaving(true);
    try {
      // TODO: Call tRPC mutation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSummary(prev => ({
        ...prev,
        isVisibleToPatient: true,
        sharedAt: new Date(),
      }));
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleHide = async () => {
    setIsSaving(true);
    try {
      // TODO: Call tRPC mutation
      await new Promise(resolve => setTimeout(resolve, 500));
      setSummary(prev => ({
        ...prev,
        isVisibleToPatient: false,
      }));
    } catch (error) {
      console.error('Hide failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Summary forPatient</p>
            <p className="mt-1">
              This summary will be נגיש לPatient באפליקציה שלו. השתמש בLanguage ברורה ומעודדת.
              <strong className="block mt-1">
                אל תכלול מידע קליני רגיש or אבחנs שNo שsפו With הPatient.
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Visibility Status */}
      <Card className={summary.isVisibleToPatient ? 'border-green-300 bg-green-50' : ''}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {summary.isVisibleToPatient ? (
                <>
                  <Eye className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">הSummary גלוי לPatient</p>
                    {summary.sharedAt && (
                      <p className="text-xs text-green-600">
                        שsף ב-{new Date(summary.sharedAt).toLocaleDateString('he-IL')}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <EyeOff className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-700">הSummary edסתר מהPatient</p>
                    <p className="text-xs text-gray-500">Stress שתף כדי להנגיש לPatient</p>
                  </div>
                </>
              )}
            </div>
            {!isReadOnly && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'סגור תצוגה מקדימה' : 'תצוגה מקדימה'}
                </Button>
                {summary.isVisibleToPatient ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHide}
                    disabled={isSaving}
                  >
                    <EyeOff className="w-4 h-4 ml-1" />
                    הסתר
                  </Button>
                ) : (
                  <Button
                    variant="calm"
                    size="sm"
                    onClick={handleShare}
                    disabled={isSaving || !summary.summaryHebrew}
                  >
                    <Share2 className="w-4 h-4 ml-1" />
                    {isSaving ? 'משתף...' : 'שתף With הPatient'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      {showPreview && (
        <Card className="border-2 border-dashed border-calm-300 bg-calm-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-calm-600" />
              תצוגה מקדימה - כך הPatient יראה את הSummary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Summary הSession</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {summary.summaryHebrew || '(No הוזן Summary)'}
              </p>
            </div>

            {(summary.topicsDiscussed?.length ?? 0) > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium mb-2">Subjects שדיברנו עליהם</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {summary.topicsDiscussed?.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {(summary.keyTakeaways?.length ?? 0) > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium mb-2">נקודs מפתח לזכור</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {summary.keyTakeaways?.map((takeaway, i) => (
                    <li key={i}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            )}

            {(summary.homework?.length ?? 0) > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium mb-2">משימs up to הSession Nextה</h4>
                <div className="space-y-2">
                  {summary.homework?.map((hw, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded border border-gray-300 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">{hw.title || '(לNo כsרת)'}</p>
                        {hw.description && (
                          <p className="text-sm text-gray-600">{hw.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Text */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary הSession</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={summary.summaryHebrew || ''}
            onChange={(e) => setSummary(prev => ({ ...prev, summaryHebrew: e.target.value }))}
            placeholder={`היי ${patientName},\n\nהיום דיברנו על...\n\nהיה חשוב לי לציין ש...\n\nלקראת הSession Nextה...`}
            rows={8}
            disabled={isReadOnly}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Topics Discussed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subjects שעלו בSession</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(summary.topicsDiscussed || []).map((topic, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-calm-100 text-calm-800 rounded-full text-sm"
              >
                {topic}
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeTopic(index)}
                    className="hover:text-calm-600"
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
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="הוסף Subject..."
                onKeyDown={(e) => e.key === 'Enter' && addTopic()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTopic}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Takeaways */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">נקודs מפתח לזכור</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            תובנs or נקודs חשובs שהPatient יכול לזכור מהSession
          </p>

          <div className="space-y-2">
            {(summary.keyTakeaways || []).map((takeaway, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="flex-1 text-gray-800">{takeaway}</span>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeTakeaway(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!isReadOnly && (
            <div className="flex gap-2">
              <Input
                value={newTakeaway}
                onChange={(e) => setNewTakeaway(e.target.value)}
                placeholder="הוסף נקודה לזכור..."
                onKeyDown={(e) => e.key === 'Enter' && addTakeaway()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTakeaway}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Homework */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>משימs לבית</span>
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHomework}
              >
                <Plus className="w-4 h-4 ml-1" />
                הוסף משימה
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!summary.homework || summary.homework.length === 0) ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No הוגדרו משימs לSession This
            </p>
          ) : (
            <div className="space-y-4">
              {summary.homework.map((hw, index) => (
                <div
                  key={hw.id}
                  className="p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">משימה #{index + 1}</span>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHomework(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">כsרת המשימה</Label>
                      <Input
                        value={hw.title}
                        onChange={(e) => updateHomework(index, { title: e.target.value })}
                        placeholder="למשל: תרגול נשימs עedקs"
                        disabled={isReadOnly}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">תיorר (Optional)</Label>
                      <Textarea
                        value={hw.description || ''}
                        onChange={(e) => updateHomework(index, { description: e.target.value })}
                        placeholder="הורorת מפורטs לביצוע המשימה..."
                        rows={2}
                        disabled={isReadOnly}
                        className="resize-none mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Date יup to (Optional)</Label>
                      <Input
                        type="date"
                        value={hw.dueDate ? new Date(hw.dueDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateHomework(index, { dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                        disabled={isReadOnly}
                        className="mt-1 w-48"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

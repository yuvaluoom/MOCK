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
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSummary(prev => ({
        ...prev,
        isVisibleToPatient: true,
        sharedAt: new Date(),
      }));
    } catch {
      // Share failed silently
    } finally {
      setIsSaving(false);
    }
  };

  const handleHide = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSummary(prev => ({
        ...prev,
        isVisibleToPatient: false,
      }));
    } catch {
      // Hide failed silently
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
            <p className="font-medium">Patient Summary</p>
            <p className="mt-1">
              This summary will be visible to the patient in their app. Use clear and encouraging language.
              <strong className="block mt-1">
                Do not include sensitive clinical information or diagnoses not shared with the patient.
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
                    <p className="font-medium text-green-800">Summary visible to patient</p>
                    {summary.sharedAt && (
                      <p className="text-xs text-green-600">
                        Shared on {new Date(summary.sharedAt).toLocaleDateString('en-US')}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <EyeOff className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-700">Summary hidden from patient</p>
                    <p className="text-xs text-gray-500">Share to make visible to patient</p>
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
                  {showPreview ? 'Close Preview' : 'Preview'}
                </Button>
                {summary.isVisibleToPatient ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHide}
                    disabled={isSaving}
                  >
                    <EyeOff className="w-4 h-4 ml-1" />
                    Hide
                  </Button>
                ) : (
                  <Button
                    variant="calm"
                    size="sm"
                    onClick={handleShare}
                    disabled={isSaving || !summary.summaryHebrew}
                  >
                    <Share2 className="w-4 h-4 ml-1" />
                    {isSaving ? 'Sharing...' : 'Share with Patient'}
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
              Preview - How the patient will see this summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Session Summary</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {summary.summaryHebrew || '(No summary entered)'}
              </p>
            </div>

            {(summary.topicsDiscussed?.length ?? 0) > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium mb-2">Topics Discussed</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {summary.topicsDiscussed?.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {(summary.keyTakeaways?.length ?? 0) > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium mb-2">Key Takeaways</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {summary.keyTakeaways?.map((takeaway, i) => (
                    <li key={i}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            )}

            {(summary.homework?.length ?? 0) > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium mb-2">Tasks for the Next Session</h4>
                <div className="space-y-2">
                  {summary.homework?.map((hw, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded border border-gray-300 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">{hw.title || '(Untitled)'}</p>
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
          <CardTitle className="text-lg">Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={summary.summaryHebrew || ''}
            onChange={(e) => setSummary(prev => ({ ...prev, summaryHebrew: e.target.value }))}
            placeholder={`Hi ${patientName},\n\nToday we discussed...\n\nI wanted to highlight that...\n\nLooking ahead to the next session...`}
            rows={8}
            disabled={isReadOnly}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Topics Discussed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Topics Discussed in Session</CardTitle>
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
                placeholder="Add a topic..."
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
          <CardTitle className="text-lg">Key Takeaways</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Insights or important points the patient can remember from the session
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
                placeholder="Add a takeaway..."
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
            <span>Homework</span>
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHomework}
              >
                <Plus className="w-4 h-4 ml-1" />
                Add Task
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!summary.homework || summary.homework.length === 0) ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No homework defined for this session
            </p>
          ) : (
            <div className="space-y-4">
              {summary.homework.map((hw, index) => (
                <div
                  key={hw.id}
                  className="p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">Task #{index + 1}</span>
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
                      <Label className="text-xs text-gray-500">Task Title</Label>
                      <Input
                        value={hw.title}
                        onChange={(e) => updateHomework(index, { title: e.target.value })}
                        placeholder="e.g., Practice deep breathing exercises"
                        disabled={isReadOnly}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Description (Optional)</Label>
                      <Textarea
                        value={hw.description || ''}
                        onChange={(e) => updateHomework(index, { description: e.target.value })}
                        placeholder="Detailed instructions for completing the task..."
                        rows={2}
                        disabled={isReadOnly}
                        className="resize-none mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Due Date (Optional)</Label>
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

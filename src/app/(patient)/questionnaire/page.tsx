'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';

// Answer types - supports different question types
type AnswerValue = number | boolean | string;

// Compact scale: 1-5 with visual legend
const SCALE_OPTIONS = [1, 2, 3, 4, 5];
const SCALE_LEGEND = {
  1: 'Not at all',
  2: 'A little',
  3: 'Moderately',
  4: 'Quite a bit',
  5: 'Very much',
};

// Hebrew labels for Yes/No
const YES_NO_LABELS = {
  yes: 'Yes',
  no: 'No',
};

export default function QuestionnairePage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch active questionnaire from backend
  const { data: questionnaireData, isLoading } = trpc.questionnaire.getActiveQuestionnaire.useQuery();

  // Mutations
  const saveAnswerMutation = trpc.questionnaire.saveAnswer.useMutation();

  const submitMutation = trpc.questionnaire.submitQuestionnaire.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => router.push('/matches'), 1500);
    },
  });

  // Use sections from API response
  const sections = questionnaireData?.sections ?? [];
  const allQuestions = sections.flatMap((s) => s.questions);
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Current section data - defined before callbacks that use it
  const currentSectionData = sections[currentSection];
  const currentQuestions = currentSectionData?.questions ?? [];
  const isLast = currentSection === sections.length - 1;
  const isFirst = currentSection === 0;

  const handleAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear validation error when answered
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    // Convert boolean/string to number for backend compatibility
    const numericValue = typeof value === 'boolean' ? (value ? 1 : 0) :
                         typeof value === 'string' ? parseInt(value, 10) || 0 : value;
    saveAnswerMutation.mutate({ questionId, value: numericValue });
  }, [saveAnswerMutation]);

  // Validate current section before proceeding
  const validateSection = useCallback(() => {
    const errors: Record<string, string> = {};
    for (const q of currentQuestions) {
      if (q.isRequired && answers[q.id] === undefined) {
        errors[q.id] = 'Required field';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentQuestions, answers]);

  // Check if current section has all required questions answered
  const requiredQuestionsAnswered = useMemo(() => {
    return currentQuestions
      .filter((q: { isRequired?: boolean }) => q.isRequired)
      .every((q: { id: string }) => answers[q.id] !== undefined);
  }, [currentQuestions, answers]);

  const handleSubmit = () => {
    // Validate all sections before submitting
    const allQuestions = sections.flatMap((s) => s.questions);
    const errors: Record<string, string> = {};
    for (const q of allQuestions) {
      if (q.isRequired && answers[q.id] === undefined) {
        errors[q.id] = 'Required field';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Find first section with errors and navigate to it
      for (let i = 0; i < sections.length; i++) {
        const sectionHasError = sections[i].questions.some((q: { id: string }) => errors[q.id]);
        if (sectionHasError) {
          setCurrentSection(i);
          break;
        }
      }
      return;
    }

    submitMutation.mutate();
  };

  const handleNextSection = () => {
    if (validateSection()) {
      setCurrentSection((p) => p + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-600"></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-green-600"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Questionnaire Complete!</h2>
          <p className="text-gray-600 text-sm">Calculating your matches...</p>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Questionnaire Available</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-14rem)] sm:h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">X-Factor Questionnaire</h1>
            <p className="text-xs text-gray-500">Science-based therapist matching</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0" aria-live="polite">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-900" aria-label={`${progress}% complete`}>{progress}%</p>
              <p className="text-xs text-gray-500 hidden sm:block">{answeredCount}/{totalQuestions}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-calm-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${progress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <nav aria-label="Questionnaire sections" className="flex gap-1 border-b pb-2 overflow-x-auto scrollbar-hide -mx-1 px-1" role="tablist">
          {sections.map((sec, i) => {
            const sectionAnswered = sec.questions.filter((q: { id: string }) => answers[q.id] !== undefined).length;
            const isComplete = sectionAnswered === sec.questions.length;
            const isCurrent = i === currentSection;

            return (
              <button
                key={sec.id}
                role="tab"
                aria-selected={isCurrent}
                aria-controls={`section-${sec.id}`}
                onClick={() => setCurrentSection(i)}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-t-md transition-all whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-calm-500 ${
                  isCurrent
                    ? 'bg-white text-calm-700 border border-b-0 border-gray-200 -mb-[1px] z-10'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {isComplete && !isCurrent && (
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {sec.name}
                  {!isComplete && sectionAnswered > 0 && (
                    <span className="text-[10px] text-gray-400">({sectionAnswered}/{sec.questions.length})</span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area - Fills Remaining Space */}
      <div role="tabpanel" id={`section-${currentSectionData?.id}`} className="flex-1 min-h-0 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">
        {/* Questions Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3">
            {currentQuestions.map((q, idx) => {
              const selectedValue = answers[q.id];
              const hasError = validationErrors[q.id];
              const questionType = q.questionType || 'SCALE';

              const isChoiceType = questionType === 'MULTIPLE_CHOICE' || questionType === 'MULTI_SELECT';

              return (
                <fieldset
                  key={q.id}
                  className={`p-3 rounded-lg transition-colors border-0 ${
                    hasError ? 'bg-red-50 border border-red-200' :
                    selectedValue !== undefined ? 'bg-calm-50/50' : 'bg-gray-50 hover:bg-gray-100'
                  } space-y-2`}
                  role="radiogroup"
                  aria-label={q.questionText}
                  aria-required={q.isRequired}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${
                      hasError ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-600'
                    }`} aria-hidden="true">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <legend className="text-sm text-gray-800 leading-snug">
                        {q.questionText}
                        {q.isRequired && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
                      </legend>
                      {hasError && (
                        <p className="text-xs text-red-600 mt-1" role="alert">{hasError}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pl-9">
                    {/* YES_NO Type - Binary Yes/No buttons */}
                    {questionType === 'YES_NO' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAnswer(q.id, true)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-1 ${
                            selectedValue === true
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'bg-white border border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-600'
                          }`}
                          aria-pressed={selectedValue === true}
                        >
                          {YES_NO_LABELS.yes}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswer(q.id, false)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-1 ${
                            selectedValue === false
                              ? 'bg-gray-600 text-white shadow-sm'
                              : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400'
                          }`}
                          aria-pressed={selectedValue === false}
                        >
                          {YES_NO_LABELS.no}
                        </button>
                      </>
                    )}

                    {/* MULTIPLE_CHOICE / MULTI_SELECT Type - Radio/checkbox-style buttons */}
                    {(questionType === 'MULTIPLE_CHOICE' || questionType === 'MULTI_SELECT') && q.options && (
                      <div className="flex flex-wrap gap-1">
                        {/* Handle both array format (choices) and object format */}
                        {(q.options.choices || Object.entries(q.options).filter(([k]) => k !== 'choices')).map((item: any) => {
                          // Support both formats: { choices: [{value, label}] } and { key: label }
                          const value = item.value ?? item[0];
                          const label = item.label ?? item[1];
                          const isSelected = selectedValue === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleAnswer(q.id, value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-1 ${
                                isSelected
                                  ? 'bg-calm-600 text-white shadow-sm'
                                  : 'bg-white border border-gray-300 text-gray-600 hover:border-calm-400 hover:text-calm-600'
                              }`}
                              aria-pressed={isSelected}
                            >
                              {label as string}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* SCALE Type - 1-5 scale buttons (default) */}
                    {(questionType === 'SCALE' || !questionType) && (
                      <>
                        {SCALE_OPTIONS.map((value) => {
                          const isSelected = selectedValue === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleAnswer(q.id, value)}
                              className={`w-8 h-8 rounded-full text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-1 ${
                                isSelected
                                  ? 'bg-calm-600 text-white shadow-sm scale-110'
                                  : 'bg-white border border-gray-300 text-gray-600 hover:border-calm-400 hover:text-calm-600'
                              }`}
                              aria-pressed={isSelected}
                              aria-label={`${value} - ${SCALE_LEGEND[value as keyof typeof SCALE_LEGEND]}`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                </fieldset>
              );
            })}
          </div>
        </div>

        {/* Scale Legend - Fixed at Bottom (only show for SCALE questions) */}
        {currentQuestions.some((q: { questionType?: string }) => q.questionType === 'SCALE' || !q.questionType) && (
          <div className="flex-shrink-0 px-4 py-2 bg-gray-50 border-t">
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-white border border-gray-300 text-[10px] flex items-center justify-center">1</span>
                Not at all
              </span>
              <span className="text-gray-300">—</span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-white border border-gray-300 text-[10px] flex items-center justify-center">3</span>
                Moderately
              </span>
              <span className="text-gray-300">—</span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-white border border-gray-300 text-[10px] flex items-center justify-center">5</span>
                Very much
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Navigation Footer */}
      <div className="flex-shrink-0 pt-3 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentSection((p) => Math.max(0, p - 1))}
          disabled={isFirst}
          className="gap-1 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="text-xs text-gray-500 text-center min-w-0">
          <span>{currentSection + 1}/{sections.length}</span>
          <span className="hidden sm:inline"> • <span className="text-red-500">* Required</span></span>
        </div>

        {isLast ? (
          <Button
            variant="calm"
            size="sm"
            onClick={handleSubmit}
            loading={submitMutation.isPending}
            className="gap-1 flex-shrink-0"
          >
            <span className="hidden sm:inline">Submit &</span> Continue
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Button>
        ) : (
          <Button
            variant="calm"
            size="sm"
            onClick={handleNextSection}
            className="gap-1 flex-shrink-0"
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}

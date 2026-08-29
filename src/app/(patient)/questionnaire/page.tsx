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

  const sectionProgress = currentQuestions.length > 0
    ? Math.round(currentQuestions.filter((q: { id: string }) => answers[q.id] !== undefined).length / currentQuestions.length * 100)
    : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-8rem)]">
      {/* Header - Mobile: compact progress bar, Desktop: full tabs */}
      <div className="flex-shrink-0 space-y-3 pb-3">
        {/* Title & Progress */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">X-Factor Questionnaire</h1>
            {/* Mobile: section name + step indicator */}
            <p className="text-sm text-calm-600 font-medium sm:hidden">{currentSectionData?.name}</p>
            <p className="text-xs text-gray-500 hidden sm:block">Science-based therapist matching</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0" aria-live="polite">
            <div className="text-right">
              <p className="text-sm font-bold text-calm-700">{progress}%</p>
              <p className="text-[11px] text-gray-400">{answeredCount}/{totalQuestions}</p>
            </div>
            <div className="w-11 h-11 relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" className="text-calm-500" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${progress}, 100`} />
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile: linear progress for section */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
            <span>Step {currentSection + 1} of {sections.length}</span>
            <span>{sectionProgress}% of section</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-calm-500 rounded-full transition-all duration-300" style={{ width: `${(currentSection + 1) / sections.length * 100}%` }} />
          </div>
        </div>

        {/* Desktop: Section Tabs */}
        <nav aria-label="Questionnaire sections" className="hidden sm:flex gap-1 border-b pb-2 overflow-x-auto scrollbar-hide" role="tablist">
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

      {/* Main Content Area */}
      <div role="tabpanel" id={`section-${currentSectionData?.id}`} className="flex-1 min-h-0 flex flex-col bg-white rounded-xl sm:rounded-lg border shadow-sm overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-2">
            {currentQuestions.map((q, idx) => {
              const selectedValue = answers[q.id];
              const hasError = validationErrors[q.id];
              const questionType = q.questionType || 'SCALE';

              return (
                <fieldset
                  key={q.id}
                  className={`p-3 sm:p-3 rounded-xl sm:rounded-lg transition-colors border ${
                    hasError ? 'bg-red-50 border-red-200' :
                    selectedValue !== undefined ? 'bg-calm-50/30 border-calm-100' : 'bg-gray-50/50 border-transparent hover:bg-gray-50'
                  } space-y-3 sm:space-y-2`}
                  role="radiogroup"
                  aria-label={q.questionText}
                  aria-required={q.isRequired}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`flex-shrink-0 w-7 h-7 sm:w-6 sm:h-6 rounded-full text-xs font-semibold flex items-center justify-center ${
                      hasError ? 'bg-red-200 text-red-700' :
                      selectedValue !== undefined ? 'bg-calm-200 text-calm-700' : 'bg-gray-200 text-gray-500'
                    }`} aria-hidden="true">
                      {selectedValue !== undefined ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (idx + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <legend className="text-sm sm:text-sm text-gray-800 leading-relaxed sm:leading-snug font-medium sm:font-normal">
                        {q.questionText}
                        {q.isRequired && <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>}
                      </legend>
                      {hasError && (
                        <p className="text-xs text-red-600 mt-1" role="alert">{hasError}</p>
                      )}
                    </div>
                  </div>

                  {/* Answer Options */}
                  <div className="flex flex-wrap gap-2 sm:gap-1.5 pl-9 sm:pl-8">
                    {questionType === 'YES_NO' && (
                      <>
                        <button type="button" onClick={() => handleAnswer(q.id, true)}
                          className={`px-5 py-2.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-1 ${
                            selectedValue === true ? 'bg-green-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'
                          }`}
                          aria-pressed={selectedValue === true}
                        >{YES_NO_LABELS.yes}</button>
                        <button type="button" onClick={() => handleAnswer(q.id, false)}
                          className={`px-5 py-2.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-1 ${
                            selectedValue === false ? 'bg-gray-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                          }`}
                          aria-pressed={selectedValue === false}
                        >{YES_NO_LABELS.no}</button>
                      </>
                    )}

                    {(questionType === 'MULTIPLE_CHOICE' || questionType === 'MULTI_SELECT') && q.options && (
                      <div className="flex flex-wrap gap-2 sm:gap-1">
                        {(q.options.choices || Object.entries(q.options).filter(([k]) => k !== 'choices')).map((item: any) => {
                          const value = item.value ?? item[0];
                          const label = item.label ?? item[1];
                          const isSelected = selectedValue === value;
                          return (
                            <button key={value} type="button" onClick={() => handleAnswer(q.id, value)}
                              className={`px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-lg text-sm sm:text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-1 ${
                                isSelected ? 'bg-calm-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-calm-400'
                              }`}
                              aria-pressed={isSelected}
                            >{label as string}</button>
                          );
                        })}
                      </div>
                    )}

                    {(questionType === 'SCALE' || !questionType) && (
                      <div className="flex items-center gap-1 w-full">
                        <span className="text-[10px] text-gray-400 hidden sm:inline w-12">Not at all</span>
                        <div className="flex gap-2 sm:gap-1 flex-1 justify-center sm:justify-start">
                          {SCALE_OPTIONS.map((value) => {
                            const isSelected = selectedValue === value;
                            return (
                              <button key={value} type="button" onClick={() => handleAnswer(q.id, value)}
                                className={`w-11 h-11 sm:w-8 sm:h-8 rounded-full text-sm sm:text-xs font-semibold sm:font-medium transition-all focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-1 ${
                                  isSelected
                                    ? 'bg-calm-600 text-white shadow-md scale-105'
                                    : 'bg-white border-2 sm:border border-gray-200 text-gray-500 hover:border-calm-400 hover:text-calm-600 active:scale-95'
                                }`}
                                aria-pressed={isSelected}
                                aria-label={`${value} - ${SCALE_LEGEND[value as keyof typeof SCALE_LEGEND]}`}
                              >{value}</button>
                            );
                          })}
                        </div>
                        <span className="text-[10px] text-gray-400 hidden sm:inline w-14 text-right">Very much</span>
                      </div>
                    )}
                  </div>
                </fieldset>
              );
            })}
          </div>
        </div>

        {/* Scale Legend - Mobile only (desktop shows inline) */}
        {currentQuestions.some((q: { questionType?: string }) => q.questionType === 'SCALE' || !q.questionType) && (
          <div className="flex-shrink-0 px-4 py-2 bg-gray-50/80 border-t sm:hidden">
            <div className="flex items-center justify-between text-[11px] text-gray-400 px-9">
              <span>1 = Not at all</span>
              <span>5 = Very much</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex-shrink-0 pt-3 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentSection((p) => Math.max(0, p - 1))}
          disabled={isFirst}
          className="gap-1.5 flex-shrink-0 h-10 sm:h-9"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex-1 text-center">
          <div className="text-xs text-gray-400">{currentSection + 1} / {sections.length}</div>
        </div>

        {isLast ? (
          <Button
            variant="calm"
            size="sm"
            onClick={handleSubmit}
            loading={submitMutation.isPending}
            className="gap-1.5 flex-shrink-0 h-10 sm:h-9"
          >
            Submit
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Button>
        ) : (
          <Button
            variant="calm"
            size="sm"
            onClick={handleNextSection}
            className="gap-1.5 flex-shrink-0 h-10 sm:h-9"
          >
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}

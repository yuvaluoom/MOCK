'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/cn';

// Icons
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const DAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const MONTH_NAMES_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

interface TherapistCalendarProps {
  onSlotSelect?: (date: string, startTime: string, endTime: string) => void;
}

export function TherapistCalendar({ onSlotSelect }: TherapistCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');

  // Get date range for current view
  const dateRange = useMemo(() => {
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    }
    // Month view
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, [currentDate, viewMode]);

  // Fetch availability
  const { data: slots, isLoading, refetch } = trpc.scheduling.getAvailability.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  // Fetch recurring availability
  const { data: recurring } = trpc.scheduling.getRecurringAvailability.useQuery();

  // Mutations
  const blockSlotMutation = trpc.scheduling.blockTimeSlot.useMutation({
    onSuccess: () => refetch(),
  });

  const unblockSlotMutation = trpc.scheduling.unblockTimeSlot.useMutation({
    onSuccess: () => refetch(),
  });

  // Navigation
  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Get week days for current view
  const weekDays = useMemo(() => {
    const start = new Date(dateRange.start);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [dateRange.start]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, typeof slots> = {};
    if (slots) {
      for (const slot of slots) {
        if (!grouped[slot.date]) {
          grouped[slot.date] = [];
        }
        grouped[slot.date]!.push(slot);
      }
    }
    return grouped;
  }, [slots]);

  const handleSlotClick = (slot: any) => {
    if (slot.isBooked) {
      // Show session details
      alert(`פגישה עם ${slot.patientName || 'מטופל'} - ${slot.startTime}-${slot.endTime}`);
    } else if (slot.isBlocked) {
      // Unblock
      if (confirm('לבטל חסימה?')) {
        unblockSlotMutation.mutate({ slotId: slot.id });
      }
    } else {
      // Block or select
      if (onSlotSelect) {
        onSlotSelect(slot.date, slot.startTime, slot.endTime);
      } else {
        if (confirm('לחסום זמן זה?')) {
          blockSlotMutation.mutate({
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        }
      }
    }
  };

  return (
    <Card dir="rtl">
      <CardHeader className="border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">לוח זמנים</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={cn(
                  'px-3 py-1.5 text-sm transition-colors',
                  viewMode === 'week' ? 'bg-calm-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                שבוע
              </button>
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={cn(
                  'px-3 py-1.5 text-sm transition-colors',
                  viewMode === 'month' ? 'bg-calm-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                חודש
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={navigatePrev}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon />
          </button>

          <div className="text-center">
            <h3 className="font-semibold text-gray-900">
              {MONTH_NAMES_HE[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              type="button"
              onClick={navigateToday}
              className="text-xs text-calm-600 hover:text-calm-700"
            >
              היום
            </button>
          </div>

          <button
            type="button"
            onClick={navigateNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Week view */}
        {viewMode === 'week' && (
          <div className="overflow-x-auto">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b">
              {weekDays.map((day, i) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={i}
                    className={cn(
                      'text-center py-3 border-l first:border-l-0',
                      isToday && 'bg-calm-50'
                    )}
                  >
                    <p className="text-xs text-gray-500">{DAY_NAMES_HE[i]}</p>
                    <p className={cn(
                      'text-lg font-semibold',
                      isToday ? 'text-calm-600' : 'text-gray-900'
                    )}>
                      {day.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time slots grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-600" />
              </div>
            ) : (
              <div className="grid grid-cols-7 min-h-[400px]">
                {weekDays.map((day, dayIndex) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const daySlots = slotsByDate[dateStr] || [];
                  const isPast = day < new Date(new Date().toDateString());

                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        'border-l first:border-l-0 p-2 space-y-1',
                        isPast && 'bg-gray-50'
                      )}
                    >
                      {daySlots.length === 0 && !isPast && (
                        <p className="text-xs text-gray-400 text-center py-4">אין זמינות</p>
                      )}
                      {daySlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleSlotClick(slot)}
                          disabled={isPast}
                          className={cn(
                            'w-full text-right px-2 py-1.5 rounded text-xs transition-colors',
                            slot.isBooked && 'bg-green-100 text-green-700 hover:bg-green-200',
                            slot.isBlocked && 'bg-red-100 text-red-700 hover:bg-red-200',
                            !slot.isBooked && !slot.isBlocked && 'bg-gray-100 text-gray-600 hover:bg-calm-100 hover:text-calm-700',
                            isPast && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <span className="font-medium">{slot.startTime}</span>
                          {slot.isBooked && slot.patientName && (
                            <span className="block truncate">{slot.patientName}</span>
                          )}
                          {slot.isBlocked && <span className="block">חסום</span>}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="px-4 py-3 border-t bg-gray-50 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-100 border" />
            <span className="text-gray-600">פנוי</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-100" />
            <span className="text-gray-600">תפוס</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-100" />
            <span className="text-gray-600">חסום</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const DAY_NAMES_HE = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_NAMES_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES_HE = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface PatientBookingProps {
  therapistId: string;
  therapistName: string;
  sessionDuration?: number;
  sessionPrice?: number;
  onBookingComplete?: (sessionId: string) => void;
}

export function PatientBooking({
  therapistId,
  therapistName,
  sessionDuration = 50,
  sessionPrice,
  onBookingComplete,
}: PatientBookingProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day);
    return start;
  });

  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  const [sessionType, setSessionType] = useState<'online' | 'inPerson'>('online');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Calculate week end
  const weekEnd = useMemo(() => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [currentWeekStart]);

  // Fetch available slots
  const { data: slots, isLoading } = trpc.scheduling.getTherapistAvailability.useQuery({
    therapistId,
    startDate: currentWeekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0],
  });

  // Book session mutation
  const bookMutation = trpc.scheduling.bookSession.useMutation({
    onSuccess: (result) => {
      setBookingSuccess(true);
      if (onBookingComplete) {
        onBookingComplete(result.sessionId);
      }
    },
  });

  // Navigation
  const navigatePrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    // Don't go to past weeks
    if (newStart >= new Date(new Date().toDateString())) {
      setCurrentWeekStart(newStart);
    }
  };

  const navigateNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Get week days
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekStart]);

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

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  const handleBook = () => {
    if (!selectedSlot) return;

    bookMutation.mutate({
      therapistId,
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      isOnline: sessionType === 'online',
      notes,
    });
  };

  if (bookingSuccess) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-green-600">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Session booked successfully!</h3>
          <p className="text-gray-600 mb-4">
            You booked a session with {therapistName}
            <br />
            {selectedSlot && (
              <>
                {DAY_NAMES_FULL[new Date(selectedSlot.date).getDay()]} at {selectedSlot.startTime}
              </>
            )}
          </p>
          <p className="text-sm text-gray-500">
            You will receive a confirmation message shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Booking Session</CardTitle>
        <CardDescription>Choose a date and time from the availability of {therapistName}</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {/* Week navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <button
            type="button"
            onClick={navigatePrevWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            disabled={currentWeekStart <= new Date(new Date().toDateString())}
          >
            <ChevronRightIcon />
          </button>

          <div className="text-center">
            <p className="font-medium text-gray-900">
              {currentWeekStart.getDate()} - {weekEnd.getDate()} {MONTH_NAMES_HE[weekEnd.getMonth()]}
            </p>
          </div>

          <button
            type="button"
            onClick={navigateNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon />
          </button>
        </div>

        {/* Calendar grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-600" />
          </div>
        ) : (
          <div className="grid grid-cols-7 divide-x divide-x-reverse">
            {weekDays.map((day, index) => {
              const dateStr = day.toISOString().split('T')[0];
              const daySlots = slotsByDate[dateStr] || [];
              const isToday = day.toDateString() === new Date().toDateString();
              const isPast = day < new Date(new Date().toDateString());

              return (
                <div key={index} className={cn('min-h-[200px]', isPast && 'bg-gray-50')}>
                  {/* Day header */}
                  <div className={cn(
                    'text-center py-2 border-b',
                    isToday && 'bg-calm-50'
                  )}>
                    <p className="text-xs text-gray-500">{DAY_NAMES_HE[index]}</p>
                    <p className={cn(
                      'text-lg font-semibold',
                      isToday ? 'text-calm-600' : 'text-gray-900'
                    )}>
                      {day.getDate()}
                    </p>
                  </div>

                  {/* Time slots */}
                  <div className="p-1.5 space-y-1">
                    {daySlots.length === 0 && !isPast && (
                      <p className="text-xs text-gray-400 text-center py-4">No availability</p>
                    )}
                    {daySlots.map((slot) => {
                      const isSelected = selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleSlotSelect(slot)}
                          className={cn(
                            'w-full text-center py-1.5 rounded text-xs font-medium transition-all',
                            isSelected
                              ? 'bg-calm-600 text-white shadow-sm'
                              : 'bg-calm-50 text-calm-700 hover:bg-calm-100'
                          )}
                        >
                          {slot.startTime}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected slot details */}
        {selectedSlot && (
          <div className="p-4 border-t bg-calm-50">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon />
              <span className="font-medium text-gray-900">
                {DAY_NAMES_FULL[new Date(selectedSlot.date).getDay()]} {new Date(selectedSlot.date).getDate()}/{new Date(selectedSlot.date).getMonth() + 1}
              </span>
              <span className="text-gray-600">
                {selectedSlot.startTime} - {selectedSlot.endTime}
              </span>
              {sessionPrice && (
                <span className="mr-auto text-calm-700 font-medium">
                  ₪{sessionPrice}
                </span>
              )}
            </div>

            {/* Session type selection */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Type Session</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSessionType('online')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors',
                    sessionType === 'online'
                      ? 'bg-calm-600 text-white border-calm-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-calm-400'
                  )}
                >
                  <VideoIcon />
                  <span>Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSessionType('inPerson')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors',
                    sessionType === 'inPerson'
                      ? 'bg-calm-600 text-white border-calm-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-calm-400'
                  )}
                >
                  <MapPinIcon />
                  <span>In-Person</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What would you like to share with the therapist before the session?"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-calm-500 focus:border-transparent"
                rows={2}
              />
            </div>

            {/* Book button */}
            <Button
              variant="calm"
              className="w-full"
              onClick={handleBook}
              loading={bookMutation.isPending}
            >
              Confirm Booking Session
            </Button>

            {bookMutation.error && (
              <p className="text-sm text-red-600 mt-2 text-center">
                {bookMutation.error.message}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

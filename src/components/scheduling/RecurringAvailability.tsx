'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/cn';

const DAY_NAMES_HE = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIME_OPTIONS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00'
];

export function RecurringAvailability() {
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEndTime, setEditEndTime] = useState('17:00');

  const { data: recurring, isLoading, refetch } = trpc.scheduling.getRecurringAvailability.useQuery();

  const setAvailabilityMutation = trpc.scheduling.setRecurringAvailability.useMutation({
    onSuccess: () => {
      refetch();
      setEditingDay(null);
    },
  });

  const handleSave = (dayOfWeek: number, isActive: boolean) => {
    setAvailabilityMutation.mutate({
      dayOfWeek,
      startTime: editStartTime,
      endTime: editEndTime,
      isActive,
    });
  };

  const handleEdit = (dayOfWeek: number) => {
    const existing = recurring?.find((r) => r.dayOfWeek === dayOfWeek);
    if (existing) {
      setEditStartTime(existing.startTime);
      setEditEndTime(existing.endTime);
    }
    setEditingDay(dayOfWeek);
  };

  const getRecurringForDay = (dayOfWeek: number) => {
    return recurring?.find((r) => r.dayOfWeek === dayOfWeek);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recurring Availability</CardTitle>
        <CardDescription>Set your regular hours for each day of the week</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {DAY_NAMES_HE.map((dayName, index) => {
              const dayData = getRecurringForDay(index);
              const isEditing = editingDay === index;

              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors',
                    dayData?.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-medium',
                      dayData?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                    )}>
                      {dayName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{dayName}</p>
                      {dayData?.isActive ? (
                        <p className="text-sm text-gray-600">
                          {dayData.startTime} - {dayData.endTime}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">Not available</p>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        className="text-sm border rounded-md px-2 py-1"
                        dir="ltr"
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="text-gray-400">-</span>
                      <select
                        value={editEndTime}
                        onChange={(e) => setEditEndTime(e.target.value)}
                        className="text-sm border rounded-md px-2 py-1"
                        dir="ltr"
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="calm"
                        onClick={() => handleSave(index, true)}
                        loading={setAvailabilityMutation.isPending}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingDay(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="text-sm text-calm-600 hover:text-calm-700 font-medium"
                      >
                        Edit
                      </button>
                      {dayData?.isActive && (
                        <button
                          type="button"
                          onClick={() => handleSave(index, false)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <h4 className="font-medium text-blue-900 text-sm mb-1">Tips for setting availability</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Recurring availability repeats every week</li>
            <li>• You can block specific times in the calendar</li>
            <li>• Patients will only see your available times</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

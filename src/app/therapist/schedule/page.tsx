'use client';

import { useState } from 'react';
import { TherapistCalendar } from '@/components/scheduling/TherapistCalendar';
import { RecurringAvailability } from '@/components/scheduling/RecurringAvailability';

type TabType = 'calendar' | 'recurring';

export default function TherapistSchedulePage() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ניהול לוח זמנים</h1>
        <p className="text-gray-600 mt-1">נהלו את הזמינות שלכם וצפו בפגישות מתוכננות</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'calendar'
              ? 'bg-calm-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          לוח שנה
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('recurring')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'recurring'
              ? 'bg-calm-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          זמינות קבועה
        </button>
      </div>

      {/* Content */}
      {activeTab === 'calendar' && <TherapistCalendar />}
      {activeTab === 'recurring' && <RecurringAvailability />}

      {/* Help section */}
      <div className="bg-gray-50 rounded-xl p-6 border">
        <h3 className="font-semibold text-gray-900 mb-3">כיצד לנהל את הזמינות שלכם</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-calm-100 text-calm-700 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">הגדירו זמינות קבועה</p>
              <p className="text-gray-600">קבעו את השעות הקבועות שלכם בכל יום</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-calm-100 text-calm-700 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">חסמו זמנים לפי צורך</p>
              <p className="text-gray-600">סמנו ימים או שעות שבהם אינכם זמינים</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-calm-100 text-calm-700 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">מטופלים יזמינו</p>
              <p className="text-gray-600">המטופלים יראו את הזמינות ויקבעו פגישות</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

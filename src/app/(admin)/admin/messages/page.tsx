'use client';

import { useState } from 'react';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const FlagIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className ?? "w-4 h-4"}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" x2="4" y1="22" y2="15" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default function MessageModerationPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // No hardcoded mock data - this page is a placeholder for when a real
  // flagging/moderation system is connected. In the current mock setup
  // there are no flagged messages since messaging is simulated.

  const filterLabels: Record<string, string> = {
    pending: 'ממתינים',
    reviewed: 'נבדקו',
    all: 'הכל',
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ניהול הודעות</h1>
          <p className="text-slate-400 mt-1">
            בדיקת הודעות מדווחות ומסומנות
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-sm bg-green-500/20 text-green-400 rounded-lg">
            0 ממתינים לבדיקה
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="חיפוש בהודעות..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex gap-2">
            {(['pending', 'reviewed', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {filterLabels[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-16 text-center">
        <div className="flex justify-center mb-4 text-green-400">
          <ShieldIcon />
        </div>
        <p className="text-white font-medium text-lg">אין הודעות מסומנות לבדיקה</p>
        <p className="text-slate-400 text-sm mt-2">
          כל ההודעות בפלטפורמה תקינות. הודעות שיסומנו על ידי מערכת הסינון האוטומטית או דיווחי משתמשים יופיעו כאן.
        </p>
      </div>

      {/* Moderation Guidelines */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-medium text-white mb-4">הנחיות ניהול</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="text-amber-400 font-medium mb-2">טריגרים לסימון אוטומטי</h4>
            <ul className="text-slate-400 space-y-1">
              <li>• מילות מפתח של מצב חירום / משבר</li>
              <li>• תוכן לא הולם</li>
              <li>• שיתוף פרטי קשר חיצוניים</li>
              <li>• דיווחי משתמשים</li>
            </ul>
          </div>
          <div>
            <h4 className="text-green-400 font-medium mb-2">אישור הודעה אם</h4>
            <ul className="text-slate-400 space-y-1">
              <li>• התראת שווא ממילת מפתח</li>
              <li>• הקשר קליני מתאים</li>
              <li>• אין הפרת מדיניות</li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-400 font-medium mb-2">הסרת הודעה אם</h4>
            <ul className="text-slate-400 space-y-1">
              <li>• הפרה ברורה של מדיניות</li>
              <li>• הטרדה או התעללות</li>
              <li>• ספאם או שידול</li>
              <li>• מידע מסוכן שגוי</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

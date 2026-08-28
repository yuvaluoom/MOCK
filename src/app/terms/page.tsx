'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-calm-50/30 to-white py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">תנאי שימוש</h1>
        <div className="bg-white rounded-2xl shadow-sm p-8 text-gray-600 leading-relaxed space-y-4">
          <p>
            עמוד זה יכיל את תנאי השימוש המלאים של פלטפורמת MatchMind.
          </p>
          <p>
            השימוש בפלטפורמה כפוף לתנאים המפורטים בעמוד זה. אנא קראו אותם בעיון לפני השימוש בשירות.
          </p>
          <p className="text-sm text-muted-foreground">העמוד בבנייה.</p>
        </div>
        <Link href="/" className="inline-block mt-8 text-calm-600 hover:text-calm-700 font-medium transition-colors">
          &larr; חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}

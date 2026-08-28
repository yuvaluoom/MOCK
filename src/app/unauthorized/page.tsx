'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/30 to-white flex items-center justify-center py-20">
      <div className="container mx-auto px-4 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-red-500" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">אין הרשאה</h1>
        <p className="text-gray-600 mb-8">
          אין לכם הרשאה לגשת לעמוד זה. אנא התחברו עם חשבון מתאים או חזרו לדף הבית.
        </p>
        <Link href="/" className="inline-block px-6 py-3 bg-trust-600 hover:bg-trust-700 text-white font-medium rounded-lg transition-colors">
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}

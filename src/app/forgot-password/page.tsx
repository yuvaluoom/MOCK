'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-calm-50/30 to-white flex items-center justify-center py-20">
      <div className="container mx-auto px-4 max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">שחזור סיסמה</h1>
        <p className="text-gray-600 text-center mb-8">הזינו את כתובת האימייל שלכם ונשלח לכם קישור לאיפוס הסיסמה.</p>
        {submitted ? (
          <div className="bg-calm-50 rounded-2xl p-8 text-center text-calm-700">
            <p className="font-medium">הקישור נשלח בהצלחה!</p>
            <p className="text-sm mt-2">בדקו את תיבת הדואר הנכנס שלכם.</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="bg-white rounded-2xl shadow-sm p-8 space-y-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">אימייל</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-500 focus:border-transparent"
            />
            <button type="submit" className="w-full py-3 bg-calm-600 hover:bg-calm-700 text-white font-medium rounded-lg transition-colors">
              שליחת קישור איפוס
            </button>
          </form>
        )}
        <Link href="/" className="inline-block mt-8 text-calm-600 hover:text-calm-700 font-medium transition-colors">
          &larr; חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}

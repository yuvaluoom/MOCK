'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-calm-50/30 to-white flex items-center justify-center py-20">
      <div className="container mx-auto px-4 max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Reset Password</h1>
        <p className="text-gray-600 text-center mb-8">Enter your email address and we&#39;ll send you a password reset link.</p>
        {submitted ? (
          <div className="bg-calm-50 rounded-2xl p-8 text-center text-calm-700">
            <svg className="w-12 h-12 mx-auto mb-4 text-calm-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="font-medium text-lg">Check your email</p>
            <p className="text-sm mt-2">
              We sent a password reset link to <span className="font-medium">{email}</span>
            </p>
            <p className="text-xs text-calm-500 mt-4">
              Didn&#39;t receive the email? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="underline hover:text-calm-800"
              >
                try again
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-calm-600 hover:bg-calm-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
        <Link href="/" className="inline-block mt-8 text-calm-600 hover:text-calm-700 font-medium transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

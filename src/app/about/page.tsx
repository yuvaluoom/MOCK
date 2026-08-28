'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50/30 to-white py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">orדs MatchMind</h1>
        <div className="bg-white rounded-2xl shadow-sm p-8 text-gray-600 leading-relaxed space-y-4">
          <p>
            MatchMind היא A smart platform for matching patients and therapists בתחום בריorת הנפש.
          </p>
          <p>
            אנחנו מאמינs שMatch נכונה בין Patient לTherapist היא המפתח להצלחת הTherapy, ולYes פיתחנו מערכת מבוססת מדע שמזהה את הMatch הGoodה ביsר.
          </p>
          <p className="text-sm text-muted-foreground">Page under construction.</p>
        </div>
        <Link href="/" className="inline-block mt-8 text-trust-600 hover:text-trust-700 font-medium transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

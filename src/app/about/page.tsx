'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50/30 to-white py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About MatchMind</h1>
        <div className="bg-white rounded-2xl shadow-sm p-8 text-gray-600 leading-relaxed space-y-6">
          <p>
            MatchMind is a smart platform for matching patients and therapists in the mental health field.
          </p>
          <p>
            We believe that the right match between a patient and therapist is the key to successful therapy. That&#39;s why we developed a science-based system that identifies the best possible match.
          </p>
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-calm-50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">&#x1F4CB;</div>
                <h3 className="font-medium text-gray-900 mb-1">Complete Questionnaire</h3>
                <p className="text-sm">Answer questions about your preferences and therapeutic needs</p>
              </div>
              <div className="bg-trust-50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">&#x1F916;</div>
                <h3 className="font-medium text-gray-900 mb-1">AI-Powered Matching</h3>
                <p className="text-sm">Our algorithm analyzes compatibility across multiple dimensions</p>
              </div>
              <div className="bg-calm-50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">&#x1F91D;</div>
                <h3 className="font-medium text-gray-900 mb-1">Find Your Match</h3>
                <p className="text-sm">Review personalized recommendations and connect with your ideal therapist</p>
              </div>
            </div>
          </div>
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
            <p>
              Access to quality mental health care starts with the right therapist-patient relationship.
              MatchMind leverages advanced matching algorithms and clinical insights to create meaningful
              therapeutic connections, making the process simpler and more effective for everyone.
            </p>
          </div>
        </div>
        <Link href="/" className="inline-block mt-8 text-trust-600 hover:text-trust-700 font-medium transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

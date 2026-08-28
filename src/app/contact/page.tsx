'use client';

import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50/30 to-white py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <div className="bg-white rounded-2xl shadow-sm p-8 text-gray-600 leading-relaxed space-y-4">
          <p>
            We'd love to hear from you! אם יש לכם שאלs, הצעs or משוב, אנא פנו אלינו.
          </p>
          <p>
            Email: <span className="text-trust-600 font-medium">support@matchmind.co.il</span>
          </p>
          <p className="text-sm text-muted-foreground">טופס יצירת קשר מNo יתווסף Coming soon.</p>
        </div>
        <Link href="/" className="inline-block mt-8 text-trust-600 hover:text-trust-700 font-medium transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

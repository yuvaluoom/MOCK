'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust-50/30 to-white py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <p className="text-gray-600 leading-relaxed">
            We&#39;d love to hear from you! If you have questions, suggestions, or feedback, please reach out.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-trust-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-1">Email</h3>
              <p className="text-trust-600 font-medium">support@matchmind.co.il</p>
            </div>
            <div className="bg-calm-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-1">Working Hours</h3>
              <p className="text-gray-600 text-sm">Sun-Thu, 9:00-17:00</p>
            </div>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <svg className="w-10 h-10 mx-auto mb-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium text-green-800">Thank you for reaching out!</p>
              <p className="text-sm text-green-600 mt-1">We&#39;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900">Send a Message</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-trust-600 hover:bg-trust-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
        <Link href="/" className="inline-block mt-8 text-trust-600 hover:text-trust-700 font-medium transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

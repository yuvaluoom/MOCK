'use client';

import { useState } from 'react';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default function MessageModerationPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const filterLabels: Record<string, string> = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    all: 'All',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message Moderation</h1>
          <p className="text-gray-500 mt-1">
            Review reported and flagged messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-sm font-medium bg-green-50 text-green-700 rounded-lg border border-green-200">
            0 Pending review
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
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
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterLabels[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
        <div className="flex justify-center mb-4 text-green-500">
          <ShieldCheckIcon />
        </div>
        <p className="text-gray-900 font-semibold text-lg">No flagged messages to review</p>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
          All messages on the platform are compliant. Messages flagged by the automatic filter system or user reports will appear here for review.
        </p>
      </div>

      {/* Moderation Guidelines */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Moderation Guidelines</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="text-amber-600 font-semibold mb-2">Automatic Flagging Triggers</h4>
            <ul className="text-gray-500 space-y-1.5">
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">&#8226;</span> Emergency / crisis keywords</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">&#8226;</span> Inappropriate content</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">&#8226;</span> Sharing private external contact info</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">&#8226;</span> User reports</li>
            </ul>
          </div>
          <div>
            <h4 className="text-green-600 font-semibold mb-2">Approve Message If</h4>
            <ul className="text-gray-500 space-y-1.5">
              <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">&#8226;</span> False alarm from keyword match</li>
              <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">&#8226;</span> Appropriate clinical context</li>
              <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">&#8226;</span> No policy violation</li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-600 font-semibold mb-2">Remove Message If</h4>
            <ul className="text-gray-500 space-y-1.5">
              <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#8226;</span> Clear policy violation</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#8226;</span> Harassment or abuse</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#8226;</span> Spam or solicitation</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#8226;</span> Incorrect sensitive information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-amber-500">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-calm-500 to-trust-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MatchMind</span>
          </Link>
          <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Pending Approval
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <ClockIcon />
              </div>
              <CardTitle className="text-2xl">Application Under Review</CardTitle>
              <CardDescription className="text-base mt-2">
                Thank you for registering as a therapist on MatchMind. Your application is currently being reviewed by our team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Steps */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckIcon />
                  <div>
                    <p className="font-medium text-gray-900">Account Created</p>
                    <p className="text-sm text-gray-600">Your account has been successfully created</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Under Review</p>
                    <p className="text-sm text-gray-600">Our team is reviewing your credentials</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                  <div>
                    <p className="font-medium text-gray-400">Approval</p>
                    <p className="text-sm text-gray-400">Pending review completion</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-trust-50 border border-trust-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Our team will verify your professional credentials</li>
                  <li>• You may be contacted for additional documentation</li>
                  <li>• Review typically takes 1-3 business days</li>
                  <li>• You&apos;ll receive an email once your account is approved</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Link href="/therapist/complete-profile">
                  <Button variant="calm" className="w-full">
                    Complete Your Profile
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Return to Home
                  </Button>
                </Link>
              </div>

              {/* Contact */}
              <p className="text-center text-sm text-gray-500">
                Questions? Contact us at{' '}
                <a href="mailto:support@matchmind.com" className="text-primary hover:underline">
                  support@matchmind.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

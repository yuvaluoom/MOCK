'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always required
  analytics: false,
  marketing: false,
};

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    savePreferences(defaultPreferences);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border overflow-hidden">
        {!showSettings ? (
          // Main banner
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Cookie icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-600">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="8" cy="9" r="1" fill="currentColor" />
                  <circle cx="15" cy="8" r="1" fill="currentColor" />
                  <circle cx="10" cy="14" r="1" fill="currentColor" />
                  <circle cx="16" cy="14" r="1" fill="currentColor" />
                </svg>
              </div>

              {/* Text content */}
              <div className="flex-1">
                <h2 id="cookie-title" className="text-lg font-semibold text-gray-900 mb-1">
                  We value your privacy
                </h2>
                <p id="cookie-description" className="text-sm text-gray-600 mb-4">
                  We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic.
                  By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or learn more in our{' '}
                  <Link href="/privacy" className="text-calm-600 hover:underline focus:outline-none focus:underline">
                    Privacy Policy
                  </Link>.
                </p>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="calm"
                    onClick={handleAcceptAll}
                    className="min-w-[120px]"
                  >
                    Accept All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRejectAll}
                    className="min-w-[120px]"
                  >
                    Reject All
                  </Button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-sm text-gray-600 hover:text-gray-900 underline focus:outline-none focus:ring-2 focus:ring-calm-500 rounded"
                  >
                    Cookie Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Settings panel
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Cookie Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-calm-500"
                aria-label="Back to main banner"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Customize your cookie preferences below. Essential cookies are required for the website to function properly and cannot be disabled.
            </p>

            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Essential Cookies</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Required for basic website functionality, security, and accessibility features.
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Required
                  </span>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Analytics Cookies</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Help us understand how visitors interact with our website to improve our services.
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.analytics}
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-2 ${
                      preferences.analytics ? 'bg-calm-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        preferences.analytics ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Marketing Cookies</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Used to track visitors across websites to display relevant advertisements.
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.marketing}
                    onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-2 ${
                      preferences.marketing ? 'bg-calm-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        preferences.marketing ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Settings action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="calm"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </Button>
              <Button
                variant="outline"
                onClick={handleAcceptAll}
              >
                Accept All
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

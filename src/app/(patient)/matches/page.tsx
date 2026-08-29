'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';

// ============ ICONS ============

const BrainIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const VideoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const HeartIcon = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-amber-500 mx-auto mb-4">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const GraduationCapIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LanguagesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

// ============ COMPONENTS ============

function MatchScoreCircle({ score, quality, size = 'md' }: { score: number; quality: string; size?: 'sm' | 'md' | 'lg' }) {
  const qualityColors: Record<string, string> = {
    excellent: 'text-green-600',
    great: 'text-blue-600',
    good: 'text-cyan-600',
    moderate: 'text-amber-600',
    low: 'text-gray-500',
  };

  const ringColors: Record<string, string> = {
    excellent: 'stroke-green-500',
    great: 'stroke-blue-500',
    good: 'stroke-cyan-500',
    moderate: 'stroke-amber-500',
    low: 'stroke-gray-400',
  };

  const sizes = {
    sm: { container: 'w-14 h-14', text: 'text-sm' },
    md: { container: 'w-20 h-20', text: 'text-xl' },
    lg: { container: 'w-28 h-28', text: 'text-2xl' },
  };

  const colorClass = qualityColors[quality] || 'text-gray-500';
  const ringColor = ringColors[quality] || 'stroke-gray-400';
  const sizeClass = sizes[size];

  return (
    <div className={`relative ${sizeClass.container}`} role="img" aria-label={`Match score: ${score}%`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          className={`${ringColor} transition-all duration-1000 ease-out`}
          strokeWidth="3"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${sizeClass.text} font-bold ${colorClass}`}>
          {score}%
        </span>
      </div>
    </div>
  );
}

function FactorIcon({ factorKey }: { factorKey: string }) {
  const className = "w-4 h-4";
  switch (factorKey) {
    case 'xFactor': return <BrainIcon className={className} />;
    case 'healthFund': return <ShieldIcon className={className} />;
    case 'availability': return <VideoIcon className={className} />;
    case 'preferences': return <UserIcon className={className} />;
    default: return <StarIcon className={className} />;
  }
}

function MatchFactorBar({ factor }: { factor: { key: string; label: string; score: number; weight: number; reasons: string[] } }) {
  const scoreColor = factor.score >= 80 ? 'bg-green-500' :
                     factor.score >= 60 ? 'bg-blue-500' :
                     factor.score >= 40 ? 'bg-amber-500' : 'bg-gray-400';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <FactorIcon factorKey={factor.key} />
          <span>{factor.label}</span>
          <span className="text-xs text-gray-400">({Math.round(factor.weight * 100)}%)</span>
        </div>
        <span className="font-medium">{factor.score}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${scoreColor} rounded-full transition-all duration-500`}
          style={{ width: `${factor.score}%` }}
          role="progressbar"
          aria-valuenow={factor.score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {factor.reasons.length > 0 && (
        <p className="text-xs text-gray-500 pl-6">{factor.reasons[0]}</p>
      )}
    </div>
  );
}

// Therapist Detail Modal
interface TherapistModalProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
}

function TherapistDetailModal({ match, isOpen, onClose }: TherapistModalProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingIsOnline, setBookingIsOnline] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { data: profile } = trpc.patient.getProfile.useQuery();
  const utils = trpc.useUtils();

  const requestSessionMutation = trpc.session.requestSession.useMutation({
    onSuccess: () => {
      setBookingSuccess(true);
      setShowBookingForm(false);
      utils.patient.getSessions.invalidate();
    },
  });

  // Compute a default datetime: next weekday at 10:00
  const getDefaultDateTime = useCallback(() => {
    const now = new Date();
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    // Skip to Monday if Saturday or Sunday
    while (next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1);
    }
    next.setHours(10, 0, 0, 0);
    // Format as datetime-local value
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`;
  }, []);

  const handleRequestAppointment = () => {
    setBookingDate(getDefaultDateTime());
    setBookingIsOnline(true);
    setBookingSuccess(false);
    setShowBookingForm(true);
  };

  const handleConfirmBooking = () => {
    if (!match?.therapistId || !bookingDate) return;
    requestSessionMutation.mutate({
      therapistId: match.therapistId,
      scheduledAt: new Date(bookingDate).toISOString(),
      duration: 50,
      type: 'INITIAL_CONSULTATION',
      isOnline: bookingIsOnline,
      ...(profile?.healthFund ? { healthFund: profile.healthFund as any } : {}),
    });
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Reset booking state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowBookingForm(false);
      setBookingSuccess(false);
      requestSessionMutation.reset();
    }
  }, [isOpen]);

  if (!isOpen || !match) return null;

  const therapist = match.therapist;
  const qualityBadgeColors: Record<string, string> = {
    excellent: 'bg-green-100 text-green-700 border-green-200',
    great: 'bg-blue-100 text-blue-700 border-blue-200',
    good: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    moderate: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-calm-500 to-trust-500 px-6 py-8 text-white flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-white/90">
                {therapist?.firstName?.charAt(0)}
              </span>
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 id="modal-title" className="text-2xl font-bold">
                  {therapist?.title} {therapist?.firstName} {therapist?.lastName}
                </h2>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${qualityBadgeColors[match.matchQuality]}`}>
                  {match.matchQualityLabel}
                </span>
              </div>
              <p className="text-white/80 mt-1">{therapist?.licenseType}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {therapist?.city}
                </span>
                <span>{therapist?.yearsOfExperience} years experience</span>
              </div>
            </div>

            {/* Score Circle */}
            <div className="flex-shrink-0 hidden sm:block">
              <MatchScoreCircle score={match.overallScore} quality={match.matchQuality} size="lg" />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Match Score Mobile */}
          <div className="sm:hidden flex justify-center">
            <MatchScoreCircle score={match.overallScore} quality={match.matchQuality} size="lg" />
          </div>

          {/* Why We Matched You */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BrainIcon className="w-5 h-5 text-calm-600" />
              Why We Matched You
            </h3>
            <div className="bg-calm-50 rounded-xl p-4 space-y-3">
              {match.topReasons.map((reason: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{reason}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Match Breakdown */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Match Breakdown</h3>
            <div className="space-y-4">
              {match.factors.map((factor: any) => (
                <MatchFactorBar key={factor.key} factor={factor} />
              ))}
            </div>
          </section>

          {/* About */}
          {therapist?.bio && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">{therapist.bio}</p>
            </section>
          )}

          {/* Qualifications */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <GraduationCapIcon className="w-5 h-5 text-trust-600" />
              Qualifications & Experience
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">License</p>
                <p className="text-sm font-medium text-gray-900">{therapist?.licenseType}</p>
                <p className="text-xs text-gray-500">#{therapist?.licenseNumber}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Experience</p>
                <p className="text-sm font-medium text-gray-900">{therapist?.yearsOfExperience} years</p>
              </div>
            </div>
          </section>

          {/* Specializations */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {therapist?.specializations?.map((s: string) => (
                <span
                  key={s}
                  className="text-sm px-3 py-1.5 rounded-full bg-calm-50 text-calm-700 border border-calm-200"
                >
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </section>

          {/* Therapy Methods */}
          {therapist?.therapyMethods && therapist.therapyMethods.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Therapy Methods</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.therapyMethods.map((method: string) => (
                  <span
                    key={method}
                    className="text-sm px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    {method.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Session Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-gray-600" />
              Session Details
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">₪{therapist?.sessionPrice}</p>
                <p className="text-xs text-gray-500">per session</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{therapist?.sessionDuration}</p>
                <p className="text-xs text-gray-500">minutes</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Available</p>
                <div className="flex flex-wrap gap-1">
                  {therapist?.offersOnline && (
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Online</span>
                  )}
                  {therapist?.offersInPerson && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">In-Person</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Insurance / Health Funds */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ShieldIcon className="w-5 h-5 text-trust-600" />
              Insurance & Health Funds
            </h3>
            <div className="flex flex-wrap gap-2">
              {therapist?.acceptedHealthFunds?.map((fund: string) => (
                <span
                  key={fund}
                  className="text-sm px-3 py-1.5 rounded-full bg-trust-50 text-trust-700 border border-trust-200"
                >
                  {fund}
                </span>
              ))}
              {(!therapist?.acceptedHealthFunds || therapist.acceptedHealthFunds.length === 0) && (
                <p className="text-sm text-gray-500">No health fund information available</p>
              )}
            </div>
          </section>

          {/* Languages */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <LanguagesIcon className="w-5 h-5 text-gray-600" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {therapist?.languages?.map((lang: string) => (
                <span
                  key={lang}
                  className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700"
                >
                  {lang}
                </span>
              ))}
            </div>
          </section>

          {/* Warnings or Notes */}
          {match.warnings && match.warnings.length > 0 && (
            <section>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Note: </span>
                  {match.warnings.join(' • ')}
                </p>
              </div>
            </section>
          )}

          {/* Insights */}
          {match.insights && match.insights.length > 0 && (
            <section>
              <div className="flex flex-wrap gap-2">
                {match.insights.map((insight: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    ✨ {insight}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t space-y-4">
          {bookingSuccess && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800 font-medium">
                Request sent! The therapist will review your request.
              </p>
            </div>
          )}

          {requestSessionMutation.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">
                {requestSessionMutation.error.message || 'Failed to send request. Please try again.'}
              </p>
            </div>
          )}

          {showBookingForm && (
            <div className="p-4 bg-white border border-calm-200 rounded-xl space-y-4">
              <h4 className="text-sm font-semibold text-gray-900">Schedule Your Appointment</h4>
              <div className="space-y-3">
                <div>
                  <label htmlFor="booking-date" className="block text-sm text-gray-600 mb-1">
                    Preferred Date & Time
                  </label>
                  <input
                    id="booking-date"
                    type="datetime-local"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
                  />
                </div>
                <div>
                  <span className="block text-sm text-gray-600 mb-1">Session Type</span>
                  <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden" role="group" aria-label="Session type">
                    <button
                      type="button"
                      onClick={() => setBookingIsOnline(true)}
                      className={`flex-1 px-4 py-2 text-sm transition-colors ${
                        bookingIsOnline
                          ? 'bg-calm-500 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      aria-pressed={bookingIsOnline}
                    >
                      Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingIsOnline(false)}
                      className={`flex-1 px-4 py-2 text-sm transition-colors ${
                        !bookingIsOnline
                          ? 'bg-calm-500 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      aria-pressed={!bookingIsOnline}
                    >
                      In-Person
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBookingForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="calm"
                  size="sm"
                  onClick={handleConfirmBooking}
                  disabled={!bookingDate || requestSessionMutation.isPending}
                >
                  {requestSessionMutation.isPending ? 'Sending...' : 'Confirm Request'}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex items-center gap-3">
              <Link href={`/messages?therapist=${match.therapistId}`}>
                <Button variant="outline" className="gap-2">
                  <MessageIcon className="w-4 h-4" />
                  Message
                </Button>
              </Link>
              {!bookingSuccess && (
                <Button
                  variant="calm"
                  className="gap-2"
                  onClick={handleRequestAppointment}
                  disabled={showBookingForm}
                >
                  Request Appointment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: any;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  onViewDetails: () => void;
}

function MatchCard({ match, expanded, onToggleExpand, onToggleFavorite, onViewDetails }: MatchCardProps) {
  const qualityBadgeColors: Record<string, string> = {
    excellent: 'bg-green-100 text-green-700 border-green-200',
    great: 'bg-blue-100 text-blue-700 border-blue-200',
    good: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    moderate: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const qualityLabelsHe: Record<string, string> = {
    excellent: 'Excellent Match',
    great: 'Great Match',
    good: 'Good Match',
    moderate: 'Moderate Match',
    low: 'Low Match',
  };

  // Safely get therapist ID with validation
  const therapistId = match.therapist?.id || match.therapistId;
  const hasValidTherapist = !!(therapistId && match.therapist);
  // Route to /therapist/[id] which exists under (patient) group
  const therapistLink = hasValidTherapist ? `/therapist/${therapistId}` : '/matches';

  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        {/* Main Content */}
        <div className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar - Clickable only if valid therapist */}
            <Link
              href={therapistLink}
              className={`flex-shrink-0 relative group ${!hasValidTherapist ? 'pointer-events-none' : ''}`}
              aria-disabled={!hasValidTherapist}
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-calm-100 to-trust-100 flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-calm-400 transition-all">
                {match.therapist?.photoUrl ? (
                  <img src={match.therapist.photoUrl} alt={match.therapist?.firstName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-calm-700 font-bold text-2xl">
                    {match.therapist?.firstName?.charAt(0) ?? 'T'}
                  </span>
                )}
              </div>
              {match.therapist?.offersOnline && (
                <span className="absolute -bottom-1 -left-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center" title="Offers Online Sessions">
                  <VideoIcon className="w-3 h-3 text-white" />
                </span>
              )}
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Link
                      href={therapistLink}
                      className={`hover:text-calm-600 transition-colors ${!hasValidTherapist ? 'pointer-events-none' : ''}`}
                      aria-disabled={!hasValidTherapist}
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        {match.therapist?.title} {match.therapist?.firstName} {match.therapist?.lastName}
                      </h3>
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${qualityBadgeColors[match.matchQuality]}`}>
                      {qualityLabelsHe[match.matchQuality] || match.matchQualityLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {match.therapist?.city}
                    </span>
                    <span>{match.therapist?.yearsOfExperience} years experience</span>
                    <span>₪{match.therapist?.sessionPrice}/Session</span>
                  </div>
                </div>

                {/* Score Circle */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <MatchScoreCircle score={match.overallScore} quality={match.matchQuality} />
                  <span className="text-xs text-gray-400 mt-1">Match Score</span>
                </div>
              </div>

              {/* Top Reasons */}
              <div className="mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">Why this match: </span>
                  {match.topReasons.slice(0, 2).join(' • ')}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {match.therapist?.specializations?.slice(0, 3).map((s: string) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-full bg-calm-50 text-calm-700 border border-calm-200"
                  >
                    {s.replace(/_/g, ' ')}
                  </span>
                ))}
                {match.therapist?.acceptedHealthFunds?.slice(0, 2).map((f: string) => (
                  <span
                    key={f}
                    className="text-xs px-2.5 py-1 rounded-full bg-trust-50 text-trust-700 border border-trust-200"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Session Options */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {match.therapist?.offersOnline && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Online Sessions
                  </span>
                )}
                {match.therapist?.offersInPerson && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    In-Person Sessions
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  {match.therapist?.sessionDuration} min/session
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Toggle */}
        <button
          onClick={onToggleExpand}
          className="w-full px-6 py-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-calm-500"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <ChevronUpIcon className="w-4 h-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4" />
              Why this match?
            </>
          )}
        </button>

        {/* Expanded Details */}
        {expanded && (
          <div className="px-6 py-5 bg-gray-50 border-t space-y-6">
            {/* Factor Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Match Breakdown</h4>
              <div className="space-y-4">
                {match.factors.map((factor: any) => (
                  <MatchFactorBar key={factor.key} factor={factor} />
                ))}
              </div>
            </div>

            {/* Match Explanation Items */}
            {match.explanationItems && match.explanationItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Match Score: {match.overallScore}%</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {match.explanationItems.map((item: any, i: number) => (
                    <div key={i} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                      item.matched ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      {item.matched ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-600 flex-shrink-0">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <path d="m9 11 3 3L22 4" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-500 flex-shrink-0">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      )}
                      <span className={item.matched ? 'text-green-800' : 'text-red-700'}>{item.labelEn}</span>
                    </div>
                  ))}
                </div>
                {/* Score sub-breakdown */}
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  {match.objectiveFitScore !== undefined && (
                    <span>Objective Fit: <strong className="text-gray-700">{match.objectiveFitScore}%</strong></span>
                  )}
                  {match.subjectiveFitScore !== undefined && (
                    <span>Subjective Fit: <strong className="text-gray-700">{match.subjectiveFitScore}%</strong></span>
                  )}
                </div>
              </div>
            )}

            {/* Warnings */}
            {match.warnings.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Note: </span>
                  {match.warnings.join(' • ')}
                </p>
              </div>
            )}

            {/* Insights */}
            {match.insights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {match.insights.map((insight: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    ✨ {insight}
                  </span>
                ))}
              </div>
            )}

            {/* Bio */}
            {match.therapist?.bioHebrew || match.therapist?.bio ? (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">About the Therapist</h4>
                <p className="text-sm text-gray-600">{match.therapist.bioHebrew || match.therapist.bio}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Action Bar */}
        <div className="px-6 py-4 bg-white border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-calm-500 ${
                match.isFavorited
                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
              aria-label={match.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={match.isFavorited}
            >
              <HeartIcon className="w-5 h-5" filled={match.isFavorited} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {therapistId && (
              <Link href={`/messages?therapist=${therapistId}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageIcon className="w-4 h-4" />
                  Message
                </Button>
              </Link>
            )}
            {hasValidTherapist && (
              <Button variant="calm" size="sm" asChild>
                <Link href={therapistLink}>
                  Full Profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ MAIN PAGE ============

export default function MatchesPage() {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<'all' | 'online' | 'inPerson'>('all');
  const [healthFundMatch, setHealthFundMatch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check questionnaire completion status
  const { data: profile, isLoading: profileLoading } = trpc.patient.getProfile.useQuery();

  const { data, isLoading: matchesLoading, refetch } = trpc.patient.getMatches.useQuery(
    {
      page: 1,
      limit: 20,
      sessionType,
      healthFundMatch: healthFundMatch || undefined,
    },
    {
      enabled: profile?.questionnaireCompleted === true,
    }
  );

  const toggleFavoriteMutation = trpc.patient.toggleMatchFavorite.useMutation({
    onSuccess: () => refetch(),
  });

  const questionnaireCompleted = profile?.questionnaireCompleted ?? false;
  const onboardingCompleted = profile?.onboardingCompleted ?? false;
  const matches = data?.matches ?? [];
  const filterStats = data?.filterStats;

  const handleViewDetails = useCallback((match: any) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  }, []);

  // Loading state
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-600" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // If questionnaire not completed, show prompt
  if (!questionnaireCompleted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommended Therapists</h1>
          <p className="text-gray-600 mt-1">Science-based matches based on your profile and preferences</p>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-12 text-center">
            <ClipboardIcon />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your X-Factor Questionnaire First</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              To provide you with accurate, science-based therapist matches, we need to understand your preferences, therapy goals, and personal factors.
              <span className="block mt-2 text-sm font-medium text-amber-700">
                The more information you provide, the better your matches will be.
              </span>
            </p>
            <div className="space-y-3">
              <Link href="/questionnaire">
                <Button variant="calm" size="lg">
                  Start X-Factor Questionnaire
                </Button>
              </Link>
              <p className="text-sm text-gray-500">Takes approximately 5-10 minutes • All fields are optional</p>
            </div>

            {/* Progress indicator */}
            <div className="mt-8 max-w-sm mx-auto">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Onboarding Progress</span>
                <span className="font-medium text-gray-900">{onboardingCompleted ? '50%' : '25%'}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-calm-500 transition-all duration-500"
                  style={{ width: onboardingCompleted ? '50%' : '25%' }}
                  role="progressbar"
                  aria-valuenow={onboardingCompleted ? 50 : 25}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits section */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-calm-100 flex items-center justify-center mx-auto mb-3">
                <BrainIcon className="w-6 h-6 text-calm-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Psychological Matching</h3>
              <p className="text-sm text-gray-600">Our algorithm considers therapeutic compatibility factors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-trust-100 flex items-center justify-center mx-auto mb-3">
                <ShieldIcon className="w-6 h-6 text-trust-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Insurance Support</h3>
              <p className="text-sm text-gray-600">Match with therapists who accept your health fund</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <VideoIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Flexible Sessions</h3>
              <p className="text-sm text-gray-600">Find therapists offering online or in-person sessions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading matches
  if (matchesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-600" role="status">
          <span className="sr-only">Loading matches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Matches</h1>
          <p className="text-gray-600 mt-1">
            {filterStats?.totalTherapists} therapists matched to your profile, sorted by compatibility
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
            aria-expanded={showFilters}
          >
            <FilterIcon className="w-4 h-4" />
            Filters
            {(sessionType !== 'all' || healthFundMatch) && (
              <span className="w-2 h-2 bg-calm-500 rounded-full" aria-label="Filters active" />
            )}
          </Button>
          <Link href="/questionnaire">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshIcon className="w-4 h-4" />
              Update X-Factor
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-gray-50">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Session Type */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Session Type:</span>
                <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden" role="group" aria-label="Session type filter">
                  {[
                    { value: 'all', label: 'All', count: filterStats?.totalTherapists },
                    { value: 'online', label: 'Online', count: filterStats?.onlineAvailable },
                    { value: 'inPerson', label: 'In-Person', count: filterStats?.inPersonAvailable },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSessionType(option.value as any)}
                      className={`px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-calm-500 ${
                        sessionType === option.value
                          ? 'bg-calm-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                      aria-pressed={sessionType === option.value}
                    >
                      {option.label} ({option.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Health Fund Match */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={healthFundMatch}
                  onChange={(e) => setHealthFundMatch(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-calm-600 focus:ring-calm-500"
                />
                <span className="text-sm text-gray-600">
                  My health fund only ({filterStats?.healthFundMatches})
                </span>
              </label>

              {/* Clear Filters */}
              {(sessionType !== 'all' || healthFundMatch) && (
                <button
                  onClick={() => {
                    setSessionType('all');
                    setHealthFundMatch(false);
                  }}
                  className="text-sm text-calm-600 hover:text-calm-700 focus:outline-none focus:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matches List */}
      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No matches found with current filters.</p>
            <Button
              variant="calm"
              onClick={() => {
                setSessionType('all');
                setHealthFundMatch(false);
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              expanded={expandedMatch === match.id}
              onToggleExpand={() =>
                setExpandedMatch(expandedMatch === match.id ? null : match.id)
              }
              onToggleFavorite={() =>
                toggleFavoriteMutation.mutate({ matchId: match.id })
              }
              onViewDetails={() => handleViewDetails(match)}
            />
          ))}
        </div>
      )}

      {/* How Matching Works */}
      <Card className="bg-gradient-to-r from-calm-50 to-trust-50 border-calm-200">
        <CardContent className="py-6">
          <h3 className="font-semibold text-gray-900 mb-3">How Our Matching Works</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-calm-100 flex items-center justify-center flex-shrink-0">
                <BrainIcon className="w-4 h-4 text-calm-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Therapeutic Compatibility (30%)</p>
                <p className="text-gray-600">Based on your X-Factor profile and psychological preferences</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-trust-100 flex items-center justify-center flex-shrink-0">
                <ShieldIcon className="w-4 h-4 text-trust-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Insurance Coverage (20%)</p>
                <p className="text-gray-600">Health fund compatibility for affordable care</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <VideoIcon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Availability & Location (15%)</p>
                <p className="text-gray-600">Session type preferences and location</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Personal Preferences (10%)</p>
                <p className="text-gray-600">Gender, language, and therapeutic approach</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Objective Fit (10%)</p>
                <p className="text-gray-600">Religious, cultural, and demographic alignment</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <HeartIcon className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Subjective Fit (15%)</p>
                <p className="text-gray-600">Communication style and emotional needs alignment</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Therapist Detail Modal */}
      <TherapistDetailModal
        match={selectedMatch}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

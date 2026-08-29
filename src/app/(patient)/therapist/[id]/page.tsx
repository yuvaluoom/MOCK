'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { AvatarDisplay } from '@/components/ui/image-cropper';
import Link from 'next/link';

// ============ ICONS ============

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const VideoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
);

const MapPinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const GraduationCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const BrainIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
  </svg>
);

const HeartHandshakeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
    <path d="m18 15-2-2" />
    <path d="m15 18-2-2" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-4 h-4 text-green-600" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const ShieldIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LanguagesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
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

// Match Score Ring Component
function MatchScoreRing({ score, size = 'lg' }: { score: number; size?: 'md' | 'lg' | 'xl' }) {
  const getScoreColor = (s: number) => {
    if (s >= 85) return { ring: 'stroke-green-500', text: 'text-green-600', bg: 'bg-green-50' };
    if (s >= 70) return { ring: 'stroke-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' };
    if (s >= 55) return { ring: 'stroke-cyan-500', text: 'text-cyan-600', bg: 'bg-cyan-50' };
    return { ring: 'stroke-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' };
  };

  const colors = getScoreColor(score);
  const sizes = {
    md: { container: 'w-20 h-20', text: 'text-xl', label: 'text-xs' },
    lg: { container: 'w-28 h-28', text: 'text-3xl', label: 'text-sm' },
    xl: { container: 'w-36 h-36', text: 'text-4xl', label: 'text-base' },
  };
  const sizeConfig = sizes[size];

  return (
    <div className={`relative ${sizeConfig.container}`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          className={`${colors.ring} transition-all duration-1000 ease-out`}
          strokeWidth="2.5"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${sizeConfig.text} font-bold ${colors.text}`}>{score}%</span>
        <span className={`${sizeConfig.label} ${colors.text} font-medium`}>Match</span>
      </div>
    </div>
  );
}

// Match Factor Indicator with visual bar
function MatchFactorIndicator({
  icon,
  label,
  score,
  color,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  color: string;
  description: string;
}) {
  const colorClasses: Record<string, { bg: string; fill: string; text: string }> = {
    calm: { bg: 'bg-calm-100', fill: 'bg-calm-500', text: 'text-calm-700' },
    trust: { bg: 'bg-trust-100', fill: 'bg-trust-500', text: 'text-trust-700' },
    green: { bg: 'bg-green-100', fill: 'bg-green-500', text: 'text-green-700' },
    purple: { bg: 'bg-purple-100', fill: 'bg-purple-500', text: 'text-purple-700' },
  };
  const colorConfig = colorClasses[color] || colorClasses.calm;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${colorConfig.bg}`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className={`text-sm font-bold ${colorConfig.text}`}>{score}%</span>
      </div>
      <div className={`h-2 rounded-full ${colorConfig.bg} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${colorConfig.fill} transition-all duration-700 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

// Match Reason Chip
function MatchReasonChip({ reason, index }: { reason: string; index: number }) {
  const colors = [
    'bg-green-50 text-green-700 border-green-200',
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-purple-50 text-purple-700 border-purple-200',
    'bg-cyan-50 text-cyan-700 border-cyan-200',
  ];
  const colorClass = colors[index % colors.length];

  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl border ${colorClass}`}>
      <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <span className="text-sm font-medium">{reason}</span>
    </div>
  );
}

// Generate intelligent match reasons based on data
function generateMatchReasons(therapist: any, matchBreakdown: any): string[] {
  const reasons: string[] = [];

  // Session type compatibility
  if (therapist.offersOnline && therapist.offersInPerson) {
    reasons.push('Flexible session types - Online and In-Person');
  } else if (therapist.offersOnline) {
    reasons.push('Offers convenient online sessions');
  }

  // Health fund match
  if (matchBreakdown?.healthFund >= 80) {
    reasons.push('Compatible with your health fund');
  }

  // Experience
  if (therapist.yearsOfExperience >= 10) {
    reasons.push('Over a decade of professional experience');
  } else if (therapist.yearsOfExperience >= 5) {
    reasons.push('Proven experience supporting patients');
  }

  // Specializations match
  if (therapist.specializations?.length > 0) {
    reasons.push('Specialization in areas relevant to your needs');
  }

  // X-Factor / Personal compatibility
  if (matchBreakdown?.xFactor >= 75) {
    reasons.push('High personal compatibility based on communication style');
  }

  // Approaches match
  if (therapist.approaches?.length > 0) {
    reasons.push('Therapeutic approaches suited to your preferences');
  }

  // Location
  if (therapist.city) {
    reasons.push(`Conveniently located - ${therapist.city}`);
  }

  // Availability
  if (matchBreakdown?.availability >= 70) {
    reasons.push('Availability that fits your schedule');
  }

  return reasons.slice(0, 5); // Return top 5 reasons
}

// Get match quality label
function getMatchQualityLabel(score: number): { text: string; color: string } {
  if (score >= 85) return { text: 'Excellent Match', color: 'bg-green-100 text-green-700 border-green-200' };
  if (score >= 70) return { text: 'Great Match', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  if (score >= 55) return { text: 'Good Match', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' };
  return { text: 'Moderate Match', color: 'bg-amber-100 text-amber-700 border-amber-200' };
}

// ============ MAIN PAGE ============

export default function TherapistDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const therapistId = params.id as string;

  // Fetch therapist details with match data
  const { data: therapistData, isLoading, error, isError } = trpc.patient.getTherapistDetails.useQuery(
    { therapistId },
    {
      enabled: !!therapistId,
      retry: 2,
      retryDelay: 500,
    }
  );

  // Debug logging for development
  if (process.env.NODE_ENV === 'development' && isError) {
    console.error('[TherapistPage] Error loading therapist:', error);
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-calm-600 mx-auto" />
          <p className="text-gray-600">Loading therapist profile...</p>
        </div>
      </div>
    );
  }

  // Error / Not found state
  if (error || !therapistData) {
    const errorMessage = error?.message || 'Unknown error';
    const isNotFound = errorMessage.includes('NOT_FOUND') || errorMessage.includes('not found');

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-red-600">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isNotFound ? 'Therapist Not Found' : 'Error Loading Profile'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isNotFound
                ? 'The requested therapist was not found in the system or is currently unavailable.'
                : 'An error occurred while loading the therapist profile. Please try again.'}
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <p className="text-xs text-red-500 mb-4 font-mono bg-red-50 p-2 rounded">
                {errorMessage}
              </p>
            )}
            <div className="space-y-3">
              <Button variant="calm" className="w-full" onClick={() => router.push('/matches')}>
                Back to Matches
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.back()}>
                Back to Previous Page
              </Button>
              {!isNotFound && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { therapist, matchScore, matchBreakdown, topReasons, insights } = therapistData;
  const fullName = `${therapist.firstName} ${therapist.lastName}`;
  const matchQuality = getMatchQualityLabel(matchScore);
  const matchReasons = topReasons?.length > 0 ? topReasons : generateMatchReasons(therapist, matchBreakdown);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back"
          >
            <ArrowRightIcon />
          </button>
          <h1 className="font-bold text-gray-900">Therapist Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ============ HERO SECTION ============ */}
        <Card className="overflow-hidden shadow-lg border-0">
          <div className="bg-gradient-to-bl from-calm-500 via-calm-600 to-trust-600 h-36 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          </div>
          <CardContent className="relative pt-0 -mt-16 pb-6">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-end">
              {/* Avatar */}
              <div className="bg-white p-1.5 rounded-2xl shadow-xl ring-4 ring-white flex-shrink-0">
                <AvatarDisplay
                  src={therapist.photoUrl}
                  name={fullName}
                  size="xl"
                />
              </div>

              {/* Name & Info */}
              <div className="flex-1 text-center sm:text-left pb-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                  <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${matchQuality.color}`}>
                    {matchQuality.text}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{therapist.title || 'Clinical Psychologist'}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
                  {therapist.city && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {therapist.city}
                    </span>
                  )}
                  <span>{therapist.yearsOfExperience || 5}+ years experience</span>
                </div>
              </div>

              {/* Match Score Circle */}
              <div className="flex-shrink-0 hidden sm:block">
                <MatchScoreRing score={matchScore} size="lg" />
              </div>
            </div>
            {/* Mobile Match Score */}
            <div className="sm:hidden flex justify-center mt-4">
              <MatchScoreRing score={matchScore} size="md" />
            </div>
          </CardContent>
        </Card>

        {/* ============ MATCH INTELLIGENCE SECTION ============ */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-calm-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-calm-500 to-trust-500 text-white">
                <SparklesIcon className="w-5 h-5" />
              </div>
              Why is {therapist.firstName} a good match for you?
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              The match is based on a comprehensive analysis of your profile, preferences, and needs
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Match Reasons */}
            <div className="grid sm:grid-cols-2 gap-3">
              {matchReasons.map((reason, index) => (
                <MatchReasonChip key={index} reason={reason} index={index} />
              ))}
            </div>

            {/* Match Breakdown */}
            {matchBreakdown && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BrainIcon className="w-4 h-4 text-calm-600" />
                  Match Score Breakdown
                </h4>
                <div className="grid sm:grid-cols-2 gap-6">
                  <MatchFactorIndicator
                    icon={<BrainIcon className="w-4 h-4 text-calm-600" />}
                    label="Personal Compatibility"
                    score={matchBreakdown.xFactor}
                    color="calm"
                    description="Based on communication style and personal preferences"
                  />
                  <MatchFactorIndicator
                    icon={<ShieldIcon className="w-4 h-4 text-trust-600" />}
                    label="Health Fund"
                    score={matchBreakdown.healthFund}
                    color="trust"
                    description="Compatible with your health insurance"
                  />
                  <MatchFactorIndicator
                    icon={<ClockIcon className="w-4 h-4 text-green-600" />}
                    label="Availability"
                    score={matchBreakdown.availability}
                    color="green"
                    description="Fits your schedule and session type preferences"
                  />
                  <MatchFactorIndicator
                    icon={<UserIcon className="w-4 h-4 text-purple-600" />}
                    label="Preferences"
                    score={matchBreakdown.preferences}
                    color="purple"
                    description="Gender, language, and therapeutic approach"
                  />
                </div>
              </div>
            )}

            {/* Insights */}
            {insights && insights.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {insights.map((insight: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium"
                  >
                    ✨ {insight}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============ QUICK STATS ============ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-0 shadow-md">
            <CardContent className="py-5 text-center">
              <div className="text-2xl font-bold text-gray-900">{therapist.yearsOfExperience || 5}+</div>
              <div className="text-sm text-gray-600">years experience</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="py-5 text-center">
              <div className="flex justify-center mb-1">
                <StarIcon />
              </div>
              <div className="text-sm text-gray-600">Recommended Therapist</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="py-5 text-center">
              <div className="flex justify-center gap-2 mb-1">
                {therapist.offersOnline && <VideoIcon className="w-5 h-5 text-green-600" />}
                {therapist.offersInPerson && <MapPinIcon className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="text-sm text-gray-600">
                {therapist.offersOnline && therapist.offersInPerson
                  ? 'Online + In-Person'
                  : therapist.offersOnline
                  ? 'Online'
                  : 'In-Person'}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="py-5 text-center">
              <div className="text-2xl font-bold text-gray-900">₪{therapist.sessionPrice || 400}</div>
              <div className="text-sm text-gray-600">per session</div>
            </CardContent>
          </Card>
        </div>

        {/* ============ ABOUT ============ */}
        {(therapist.bio || therapist.bioHebrew) && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {therapist.bioHebrew || therapist.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ============ PROFESSIONAL DETAILS ============ */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Education & Certifications */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCapIcon />
                Education &amp; Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(therapist.education || [
                'B.A. in Psychology',
                'M.A. in Clinical Psychology',
                'Licensed Clinical Psychologist - Ministry of Health',
              ]).map((edu: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{edu}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Languages */}
          {therapist.languages && therapist.languages.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LanguagesIcon />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {therapist.languages.map((lang: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Treatment Methods */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BrainIcon />
              Therapeutic approaches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(therapist.approaches || ['CBT', 'Psychodynamic', 'DBT', 'EMDR']).map((approach: string, i: number) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-calm-50 text-calm-700 rounded-xl text-sm font-medium border border-calm-200"
                >
                  {approach}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Areas of Expertise */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HeartHandshakeIcon />
              Areas of Specialization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(therapist.specializations || ['Anxiety', 'Depression', 'Eating Disorders', 'Trauma', 'Relationships']).map(
                (spec: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-trust-50 text-trust-700 rounded-xl text-sm font-medium border border-trust-200"
                  >
                    {spec.replace(/_/g, ' ')}
                  </span>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Health Funds */}
        {therapist.acceptedHealthFunds && therapist.acceptedHealthFunds.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldIcon />
                Health Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {therapist.acceptedHealthFunds.map((fund: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200"
                  >
                    {fund}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location */}
        {therapist.city && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPinIcon className="w-5 h-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 font-medium">{therapist.city}</p>
              {therapist.address && <p className="text-gray-500 text-sm mt-1">{therapist.address}</p>}
            </CardContent>
          </Card>
        )}

        {/* ============ CTA BUTTONS ============ */}
        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 -mx-4 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <Button variant="calm" className="flex-1 h-14 text-base font-medium gap-2 shadow-lg" asChild>
            <Link href={`/messages?therapist=${therapistId}`}>
              <MessageIcon />
              Send Message
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 h-14 text-base font-medium gap-2 bg-white shadow-md" asChild>
            <Link href={`/sessions`}>
              <CalendarIcon />
              Book Session
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

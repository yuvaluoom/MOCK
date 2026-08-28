'use client';

import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
}

// Fixed pixel dimensions — no scaling, no percentages
const sizeMap = {
  sm: { px: 24, fontSize: 13 },
  md: { px: 32, fontSize: 17 },
  lg: { px: 36, fontSize: 19 },
  xl: { px: 48, fontSize: 24 },
};

/**
 * MatchMind Logo — two head silhouettes facing each other with neural spark.
 *
 * Design: Clean side-profile heads mirrored across center, connected by
 * a glowing neural bridge representing the therapeutic match.
 *
 * Layout guarantees:
 * - SVG has explicit px width + height attrs AND inline style override
 * - .mm-logo-svg CSS class prevents Tailwind Preflight from applying max-width:100%/height:auto
 * - No hooks — no SSR/hydration mismatch risk
 * - Static gradient IDs per size variant — consistent across server and client renders
 * - All containers use inline-flex with explicit flex-shrink:0
 */
export function Logo({ size = 'md', showText = true, href, className = '' }: LogoProps) {
  const { px, fontSize } = sizeMap[size];

  // Static IDs per size — safe because each size is only one <defs> set
  const gradL = `mmL-${size}`;
  const gradR = `mmR-${size}`;
  const gradBridge = `mmBr-${size}`;

  const svgEl = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={px}
      height={px}
      className="mm-logo-svg"
      style={
        {
          '--mm-logo-size': `${px}px`,
          display: 'block',
          width: px,
          height: px,
          minWidth: px,
          minHeight: px,
          maxWidth: px,
          maxHeight: px,
          flexShrink: 0,
        } as React.CSSProperties
      }
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradL} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id={gradR} x1="1" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id={gradBridge} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* Left head — profile facing right */}
      <path
        d="M8 75 L8 55 C8 50 10 46 12 43 L14 38 C14 36 13 34 12 32 C10 28 10 24 12 20 C14 16 18 13 23 11 C28 9 33 10 37 13 C40 15 42 19 42 24 L42 28 C42 30 43 32 44 33 L46 36 C47 38 47 40 46 42 L43 47 C42 49 42 51 43 53 L46 58 L46 75 Z"
        fill={`url(#${gradL})`}
      />

      {/* Right head — profile facing left (mirrored) */}
      <path
        d="M92 75 L92 55 C92 50 90 46 88 43 L86 38 C86 36 87 34 88 32 C90 28 90 24 88 20 C86 16 82 13 77 11 C72 9 67 10 63 13 C60 15 58 19 58 24 L58 28 C58 30 57 32 56 33 L54 36 C53 38 53 40 54 42 L57 47 C58 49 58 51 57 53 L54 58 L54 75 Z"
        fill={`url(#${gradR})`}
      />

      {/* Neural connection bridge */}
      <line x1="46" y1="36" x2="54" y2="36" stroke={`url(#${gradBridge})`} strokeWidth="2" opacity="0.8" />
      <circle cx="50" cy="36" r="2.5" fill="white" opacity="0.9" />

      {/* Neural spark nodes */}
      <circle cx="46" cy="36" r="1.5" fill="white" opacity="0.7" />
      <circle cx="54" cy="36" r="1.5" fill="white" opacity="0.7" />

      {/* Inner mind dots — left */}
      <circle cx="25" cy="22" r="2" fill="white" opacity="0.5" />
      <circle cx="32" cy="26" r="1.5" fill="white" opacity="0.4" />
      <circle cx="28" cy="30" r="1.5" fill="white" opacity="0.3" />

      {/* Inner mind dots — right */}
      <circle cx="75" cy="22" r="2" fill="white" opacity="0.5" />
      <circle cx="68" cy="26" r="1.5" fill="white" opacity="0.4" />
      <circle cx="72" cy="30" r="1.5" fill="white" opacity="0.3" />
    </svg>
  );

  const inner = (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0, lineHeight: 1 }}
    >
      {svgEl}
      {showText && (
        <span style={{ fontWeight: 700, fontSize, lineHeight: 1, whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ color: '#38BDF8' }}>Match</span>
          <span style={{ color: '#8B5CF6' }}>Mind</span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}
        className="focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}

/**
 * Icon-only variant — for tight/favicon contexts.
 */
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="mm-logo-svg"
      style={
        {
          '--mm-logo-size': `${size}px`,
          display: 'block',
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          maxWidth: size,
          maxHeight: size,
          flexShrink: 0,
        } as React.CSSProperties
      }
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="mmIconL" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="mmIconR" x1="1" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      {/* Left head — profile facing right */}
      <path
        d="M8 75 L8 55 C8 50 10 46 12 43 L14 38 C14 36 13 34 12 32 C10 28 10 24 12 20 C14 16 18 13 23 11 C28 9 33 10 37 13 C40 15 42 19 42 24 L42 28 C42 30 43 32 44 33 L46 36 C47 38 47 40 46 42 L43 47 C42 49 42 51 43 53 L46 58 L46 75 Z"
        fill="url(#mmIconL)"
      />

      {/* Right head — profile facing left (mirrored) */}
      <path
        d="M92 75 L92 55 C92 50 90 46 88 43 L86 38 C86 36 87 34 88 32 C90 28 90 24 88 20 C86 16 82 13 77 11 C72 9 67 10 63 13 C60 15 58 19 58 24 L58 28 C58 30 57 32 56 33 L54 36 C53 38 53 40 54 42 L57 47 C58 49 58 51 57 53 L54 58 L54 75 Z"
        fill="url(#mmIconR)"
      />

      {/* Neural connection */}
      <circle cx="50" cy="36" r="3" fill="white" opacity="0.9" />
      <line x1="46" y1="36" x2="54" y2="36" stroke="white" strokeWidth="2" opacity="0.7" />
    </svg>
  );
}

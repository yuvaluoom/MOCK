import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TRPCProvider } from '@/lib/trpc/provider';
import { AccessibilityMenu } from '@/components/accessibility/AccessibilityMenu';
import { CookieConsent } from '@/components/CookieConsent';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'MatchMind - Find Your Ideal Therapist',
  description:
    'Science-based platform for matching therapists and patients. Find the right therapist for you through personalized compatibility analysis.',
  keywords: ['mental health', 'psychologist', 'therapist', 'matching', 'therapy'],
  authors: [{ name: 'MatchMind' }],
  openGraph: {
    title: 'MatchMind - Find Your Ideal Therapist',
    description: 'Science-based platform for matching therapists and patients',
    type: 'website',
    locale: 'en_US',
  },
  metadataBase: new URL('https://matchmind.co.il'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-calm-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <TRPCProvider>
          <div id="main-content">
            {children}
          </div>
          <AccessibilityMenu />
          <CookieConsent />
        </TRPCProvider>
      </body>
    </html>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import dynamic from 'next/dynamic';

// Dynamically import AccessibilityMenu to prevent SSR issues
const AccessibilityMenu = dynamic(
  () => import('@/components/accessibility/AccessibilityMenu').then(mod => mod.AccessibilityMenu),
  { ssr: false }
);

// Icons (inline SVG for landing page - no external dependencies)
const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
);

const BrainIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
    <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
    <path d="M6 18a4 4 0 0 1-1.967-.516" />
    <path d="M19.967 17.484A4 4 0 0 1 18 18" />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-calm-600"
    aria-hidden="true"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const features = [
  {
    icon: BrainIcon,
    title: 'התאמה מבוססת מדע',
    description: 'מערכת ההתאמה שלנו מבוססת על מחקרים פסיכולוגיים ונתונים קליניים לזיהוי ההתאמה הטיפולית הטובה ביותר.',
  },
  {
    icon: ShieldIcon,
    title: 'פרטיות ואבטחה',
    description: 'המידע שלך מוגן בהתאם לתקנות הפרטיות המחמירות ביותר. הנתונים מוצפנים ומאובטחים.',
  },
  {
    icon: HeartIcon,
    title: 'התאמה אישית מלאה',
    description: 'השאלון שלנו מזהה את הצרכים הייחודיים שלך ומתאים מטפלים על סמך סגנון טיפול, התמחות וזמינות.',
  },
  {
    icon: UsersIcon,
    title: 'מטפלים מוסמכים',
    description: 'כל המטפלים בפלטפורמה עוברים תהליך אימות קפדני ובעלי רישיון מקצועי בתוקף.',
  },
];

const steps = [
  {
    number: '1',
    title: 'מלאו שאלון קצר',
    description: 'שאלון אנונימי שמסייע לנו להבין את הצרכים והעדפות שלכם',
  },
  {
    number: '2',
    title: 'קבלו התאמות מותאמות',
    description: 'מערכת ההתאמה שלנו מציגה מטפלים עם אחוזי התאמה גבוהים',
  },
  {
    number: '3',
    title: 'בחרו ותאמו פגישה',
    description: 'בחרו את המטפל המתאים וקבעו פגישה ראשונית בזמן הנוח לכם',
  },
];

export default function LandingPage() {
  const [showAccessibility, setShowAccessibility] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Logo size="lg" href="/" />

          {/* Therapist Login - Side button as per spec */}
          <Link href="/login/therapist">
            <Button variant="outline" size="sm">
              כניסה למטפלים
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main id="main-content" className="pt-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-calm-100 text-calm-700 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-calm-500 animate-pulse" aria-hidden="true" />
              התאמה מבוססת מדע
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              מצאו את המטפל
              <span className="text-gradient block">המתאים לכם</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              פלטפורמה חכמה להתאמת מטופלים ומטפלים על בסיס פרמטרים קליניים, סגנון טיפולי והעדפות אישיות
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Primary Patient Login - Large central button as per spec */}
              <Link href="/login/patient">
                <Button variant="calm" size="xl" className="w-full sm:w-auto min-w-[200px] shadow-lg shadow-calm-500/25">
                  התחילו עכשיו
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="xl" className="w-full sm:w-auto min-w-[200px]">
                  איך זה עובד?
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircleIcon />
                <span>חינם לחלוטין</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon />
                <span>ללא התחייבות</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon />
                <span>תמיכה בקופות חולים</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                למה MatchMind?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                אנחנו מאמינים שהתאמה נכונה בין מטופל למטפל היא המפתח להצלחת הטיפול
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-calm-100 flex items-center justify-center text-calm-600 mb-4">
                      <feature.icon />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-calm-50/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                איך זה עובד?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                שלושה צעדים פשוטים למציאת המטפל המתאים לכם
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative text-center">
                    {/* Connector line (hidden on mobile) */}
                    {index < steps.length - 1 && (
                      <div
                        className="hidden md:block absolute top-8 -left-4 w-8 h-0.5 bg-calm-200"
                        aria-hidden="true"
                      />
                    )}

                    {/* Step number */}
                    <div className="w-16 h-16 rounded-full bg-calm-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-calm-500/25">
                      {step.number}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="text-center mt-12">
              <Link href="/login/patient">
                <Button variant="calm" size="lg">
                  התחילו את השאלון
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Health Fund Support Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-trust-50 rounded-2xl p-8 md:p-12 text-center">
              <div className="w-12 h-12 rounded-lg bg-trust-100 flex items-center justify-center text-trust-600 mx-auto mb-4">
                <ShieldIcon />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                תמיכה בכל קופות החולים
              </h2>
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                אם אתם זכאים לטיפול דרך קופת החולים שלכם, מערכת ההתאמה שלנו תעדיף מטפלים שעובדים עם הקופה שלכם - מבלי להתפשר על איכות ההתאמה הטיפולית.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span className="px-4 py-2 bg-white rounded-full shadow-sm">כללית</span>
                <span className="px-4 py-2 bg-white rounded-full shadow-sm">מכבי</span>
                <span className="px-4 py-2 bg-white rounded-full shadow-sm">מאוחדת</span>
                <span className="px-4 py-2 bg-white rounded-full shadow-sm">לאומית</span>
                <span className="px-4 py-2 bg-white rounded-full shadow-sm">פרטי</span>
              </div>
            </div>
          </div>
        </section>

        {/* Therapist CTA Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                אתם מטפלים?
              </h2>
              <p className="text-gray-600 mb-6">
                הצטרפו לפלטפורמה והתחילו לקבל מטופלים שמתאימים לסגנון הטיפול והתמחות שלכם
              </p>
              <Link href="/register/therapist">
                <Button variant="outline" size="lg">
                  הצטרפו כמטפלים
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <Logo size="lg" href="/" />
              </div>
              <p className="text-sm max-w-sm">
                פלטפורמה מבוססת מדע להתאמת מטופלים ומטפלים בתחום בריאות הנפש.
                אנחנו מאמינים שהתאמה נכונה היא הבסיס לטיפול מוצלח.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">קישורים מהירים</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/login/patient" className="hover:text-white transition-colors">
                    כניסה למטופלים
                  </Link>
                </li>
                <li>
                  <Link href="/login/therapist" className="hover:text-white transition-colors">
                    כניסה למטפלים
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    אודות
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    צור קשר
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">משפטי</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    מדיניות פרטיות
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    תנאי שימוש
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className="hover:text-white transition-colors">
                    נגישות
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} MatchMind. כל הזכויות שמורות.</p>
            <p>
              פותח באהבה בישראל 🇮🇱
            </p>
          </div>
        </div>
      </footer>

      {/* Accessibility Menu Component */}
      <AccessibilityMenu />
    </div>
  );
}

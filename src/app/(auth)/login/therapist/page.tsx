'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { Logo } from '@/components/ui/Logo';

export default function TherapistLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Set mock session cookie so tRPC context recognizes therapist role
      document.cookie = `next-auth.session-token=${encodeURIComponent(JSON.stringify({ role: 'THERAPIST' }))};path=/;samesite=lax;max-age=${7 * 24 * 60 * 60}`;
      router.push('/therapist/dashboard');
    } catch (err) {
      setError('אירעה שגיאה, נסו שוב');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo size="lg" href="/" />
        <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          אזור מטפלים
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">כניסת מטפלים</CardTitle>
            <CardDescription>
              התחברו לחשבון המטפל שלכם
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social Auth Buttons */}
            <SocialAuthButtons
              callbackUrl="/therapist/dashboard"
              mode="signin"
              language="he"
            />

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">סיסמה</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    שכחתם סיסמה?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  dir="ltr"
                />
              </div>

              <Button
                type="submit"
                variant="calm"
                className="w-full"
                loading={isLoading}
              >
                התחברות
              </Button>
            </form>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              רוצים להצטרף כמטפלים?{' '}
              <Link
                href="/register/therapist"
                className="text-primary hover:underline font-medium"
              >
                הרשמה עכשיו
              </Link>
            </p>

            {/* Patient Login Link */}
            <p className="mt-4 text-center text-sm text-muted-foreground">
              מחפשים מטפל/ת?{' '}
              <Link
                href="/login/patient"
                className="text-primary hover:underline"
              >
                כניסת מטופלים
              </Link>
            </p>

            {/* Demo mode notice */}
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700 text-center">
                <strong>מצב הדגמה:</strong> הכניסו כל אימייל להתחברות
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
        <p>
          בהתחברות אתם מסכימים ל
          <Link href="/terms" className="underline mx-1">
            תנאי השימוש
          </Link>
          ול
          <Link href="/privacy" className="underline mx-1">
            מדיניות הפרטיות
          </Link>
        </p>
      </footer>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc/client';

const specializations = [
  { value: 'ANXIETY', label: 'Anxiety' },
  { value: 'DEPRESSION', label: 'Depression' },
  { value: 'TRAUMA_PTSD', label: 'Trauma & PTSD' },
  { value: 'RELATIONSHIPS', label: 'Relationships' },
  { value: 'STRESS_MANAGEMENT', label: 'Stress Management' },
  { value: 'MILITARY_VETERANS', label: 'Military & Veterans' },
  { value: 'CHILDREN_ADOLESCENTS', label: 'Children & Adolescents' },
  { value: 'COUPLES', label: 'Couples Therapy' },
  { value: 'FAMILY', label: 'Family Therapy' },
  { value: 'ADDICTION', label: 'Addiction' },
];

const approaches = [
  { value: 'CBT', label: 'Cognitive Behavioral Therapy (CBT)' },
  { value: 'DBT', label: 'Dialectical Behavior Therapy (DBT)' },
  { value: 'PSYCHODYNAMIC', label: 'Psychodynamic' },
  { value: 'HUMANISTIC', label: 'Humanistic' },
  { value: 'EMDR', label: 'EMDR' },
  { value: 'INTEGRATIVE', label: 'Integrative' },
  { value: 'ART_THERAPY', label: 'Art Therapy' },
];

const healthFunds = [
  { value: 'CLALIT', label: 'Clalit' },
  { value: 'MACCABI', label: 'Maccabi' },
  { value: 'MEUHEDET', label: 'Meuhedet' },
  { value: 'LEUMIT', label: 'Leumit' },
  { value: 'PRIVATE', label: 'Private Only' },
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    bio: '',
    city: '',
    address: '',
    yearsOfExperience: '',
    sessionPrice: '',
    sessionDuration: '50',
    offersOnline: true,
    offersInPerson: true,
    selectedSpecializations: [] as string[],
    selectedApproaches: [] as string[],
    selectedHealthFunds: [] as string[],
    languages: ['en'],
  });

  const updateProfileMutation = trpc.therapist.updateProfile.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleSelection = (field: 'selectedSpecializations' | 'selectedApproaches' | 'selectedHealthFunds', value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateProfileMutation.mutateAsync({
        bio: form.bio,
        city: form.city,
        address: form.address,
        yearsOfExperience: parseInt(form.yearsOfExperience) || 0,
        sessionPrice: parseInt(form.sessionPrice) || 0,
        sessionDuration: parseInt(form.sessionDuration) || 50,
        offersOnline: form.offersOnline,
        offersInPerson: form.offersInPerson,
        specializations: form.selectedSpecializations,
        approaches: form.selectedApproaches,
        acceptedHealthFunds: form.selectedHealthFunds,
        languages: form.languages,
      });
      router.push('/therapist/pending-approval');
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return form.bio.length >= 50 && form.city && form.yearsOfExperience;
    if (step === 2) return form.selectedSpecializations.length > 0 && form.selectedApproaches.length > 0;
    if (step === 3) return form.sessionPrice && form.selectedHealthFunds.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-calm-500 to-trust-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MatchMind</span>
          </Link>
          <span className="text-sm text-muted-foreground">Complete Your Profile</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s < step ? 'bg-calm-600 text-white' :
                    s === step ? 'bg-calm-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                <span className={`ml-2 text-sm ${s === step ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {s === 1 ? 'Basic Info' : s === 2 ? 'Expertise' : 'Pricing'}
                </span>
                {s < 3 && <div className={`w-16 h-0.5 mx-4 ${s < step ? 'bg-calm-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription className="text-sm">Tell us about yourself and your practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="bio" className="text-sm">Professional Bio *</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe your therapeutic approach, experience, and what clients can expect..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <p className="text-xs text-gray-500">{form.bio.length}/50 characters minimum</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="city" className="text-sm">City *</Label>
                    <Input id="city" name="city" value={form.city} onChange={handleChange} placeholder="Tel Aviv" className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="yearsOfExperience" className="text-sm">Years Exp. *</Label>
                    <Input id="yearsOfExperience" name="yearsOfExperience" type="number" value={form.yearsOfExperience} onChange={handleChange} placeholder="5" className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="address" className="text-sm">Office Address</Label>
                    <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="Optional" className="h-9" />
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="offersOnline" checked={form.offersOnline} onChange={handleChange} className="w-4 h-4 rounded border-gray-300" />
                    <span className="text-sm">Online sessions</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="offersInPerson" checked={form.offersInPerson} onChange={handleChange} className="w-4 h-4 rounded border-gray-300" />
                    <span className="text-sm">In-person sessions</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Expertise */}
          {step === 2 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Expertise & Specializations</CardTitle>
                <CardDescription className="text-sm">Select your areas of expertise and approaches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Specializations * (select at least one)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {specializations.map((spec) => (
                      <button
                        key={spec.value}
                        type="button"
                        onClick={() => toggleSelection('selectedSpecializations', spec.value)}
                        className={`px-2 py-1.5 text-xs rounded-md border text-left transition-colors ${
                          form.selectedSpecializations.includes(spec.value)
                            ? 'bg-calm-50 border-calm-500 text-calm-700'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {spec.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Therapeutic Approaches * (select at least one)</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {approaches.map((approach) => (
                      <button
                        key={approach.value}
                        type="button"
                        onClick={() => toggleSelection('selectedApproaches', approach.value)}
                        className={`px-2 py-1.5 text-xs rounded-md border text-left transition-colors ${
                          form.selectedApproaches.includes(approach.value)
                            ? 'bg-calm-50 border-calm-500 text-calm-700'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {approach.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Pricing & Insurance */}
          {step === 3 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Insurance & Payment</CardTitle>
                <CardDescription className="text-sm">Configure how patients can pay for sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* HMO/Kupot Holim Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Health Funds - Health Funds (HMO)</Label>
                  <p className="text-xs text-gray-500">Select which health funds you accept. Patients with these funds pay 0 directly.</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {healthFunds.filter(f => f.value !== 'PRIVATE').map((fund) => (
                      <button
                        key={fund.value}
                        type="button"
                        onClick={() => toggleSelection('selectedHealthFunds', fund.value)}
                        className={`px-3 py-2 text-sm rounded-md border text-left transition-colors flex items-center gap-2 ${
                          form.selectedHealthFunds.includes(fund.value)
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                          form.selectedHealthFunds.includes(fund.value) ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`}>
                          {form.selectedHealthFunds.includes(fund.value) && <span className="text-white text-xs">✓</span>}
                        </span>
                        {fund.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Private Payment Section */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Private Patients</Label>
                      <p className="text-xs text-gray-500">Accept patients paying out-of-pocket</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSelection('selectedHealthFunds', 'PRIVATE')}
                      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        form.selectedHealthFunds.includes('PRIVATE')
                          ? 'bg-calm-50 border-calm-500 text-calm-700'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {form.selectedHealthFunds.includes('PRIVATE') ? '✓ Accepting' : 'Enable'}
                    </button>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div className="space-y-1">
                    <Label htmlFor="sessionPrice" className="text-sm">Private Session Price (₪) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₪</span>
                      <Input id="sessionPrice" name="sessionPrice" type="number" value={form.sessionPrice} onChange={handleChange} placeholder="450" className="h-9 pl-8" />
                    </div>
                    <p className="text-xs text-gray-500">For private/out-of-pocket patients</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sessionDuration" className="text-sm">Session Duration</Label>
                    <select
                      id="sessionDuration"
                      name="sessionDuration"
                      value={form.sessionDuration}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="50">50 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                </div>

                {/* Summary */}
                {form.selectedHealthFunds.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Payment Summary:</p>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      {form.selectedHealthFunds.filter(f => f !== 'PRIVATE').length > 0 && (
                        <li className="flex items-center gap-1">
                          <span className="text-green-500">●</span>
                          HMO patients: Covered by {form.selectedHealthFunds.filter(f => f !== 'PRIVATE').join(', ')}
                        </li>
                      )}
                      {form.selectedHealthFunds.includes('PRIVATE') && (
                        <li className="flex items-center gap-1">
                          <span className="text-blue-500">●</span>
                          Private patients: ₪{form.sessionPrice || '—'} per session
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Back
            </Button>

            {step < 3 ? (
              <Button variant="calm" size="sm" onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
                Continue
              </Button>
            ) : (
              <Button variant="calm" size="sm" onClick={handleSubmit} disabled={!canProceed() || isSubmitting} loading={isSubmitting}>
                Submit for Approval
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

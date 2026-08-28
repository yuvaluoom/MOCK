'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';

const healthFunds = [
  { value: '', label: 'Select health fund' },
  { value: 'CLALIT', label: 'Clalit' },
  { value: 'MACCABI', label: 'Maccabi' },
  { value: 'MEUHEDET', label: 'Meuhedet' },
  { value: 'LEUMIT', label: 'Leumit' },
  { value: 'PRIVATE', label: 'Private only' },
];

export default function ProfilePage() {
  const { data: profile, isLoading } = trpc.patient.getProfile.useQuery();
  const updateMutation = trpc.patient.updateProfile.useMutation();
  const updatePrefMutation = trpc.patient.updatePreferences.useMutation();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    healthFund: '',
    preferredOnline: true,
    preferredGender: '',
  });
  const [saved, setSaved] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        city: profile.city ?? '',
        healthFund: profile.healthFund ?? '',
        preferredOnline: profile.preferredOnline ?? true,
        preferredGender: profile.preferredGender ?? '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Update profile
    await updateMutation.mutateAsync({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      city: form.city,
      healthFund: form.healthFund as 'CLALIT' | 'MACCABI' | 'MEUHEDET' | 'LEUMIT' | 'PRIVATE' | undefined,
    });

    // Update preferences (only gender for now)
    if (form.preferredGender) {
      await updatePrefMutation.mutateAsync({
        preferredGender: form.preferredGender as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null | undefined,
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-600">Update your information and preferences</p>
        </div>
        <Link href="/questionnaire">
          <Button variant="outline" size="sm">Update X-Factor</Button>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Personal info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-sm">First Name</Label>
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} className="h-9" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} disabled className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-sm">Phone</Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city" className="text-sm">City</Label>
                <Input id="city" name="city" value={form.city} onChange={handleChange} className="h-9" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Treatment Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="healthFund" className="text-sm">Health Fund</Label>
                <select
                  id="healthFund"
                  name="healthFund"
                  value={form.healthFund}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {healthFunds.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="preferredGender" className="text-sm">Therapist Gender</Label>
                <select
                  id="preferredGender"
                  name="preferredGender"
                  value={form.preferredGender}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">No preference</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="preferredOnline"
                name="preferredOnline"
                checked={form.preferredOnline}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-calm-600 focus:ring-calm-500"
              />
              <span className="text-sm">I prefer online therapy</span>
            </label>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            variant="calm"
            loading={updateMutation.isPending || updatePrefMutation.isPending}
          >
            Save Changes
          </Button>
          {saved && <span className="text-sm text-green-600">Saved successfully</span>}
        </div>
      </form>
    </div>
  );
}

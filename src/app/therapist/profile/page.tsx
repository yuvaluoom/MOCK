'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfilePhotoUpload } from '@/components/therapist/ProfilePhotoUpload';
import { CropData } from '@/components/ui/image-cropper';

export default function TherapistProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);

  const handlePhotoChange = useCallback((blob: Blob | null, cropData: CropData | null) => {
    setPhotoBlob(blob);
    // In production, upload to server here
    console.log('Photo changed:', { blob, cropData });
  }, []);

  // Mock profile data
  const profile = {
    firstName: 'רונית',
    lastName: 'שפירא',
    title: 'ד״ר',
    email: 'ronit.shapira@example.com',
    phone: '052-1234567',
    licenseNumber: 'PSY-12345',
    specialization: 'פסיכולוגיה קלינית',
    yearsOfExperience: 12,
    bio: 'פסיכולוגית קלינית עם התמחות בטיפול קוגניטיבי-התנהגותי (CBT). בעלת ניסיון רב בטיפול בחרדות, דיכאון והפרעות חרדה.',
    approaches: ['CBT', 'DBT', 'טיפול דינמי'],
    specializations: ['חרדות', 'דיכאון', 'הפרעות אכילה'],
    languages: ['עברית', 'אנגלית'],
    acceptedHealthFunds: ['כללית', 'מכבי'],
    sessionPrice: 450,
    sessionDuration: 50,
    photoUrl: null as string | null,
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">הפרופיל שלי</h1>
          <p className="text-gray-600 mt-1">ניהול הפרטים והמידע המקצועי שלך</p>
        </div>
        <Button
          variant={isEditing ? 'calm' : 'outline'}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'שמור שינויים' : 'עריכה'}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <ProfilePhotoUpload
                currentPhotoUrl={profile.photoUrl}
                onPhotoChange={handlePhotoChange}
                name={`${profile.firstName} ${profile.lastName}`}
                size="xl"
                language="he"
                disabled={!isEditing}
              />
              <h2 className="text-xl font-bold text-gray-900 mt-4">
                {profile.title} {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-500">{profile.specialization}</p>
              <p className="text-sm text-gray-400 mt-1">{profile.yearsOfExperience} שנות ניסיון</p>
            </div>

            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600" dir="ltr">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-600" dir="ltr">{profile.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-gray-600">רישיון: {profile.licenseNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>מידע מקצועי</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bio */}
            <div>
              <Label>אודות</Label>
              {isEditing ? (
                <textarea
                  className="w-full mt-2 p-3 border rounded-lg text-sm"
                  rows={3}
                  defaultValue={profile.bio}
                />
              ) : (
                <p className="text-gray-600 text-sm mt-2">{profile.bio}</p>
              )}
            </div>

            {/* Approaches */}
            <div>
              <Label>גישות טיפוליות</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.approaches.map((approach) => (
                  <span key={approach} className="px-3 py-1 bg-calm-100 text-calm-700 text-sm rounded-full">
                    {approach}
                  </span>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div>
              <Label>התמחויות</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.specializations.map((spec) => (
                  <span key={spec} className="px-3 py-1 bg-trust-100 text-trust-700 text-sm rounded-full">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Insurance & Payment Section */}
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                ביטוח ותשלום
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* HMO Section */}
                <div className="bg-green-50 rounded-lg p-4">
                  <Label className="text-green-800 font-medium">קופות חולים (HMO)</Label>
                  <p className="text-xs text-green-600 mt-1">מטופלים עם קופות אלו משלמים 0 ישירות</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.acceptedHealthFunds.map((fund) => (
                      <span key={fund} className="px-3 py-1 bg-white text-green-700 text-sm rounded-full border border-green-200">
                        {fund}
                      </span>
                    ))}
                    {isEditing && (
                      <button className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full border border-dashed border-green-400 hover:bg-green-200">
                        + הוסף קופה
                      </button>
                    )}
                  </div>
                </div>

                {/* Private Payment Section */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <Label className="text-blue-800 font-medium">תשלום פרטי</Label>
                  <p className="text-xs text-blue-600 mt-1">עבור מטופלים המשלמים מכיסם</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">מחיר פגישה:</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">₪</span>
                          <Input type="number" defaultValue={profile.sessionPrice} className="w-24 h-8" />
                        </div>
                      ) : (
                        <span className="font-medium text-blue-900">₪{profile.sessionPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">משך פגישה:</span>
                      {isEditing ? (
                        <select className="h-8 px-2 border rounded text-sm">
                          <option value="45">45 דקות</option>
                          <option value="50" selected>50 דקות</option>
                          <option value="60">60 דקות</option>
                        </select>
                      ) : (
                        <span className="font-medium text-blue-900">{profile.sessionDuration} דקות</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700 mb-2">סיכום אפשרויות תשלום:</p>
                <div className="grid grid-cols-2 gap-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>מטופלי {profile.acceptedHealthFunds.join(', ')}: ללא תשלום</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>מטופלים פרטיים: ₪{profile.sessionPrice} לפגישה</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

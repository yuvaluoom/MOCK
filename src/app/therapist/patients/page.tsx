'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function TherapistPatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock patient data
  const patients = [
    { id: '1', name: 'ישראל ישראלי', status: 'active', lastSession: '2024-02-01', nextSession: '2024-02-08' },
    { id: '2', name: 'שרה כהן', status: 'active', lastSession: '2024-01-28', nextSession: '2024-02-05' },
    { id: '3', name: 'דוד לוי', status: 'active', lastSession: '2024-01-25', nextSession: '2024-02-10' },
    { id: '4', name: 'מרים אברהם', status: 'inactive', lastSession: '2024-01-10', nextSession: null },
  ];

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">המטופלים שלי</h1>
          <p className="text-gray-600 mt-1">{patients.length} מטופלים רשומים</p>
        </div>
        <Input
          placeholder="חיפוש מטופל..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">רשימת מטופלים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-calm-100 flex items-center justify-center">
                    <span className="text-calm-700 font-medium text-lg">
                      {patient.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-500">
                      פגישה אחרונה: {new Date(patient.lastSession).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    patient.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {patient.status === 'active' ? 'פעיל' : 'לא פעיל'}
                  </span>
                  <button className="text-sm text-calm-600 hover:text-calm-700 font-medium">
                    פרטים
                  </button>
                </div>
              </div>
            ))}

            {filteredPatients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                לא נמצאו מטופלים
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
